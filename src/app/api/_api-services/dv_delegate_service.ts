// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import {
	ENetwork,
	EProposalStatus,
	EVoteDecision,
	EPostOrigin,
	IDVCohort,
	IDVDelegateVoteStats,
	IDVReferendumInfluence,
	IDVDelegateVote,
	IDVDelegateVotingMatrix,
	IDVDelegateWithStats,
	IOnChainPostListing,
	IProfileVote,
	EDVDelegateType,
	EDVTrackFilter,
	EInfluenceStatus,
	IStatusHistoryItem,
	IVoteMetrics,
	EProposalType
} from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';

type ProposalWithTally = {
	tally?: {
		ayes: number;
		nays: number;
	};
	voteMetrics?: {
		aye: { value: number };
		nay: { value: number };
	};
};
export class DVDelegateService {
	private static async fetchAllPages<T>(fetcher: (page: number) => Promise<T[]>, maxPages = 10, page = 1, acc: T[] = []): Promise<T[]> {
		if (page > maxPages) return acc;
		const items = await fetcher(page);
		if (items.length === 0) return acc;
		return this.fetchAllPages(fetcher, maxPages, page + 1, [...acc, ...items]);
	}

	private static getDelegatesByType(cohort: IDVCohort, type: EDVDelegateType) {
		return cohort.delegates.filter((d) => d.type === type);
	}

	static async getCohortReferenda(
		network: ENetwork,
		cohort: IDVCohort,
		allowedTracks: EPostOrigin[] | null = null
	): Promise<
		{
			index: number;
			status: EProposalStatus;
			origin: string;
			description: string;
			voteMetrics: Partial<IVoteMetrics>;
			createdAtBlock?: number;
			updatedAtBlock?: number;
			timeline?: IStatusHistoryItem[];
		}[]
	> {
		const { startBlock, endBlock } = cohort;
		const latestBlock = await OnChainDbService.GetLatestBlockNumber(network);

		const delegateAddresses = cohort.delegates.map((d) => d.address);
		const votedProposalsPromise = this.fetchAllPages<IOnChainPostListing>(async (page) => {
			const votesListing = await OnChainDbService.GetVotesForAddressesAndReferenda({
				network,
				voters: delegateAddresses,
				startBlock,
				endBlock: endBlock || latestBlock,
				limit: 1000,
				page
			});

			return (
				votesListing.items?.map((vote) => {
					const proposal = vote.proposal as ProposalWithTally;
					if (proposal && proposal.tally) {
						proposal.voteMetrics = {
							aye: { value: proposal.tally.ayes },
							nay: { value: proposal.tally.nays }
						};
					}
					return proposal as IOnChainPostListing;
				}) || []
			);
		}, 1000);

		const votedProposals = await votedProposalsPromise;

		const recentProposalsMap = new Map<number, IOnChainPostListing>();
		if (!allowedTracks) return [];
		const trackIds = allowedTracks
			.map((track) => {
				const trackDetails = NETWORKS_DETAILS[network]?.trackDetails;
				return trackDetails?.[track]?.trackId;
			})
			.filter((id) => id !== undefined) as number[];

		const recentProposalsPromises = trackIds.map(async (trackId) => {
			try {
				const activeProposals = await OnChainDbService.GetActiveProposalListingsWithVoteForAddressByTrackId({
					network,
					trackId,
					voterAddress: ''
				});

				return activeProposals.items || [];
			} catch (error) {
				console.warn(`Failed to fetch proposals for track ${trackId}:`, error);
				return [];
			}
		});

		const recentProposalsResults = await Promise.all(recentProposalsPromises);
		recentProposalsResults.flat().forEach((proposal) => {
			if (proposal.index !== undefined) {
				const p = proposal as ProposalWithTally;

				if (p.tally) {
					p.voteMetrics = {
						aye: { value: p.tally.ayes },
						nay: { value: p.tally.nays }
					};
				}

				recentProposalsMap.set(proposal.index, proposal);
			}
		});

		const allItemsMap = new Map<number, IOnChainPostListing>();
		votedProposals.forEach((item) => {
			if (item && item.index !== undefined && !allItemsMap.has(item.index)) {
				allItemsMap.set(item.index, item);
			}
		});

		recentProposalsMap.forEach((proposal, index) => {
			if (!allItemsMap.has(index)) {
				allItemsMap.set(index, proposal);
			}
		});

		let allProposals = Array.from(allItemsMap.values());

		const missingMetricsIndices = allProposals
			.filter((p) => !p.voteMetrics || !p.voteMetrics.aye)
			.map((p) => p.index)
			.filter((index): index is number => index !== undefined);

		if (missingMetricsIndices.length > 0) {
			try {
				const metricsMap = await OnChainDbService.GetVoteMetricsForProposals({
					network,
					proposalIndices: missingMetricsIndices,
					proposalType: EProposalType.REFERENDUM_V2
				});

				allProposals = allProposals.map((p: IOnChainPostListing) => {
					if (p.index !== undefined && metricsMap.has(p.index)) {
						const tally = metricsMap.get(p.index);
						if (!tally) return p;
						return {
							...p,
							voteMetrics: {
								aye: { value: tally.ayes, count: 0 },
								nay: { value: tally.nays, count: 0 },
								support: { value: tally.support },
								bareAyes: { value: tally.ayes }
							}
						};
					}
					return p;
				});
			} catch (error) {
				console.error('Error fetching missing vote metrics:', error);
			}
		}

		return allProposals
			.filter((r) => {
				if (allowedTracks && r.origin && !allowedTracks.includes(r.origin as EPostOrigin)) return false;

				const end = endBlock || latestBlock;
				const proposalStart = r.createdAtBlock || 0;
				const proposalEnd = r.updatedAtBlock || 0;
				const isOngoingCohort = !endBlock;

				if (!r.createdAtBlock && !r.updatedAtBlock) {
					return isOngoingCohort;
				}

				if (isOngoingCohort) {
					return true;
				}

				if (proposalEnd > 0) {
					return proposalEnd >= startBlock && proposalEnd <= end;
				}

				return proposalStart <= end;
			})
			.map((r) => ({
				index: r.index || 0,
				status: r.status,
				origin: r.origin,
				description: r.description,
				voteMetrics: (r.voteMetrics || {}) as Partial<IVoteMetrics>,
				createdAtBlock: r.createdAtBlock,
				updatedAtBlock: r.updatedAtBlock,
				timeline: r.statusHistory
			}))
			.sort((a, b) => (b.index || 0) - (a.index || 0));
	}

	static filterReferendaForDelegate(
		referenda: { index: number; status: EProposalStatus; createdAtBlock?: number; updatedAtBlock?: number }[],
		delegateStartBlock: number,
		delegateEndBlock: number | null
	): number[] {
		const endBlock = delegateEndBlock ?? Number.MAX_SAFE_INTEGER;
		const isOngoingDelegate = delegateEndBlock === null;

		return referenda
			.filter((r) => {
				const proposalStart = r.createdAtBlock || 0;
				const proposalEnd = r.updatedAtBlock || 0;

				if (isOngoingDelegate) {
					return true;
				}

				if (proposalEnd > 0) {
					return proposalEnd >= delegateStartBlock && proposalEnd <= endBlock;
				}

				return proposalStart <= endBlock;
			})
			.map((r) => r.index);
	}

	static async getDelegateVoteStats(
		network: ENetwork,
		address: string,
		eligibleReferendumIndices: number[],
		cohortEndTime?: Date,
		startBlock?: number,
		endBlock?: number | null
	): Promise<IDVDelegateVoteStats> {
		try {
			const latestBlock = await OnChainDbService.GetLatestBlockNumber(network);
			const votes = await this.fetchAllPages<IProfileVote>(async (page) => {
				const response = await OnChainDbService.GetVotesForAddressesAndReferenda({
					network,
					voters: [address],
					page,
					limit: 1000,
					startBlock: startBlock || 0,
					endBlock: endBlock || latestBlock
				});
				return response.items || [];
			}, 1000);

			const validVotes = votes.filter((v) => v.proposalIndex !== undefined && eligibleReferendumIndices.includes(v.proposalIndex));

			let ayeCount = 0;
			let nayCount = 0;
			let abstainCount = 0;
			let winningVotes = 0;

			validVotes.forEach((vote) => {
				const proposal = vote.proposal as IOnChainPostListing | undefined;
				let status = proposal?.status;
				const timeline: IStatusHistoryItem[] = (proposal?.statusHistory || []) as IStatusHistoryItem[];

				if (cohortEndTime && timeline.length > 0) {
					const validHistory = timeline
						.filter((h: IStatusHistoryItem) => new Date(h.timestamp).getTime() <= cohortEndTime.getTime())
						.sort((a: IStatusHistoryItem, b: IStatusHistoryItem) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

					if (validHistory.length > 0) {
						status = validHistory[0].status;
					}
				}

				const isClosed = [EProposalStatus.Executed, EProposalStatus.Approved, EProposalStatus.Rejected, EProposalStatus.TimedOut, EProposalStatus.Cancelled].includes(
					status as EProposalStatus
				);

				if (vote.decision === EVoteDecision.AYE) {
					ayeCount += 1;
					if (isClosed && (status === EProposalStatus.Executed || status === EProposalStatus.Approved || status === EProposalStatus.Confirmed)) {
						winningVotes += 1;
					}
				} else if (vote.decision === EVoteDecision.NAY) {
					nayCount += 1;
					if (isClosed && (status === EProposalStatus.Rejected || status === EProposalStatus.TimedOut || status === EProposalStatus.Cancelled)) {
						winningVotes += 1;
					}
				} else {
					abstainCount += 1;
				}
			});

			const totalVotes = ayeCount + nayCount + abstainCount;
			const nonAbstainVotes = ayeCount + nayCount;

			const totalEligible = eligibleReferendumIndices.length || 1;
			const participation = Math.round((totalVotes / totalEligible) * 100 * 100) / 100;

			const winRate = nonAbstainVotes > 0 ? Math.round((winningVotes / nonAbstainVotes) * 100 * 100) / 100 : 0;

			return { ayeCount, nayCount, abstainCount, participation: Math.min(participation, 100), winRate };
		} catch (error) {
			console.error(`Error fetching vote stats for ${address}:`, error);
			return { ayeCount: 0, nayCount: 0, abstainCount: 0, participation: 0, winRate: 0 };
		}
	}

	static async getDelegatesWithStats(network: ENetwork, cohort: IDVCohort, trackFilter = EDVTrackFilter.DV_TRACKS): Promise<IDVDelegateWithStats[]> {
		const cachedData = await RedisService.GetDVDelegates({ network, cohortId: cohort.index.toString(), trackFilter });
		if (cachedData) return cachedData;

		const allowedTracks = trackFilter === EDVTrackFilter.DV_TRACKS ? cohort.tracks : null;
		const cohortReferenda = await this.getCohortReferenda(network, cohort, allowedTracks);

		const statsPromises = cohort.delegates.map(async (delegate) => {
			const delegateReferendumIndices = this.filterReferendaForDelegate(cohortReferenda, delegate.startBlock, delegate.endBlock);
			const voteStats = await this.getDelegateVoteStats(network, delegate.address, delegateReferendumIndices, cohort.endTime, delegate.startBlock, delegate.endBlock);
			return { ...delegate, voteStats } as IDVDelegateWithStats;
		});
		const stats = await Promise.all(statsPromises);
		await RedisService.SetDVDelegates({ network, cohortId: cohort.index.toString(), trackFilter, data: stats });

		return stats;
	}

	private static isReferendumActiveForDelegate(referendum: { createdAtBlock?: number; updatedAtBlock?: number }, delegate: IDVCohort['delegates'][0]): boolean {
		const endBlock = delegate.endBlock ?? Number.MAX_SAFE_INTEGER;
		if (!referendum.createdAtBlock && !referendum.updatedAtBlock) return true;

		const effectiveEnd = referendum.updatedAtBlock || referendum.createdAtBlock || 0;
		return effectiveEnd >= delegate.startBlock && effectiveEnd <= endBlock;
	}

	private static getVotePower(vote: IProfileVote): bigint {
		let power = BigInt(vote.totalVotingPower || '0');

		if (power === BigInt(0) && vote.balance) {
			const { balance, decision } = vote;
			const value = balance.value || '0';

			if (decision === EVoteDecision.AYE) {
				power = BigInt(balance.aye || value);
			} else if (decision === EVoteDecision.NAY) {
				power = BigInt(balance.nay || value);
			} else if (decision === EVoteDecision.ABSTAIN || decision === EVoteDecision.SPLIT_ABSTAIN) {
				power = BigInt(balance.abstain || value);
			}

			const lockPeriod = vote.lockPeriod ?? 0;
			if (lockPeriod === 0) {
				power /= BigInt(10);
			} else {
				power *= BigInt(lockPeriod);
			}
		}
		return power;
	}

	private static processDelegateVotes(delegates: IDVCohort['delegates'], referendum: { index: number; createdAtBlock?: number; updatedAtBlock?: number }, dvVotes: IProfileVote[]) {
		let ayeTotal = BigInt(0);
		let nayTotal = BigInt(0);
		let abstainTotal = BigInt(0);
		let ayeSupport = BigInt(0);
		let abstainSupport = BigInt(0);

		const votes = delegates.map((delegate) => {
			const isReferendumActive = this.isReferendumActiveForDelegate(referendum, delegate);
			const vote = dvVotes.find((v) => v.voterAddress === delegate.address && v.proposalIndex === referendum.index);

			if (!vote || !isReferendumActive) {
				return {
					address: delegate.address,
					decision: 'novote',
					votingPower: undefined,
					percentage: 0
				} as IDVDelegateVote;
			}

			const power = this.getVotePower(vote);
			const { balance } = vote;
			const value = balance?.value || '0';

			if (vote.decision === EVoteDecision.AYE) {
				ayeTotal += power;
				ayeSupport += BigInt(balance?.aye || value);
			} else if (vote.decision === EVoteDecision.NAY) {
				nayTotal += power;
			} else if (vote.decision === EVoteDecision.ABSTAIN || vote.decision === EVoteDecision.SPLIT_ABSTAIN) {
				abstainTotal += power;
				abstainSupport += BigInt(balance?.abstain || value);
			}

			return {
				address: delegate.address,
				decision: vote.decision,
				votingPower: power.toString(),
				percentage: 0
			} as IDVDelegateVote;
		});

		return { votes, ayeTotal, nayTotal, abstainTotal, ayeSupport, abstainSupport };
	}

	private static calculateInfluenceStatus(
		referendum: { status: string | EProposalStatus; voteMetrics?: Partial<IVoteMetrics>; index?: number },
		dvAyeTotal: bigint,
		dvNayTotal: bigint
	): EInfluenceStatus {
		const status = referendum.status as EProposalStatus;

		const noNeedComparison = [
			EProposalStatus.TimedOut,
			EProposalStatus.Submitted,
			EProposalStatus.Added,
			EProposalStatus.Killed,
			EProposalStatus.Cancelled,
			EProposalStatus.Unknown,
			EProposalStatus.Noted,
			EProposalStatus.Proposed,
			EProposalStatus.Tabled,
			EProposalStatus.Started
		].includes(status);

		if (noNeedComparison) {
			return EInfluenceStatus.NO_IMPACT;
		}

		const totalAye = BigInt(referendum.voteMetrics?.aye?.value || '0');
		const totalNay = BigInt(referendum.voteMetrics?.nay?.value || '0');

		if (!referendum.voteMetrics || (totalAye === BigInt(0) && totalNay === BigInt(0))) {
			const isFinalState = [
				EProposalStatus.Executed,
				EProposalStatus.Deciding,
				EProposalStatus.Active,
				EProposalStatus.Confirmed,
				EProposalStatus.DecisionDepositPlaced,
				EProposalStatus.Rejected
			].includes(status);
			if (!isFinalState) {
				return EInfluenceStatus.NO_IMPACT;
			}
		}

		const approval = 0.5;

		const denominator = totalAye + totalNay;
		const noDvAye = totalAye >= dvAyeTotal ? totalAye - dvAyeTotal : BigInt(0);
		const noDvNay = totalNay >= dvNayTotal ? totalNay - dvNayTotal : BigInt(0);
		const noDvDenominator = noDvAye + noDvNay;

		let isPass = false;
		if (denominator > BigInt(0)) {
			const ayeRatio = Number(totalAye * BigInt(1000000)) / Number(denominator * BigInt(1000000));
			isPass = ayeRatio > approval;
		}

		let noDvIsPass = false;
		if (noDvDenominator > BigInt(0)) {
			const noDvAyeRatio = Number(noDvAye * BigInt(1000000)) / Number(noDvDenominator * BigInt(1000000));
			noDvIsPass = noDvAyeRatio > approval;
		}

		const hasInfluence = isPass !== noDvIsPass;

		const dvDecidingTotal = dvAyeTotal + dvNayTotal;
		const dvParticipated = dvDecidingTotal > BigInt(0);

		if (!hasInfluence) {
			if (dvParticipated) {
				return EInfluenceStatus.FAILED;
			}
			return EInfluenceStatus.NO_IMPACT;
		}

		if (isPass && !noDvIsPass) {
			return EInfluenceStatus.APPROVED;
		}
		if (!isPass && noDvIsPass) {
			return EInfluenceStatus.REJECTED;
		}

		return EInfluenceStatus.NO_IMPACT;
	}

	static async getInfluence(network: ENetwork, cohort: IDVCohort, trackFilter = EDVTrackFilter.DV_TRACKS): Promise<IDVReferendumInfluence[]> {
		const cachedData = await RedisService.GetDVInfluence({ network, cohortId: cohort.index.toString(), trackFilter });
		if (cachedData) return cachedData;

		const allowedTracks = trackFilter === EDVTrackFilter.DV_TRACKS ? cohort.tracks : null;
		const cohortReferenda = await this.getCohortReferenda(network, cohort, allowedTracks);
		const referendaItems = cohortReferenda.slice(0, 1000);
		const referendumIndices = referendaItems.map((r) => r.index);

		const daos = this.getDelegatesByType(cohort, EDVDelegateType.DAO);
		const guardians = this.getDelegatesByType(cohort, EDVDelegateType.GUARDIAN);
		const uniqueAddresses = [...new Set([...daos, ...guardians].map((d) => d.address))];

		const allVotes = await this.fetchAllPages<IProfileVote>(async (page) => {
			const res = await OnChainDbService.GetVotesForAddressesAndReferenda({
				network,
				voters: uniqueAddresses,
				referendumIndices,
				page,
				limit: 1000,
				startBlock: cohort.startBlock,
				endBlock: cohort.endBlock
			});
			return res.items || [];
		}, 50);

		const influenceData = referendaItems.map((referendum) => {
			try {
				const dvVotes = allVotes.filter((v) => v.proposalIndex === referendum.index && !(cohort.endTime && new Date(v.createdAt).getTime() > cohort.endTime.getTime()));

				const daoResult = this.processDelegateVotes(daos, referendum, dvVotes);
				const guardianResult = this.processDelegateVotes(guardians, referendum, dvVotes);

				const dvAyeTotal = daoResult.ayeTotal + guardianResult.ayeTotal;
				const dvNayTotal = daoResult.nayTotal + guardianResult.nayTotal;
				const dvAbstainTotal = daoResult.abstainTotal + guardianResult.abstainTotal;

				const dvTotal = dvAyeTotal + dvNayTotal + dvAbstainTotal;
				const dvDecidingTotal = dvAyeTotal + dvNayTotal;

				const influence = this.calculateInfluenceStatus(referendum, dvAyeTotal, dvNayTotal);

				const totalValue = BigInt(referendum.voteMetrics?.aye?.value || '0') + BigInt(referendum.voteMetrics?.nay?.value || '0');
				const ayeValue = BigInt(referendum.voteMetrics?.aye?.value || '0');
				const nayValue = BigInt(referendum.voteMetrics?.nay?.value || '0');

				let ayePercent = 0;
				let nayPercent = 0;

				if (totalValue > 0) {
					ayePercent = Number((ayeValue * BigInt(1000000)) / totalValue) / 10000;
					nayPercent = Number((nayValue * BigInt(1000000)) / totalValue) / 10000;
				} else if (dvDecidingTotal > 0) {
					ayePercent = Number((dvAyeTotal * BigInt(100)) / dvDecidingTotal);
					nayPercent = Number((dvNayTotal * BigInt(100)) / dvDecidingTotal);
				}

				return {
					index: referendum.index || 0,
					title: referendum.description?.substring(0, 50) || `Referendum #${referendum.index}`,
					track: referendum.origin || 'Unknown',
					status: referendum.status || EProposalStatus.Unknown,
					ayePercent,
					nayPercent,
					ayeVotingPower: ayeValue.toString(),
					nayVotingPower: nayValue.toString(),
					dvTotalVotingPower: dvTotal.toString(),
					dvAyeVotingPower: dvAyeTotal.toString(),
					dvNayVotingPower: dvNayTotal.toString(),
					dvPercentage: totalValue > 0 ? Number((dvDecidingTotal * BigInt(1000)) / totalValue) / 10 : 0,
					influence,
					delegateVotes: daoResult.votes,
					guardianVotes: guardianResult.votes
				} as IDVReferendumInfluence;
			} catch (error) {
				console.error(`Error processing influence data for referendum ${referendum.index}:`, error);
				return {
					index: referendum.index || 0,
					title: `Referendum #${referendum.index}`,
					track: referendum.origin || 'Unknown',
					status: referendum.status || EProposalStatus.Unknown,
					ayePercent: 0,
					nayPercent: 0,
					ayeVotingPower: '0',
					nayVotingPower: '0',
					dvTotalVotingPower: '0',
					dvAyeVotingPower: '0',
					dvNayVotingPower: '0',
					dvPercentage: 0,
					influence: EInfluenceStatus.NO_IMPACT,
					delegateVotes: [],
					guardianVotes: []
				} as IDVReferendumInfluence;
			}
		});
		await RedisService.SetDVInfluence({ network, cohortId: cohort.index.toString(), trackFilter, data: influenceData });
		return influenceData;
	}

	static async getVotingMatrix(
		network: ENetwork,
		cohort: IDVCohort,
		trackFilter = EDVTrackFilter.DV_TRACKS
	): Promise<{ referendumIndices: number[]; delegates: IDVDelegateVotingMatrix[] }> {
		const cachedData = await RedisService.GetDVVotingMatrix({ network, cohortId: cohort.index.toString(), trackFilter });
		if (cachedData) return cachedData;

		const allowedTracks = trackFilter === EDVTrackFilter.DV_TRACKS ? cohort.tracks : null;
		const cohortReferenda = await this.getCohortReferenda(network, cohort, allowedTracks);

		const matrixPromises = cohort.delegates.map(async (delegate) => {
			const delegateReferendumIndices = this.filterReferendaForDelegate(cohortReferenda, delegate.startBlock, delegate.endBlock);

			const votesResponse = await OnChainDbService.GetVotesForAddresses({
				network,
				voters: [delegate.address],
				page: 1,
				limit: 500
			});

			const votes: Record<number, EVoteDecision | 'novote'> = {};
			let ayeCount = 0;
			let totalVoted = 0;

			delegateReferendumIndices.forEach((idx) => {
				votes[idx || 0] = 'novote';
			});

			votesResponse.items.forEach((vote) => {
				if (vote.proposalIndex !== undefined && delegateReferendumIndices.includes(vote.proposalIndex)) {
					if (cohort.endTime && new Date(vote.createdAt).getTime() > cohort.endTime.getTime()) return;

					votes[vote.proposalIndex] = vote.decision;
					totalVoted += 1;
					if (vote.decision === EVoteDecision.AYE) ayeCount += 1;
				}
			});

			return {
				address: delegate.address,
				type: delegate.type,
				votes,
				participation: delegateReferendumIndices.length > 0 ? Math.round((totalVoted / delegateReferendumIndices.length) * 100) : 0,
				ayeRate: totalVoted > 0 ? Math.round((ayeCount / totalVoted) * 100) : 0,
				activeCount: totalVoted,
				totalRefs: delegateReferendumIndices.length
			} as IDVDelegateVotingMatrix;
		});

		const delegates = await Promise.all(matrixPromises);

		const allDelegateReferendumIndices = new Set<number>();
		delegates.forEach((delegate: IDVDelegateVotingMatrix) => {
			Object.keys(delegate.votes).forEach((refIndex: string) => {
				const idx = parseInt(refIndex, 10);
				if (!isNaN(idx)) {
					allDelegateReferendumIndices.add(idx);
				}
			});
		});

		const result = {
			referendumIndices: Array.from(allDelegateReferendumIndices).sort((a, b) => a - b),
			delegates
		};
		await RedisService.SetDVVotingMatrix({ network, cohortId: cohort.index.toString(), trackFilter, data: result });
		return result;
	}
}
