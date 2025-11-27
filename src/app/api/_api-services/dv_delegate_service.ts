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
	IVoteMetrics,
	IStatusHistoryItem,
	EProposalType,
	ProposalWithTally
} from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import {
	fetchAllPages,
	filterReferendaForDelegate,
	getDelegatesByType,
	isReferendumActiveForDelegate,
	getVotePower,
	calculateVoteStats,
	getAdjustedStartBlock
} from '@/_shared/_utils/dvDelegateUtils';
import { getTrackFunctions } from '@/app/_client-utils/trackCurvesUtils';

export class DVDelegateService {
	static async GetCohortReferenda(
		network: ENetwork,
		cohort: IDVCohort,
		allowedTracks: EPostOrigin[] | null = null
	): Promise<
		{
			index: number;
			status: EProposalStatus;
			origin: string;
			description: string;
			title?: string;
			voteMetrics: Partial<IVoteMetrics>;
			createdAtBlock?: number;
			updatedAtBlock?: number;
			timeline?: IStatusHistoryItem[];
		}[]
	> {
		const { startBlock, endBlock } = cohort;
		const latestBlock = await OnChainDbService.GetLatestBlockNumber(network);
		const adjustedStartBlock = getAdjustedStartBlock(network, startBlock);

		const delegateAddresses = cohort.delegates.map((d) => d.address);
		const votedProposalsPromise = fetchAllPages<IOnChainPostListing>(async (page) => {
			const votesListing = await OnChainDbService.GetVotesForAddressesAndReferenda({
				network,
				voters: delegateAddresses,
				startBlock: adjustedStartBlock,
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
		const { trackDetails } = NETWORKS_DETAILS[network] || {};

		const trackIds = allowedTracks
			? (allowedTracks.map((track) => trackDetails?.[track]?.trackId).filter((id) => id !== undefined) as number[])
			: (Object.values(trackDetails || {})
					.map((t) => t.trackId)
					.filter((id) => id !== undefined) as number[]);

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

		const indicesNeedingMetrics = allProposals
			.filter((p) => !p.voteMetrics || !p.voteMetrics.aye)
			.map((p) => p.index)
			.filter((index): index is number => index !== undefined);

		if (indicesNeedingMetrics.length > 0) {
			try {
				const metricsMap = await OnChainDbService.GetVoteMetricsForProposals({
					network,
					proposalIndices: indicesNeedingMetrics,
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

		const filteredProposals = allProposals
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
			.sort((a, b) => (b.index || 0) - (a.index || 0));

		const offChainDataPromises = filteredProposals.map((r) => {
			return OffChainDbService.GetOffChainPostData({
				network,
				indexOrHash: r.index?.toString() || '',
				proposalType: EProposalType.REFERENDUM_V2
			}).catch(() => null);
		});

		const offChainData = await Promise.all(offChainDataPromises);

		return filteredProposals.map((r, index) => ({
			index: r.index || 0,
			status: r.status,
			origin: r.origin,
			description: r.description,
			title: offChainData[Number(index)]?.title || `Referendum #${r.index}`,
			voteMetrics: (r.voteMetrics || {}) as Partial<IVoteMetrics>,
			createdAtBlock: r.createdAtBlock,
			updatedAtBlock: r.updatedAtBlock,
			timeline: r.statusHistory
		}));
	}

	static async GetDelegateVoteStats(
		network: ENetwork,
		address: string,
		eligibleReferendumIndices: number[],
		cohortEndTime?: Date,
		startBlock?: number,
		endBlock?: number | null
	): Promise<IDVDelegateVoteStats> {
		try {
			const latestBlock = await OnChainDbService.GetLatestBlockNumber(network);
			const adjustedStartBlock = startBlock ? getAdjustedStartBlock(network, startBlock) : 0;
			const votes = await fetchAllPages<IProfileVote>(async (page) => {
				const response = await OnChainDbService.GetVotesForAddressesAndReferenda({
					network,
					voters: [address],
					referendumIndices: eligibleReferendumIndices,
					page,
					limit: 1000,
					startBlock: adjustedStartBlock,
					endBlock: endBlock || latestBlock
				});

				return response.items || [];
			}, 1000);

			const validVotes = votes.filter((v) => v.proposalIndex !== undefined && eligibleReferendumIndices.includes(v.proposalIndex));

			const { ayeCount, nayCount, abstainCount, winningVotes } = calculateVoteStats(validVotes, cohortEndTime);

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

	static async GetDelegatesWithStats(network: ENetwork, cohort: IDVCohort, trackFilter = EDVTrackFilter.DV_TRACKS): Promise<IDVDelegateWithStats[]> {
		const cachedData = await RedisService.GetDVDelegates({ network, cohortId: cohort.index.toString(), trackFilter });
		if (cachedData) return cachedData;

		const allowedTracks = trackFilter === EDVTrackFilter.DV_TRACKS ? cohort.tracks : null;
		const cohortReferenda = await this.GetCohortReferenda(network, cohort, allowedTracks);

		const statsPromises = cohort.delegates.map(async (delegate) => {
			const delegateReferendumIndices = filterReferendaForDelegate(cohortReferenda, delegate.startBlock, delegate.endBlock);
			const voteStats = await this.GetDelegateVoteStats(network, delegate.address, delegateReferendumIndices, cohort.endTime, delegate.startBlock, delegate.endBlock);
			return { ...delegate, voteStats } as IDVDelegateWithStats;
		});
		const stats = await Promise.all(statsPromises);
		await RedisService.SetDVDelegates({ network, cohortId: cohort.index.toString(), trackFilter, data: stats });

		return stats;
	}

	private static ProcessDelegateVotes(
		delegates: IDVCohort['delegates'],
		referendum: { index?: number; status: EProposalStatus; createdAtBlock?: number; updatedAtBlock?: number },
		dvVotes: IProfileVote[]
	): { votes: IDVDelegateVote[]; ayeTotal: bigint; nayTotal: bigint; abstainTotal: bigint; ayeSupport: bigint; abstainSupport: bigint } {
		let ayeTotal = BigInt(0);
		let nayTotal = BigInt(0);
		let abstainTotal = BigInt(0);
		let ayeSupport = BigInt(0);
		let abstainSupport = BigInt(0);

		const votes = delegates.map((delegate) => {
			const isReferendumActive = isReferendumActiveForDelegate(referendum, delegate);
			const vote = dvVotes.find((v) => v.voterAddress === delegate.address && v.proposalIndex === referendum.index);

			if (!vote || !isReferendumActive) {
				return {
					address: delegate.address,
					decision: 'novote',
					votingPower: undefined,
					percentage: 0
				} as IDVDelegateVote;
			}

			const power = getVotePower(vote);
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

	private static CalculateInfluenceStatus(
		referendum: { status: string | EProposalStatus; voteMetrics?: Partial<IVoteMetrics>; index?: number; origin?: string },
		dvAyeTotal: bigint,
		dvNayTotal: bigint,
		network: ENetwork
	): EInfluenceStatus {
		const status = referendum.status as EProposalStatus;

		if (this.shouldSkipInfluenceCalculation(status)) {
			return EInfluenceStatus.NO_IMPACT;
		}

		if (!this.hasValidVoteData(referendum, status)) {
			return EInfluenceStatus.NO_IMPACT;
		}

		const totalAye = BigInt(referendum.voteMetrics?.aye?.value || '0');
		const totalNay = BigInt(referendum.voteMetrics?.nay?.value || '0');
		const denominator = totalAye + totalNay;

		const approval = this.calculateApprovalThreshold(referendum, network, denominator);

		const isPass = this.calculateVoteOutcome(totalAye, denominator, approval);
		const noDvIsPass = this.calculateVoteOutcomeWithoutDV(totalAye, totalNay, dvAyeTotal, dvNayTotal, approval);

		return this.determineInfluenceStatus(isPass, noDvIsPass, dvAyeTotal, dvNayTotal);
	}

	private static shouldSkipInfluenceCalculation(status: EProposalStatus): boolean {
		const noNeedComparison = [EProposalStatus.TimedOut, EProposalStatus.Killed, EProposalStatus.Cancelled, EProposalStatus.Unknown];
		return noNeedComparison.includes(status);
	}

	private static hasValidVoteData(referendum: { voteMetrics?: Partial<IVoteMetrics> }, status: EProposalStatus): boolean {
		const totalAye = BigInt(referendum.voteMetrics?.aye?.value || '0');
		const totalNay = BigInt(referendum.voteMetrics?.nay?.value || '0');

		if (!referendum.voteMetrics || (totalAye === BigInt(0) && totalNay === BigInt(0))) {
			return [
				EProposalStatus.Executed,
				EProposalStatus.Deciding,
				EProposalStatus.Active,
				EProposalStatus.Confirmed,
				EProposalStatus.DecisionDepositPlaced,
				EProposalStatus.Rejected
			].includes(status);
		}
		return true;
	}

	private static calculateApprovalThreshold(referendum: { origin?: string; voteMetrics?: Partial<IVoteMetrics> }, network: ENetwork, denominator: bigint): number {
		if (!referendum.origin) {
			return 0.5;
		}

		const { approvalCalc } = getTrackFunctions({ network, trackName: referendum.origin as EPostOrigin });
		if (!approvalCalc) {
			return 0.5;
		}

		const totalSupport = BigInt(referendum.voteMetrics?.support?.value || '0');
		const supportPercentage = totalSupport > BigInt(0) ? Number(denominator * BigInt(10000)) / Number(totalSupport) / 100 : 0;
		return approvalCalc(Math.min(supportPercentage, 100)) / 100;
	}

	private static calculateVoteOutcome(totalAye: bigint, denominator: bigint, approval: number): boolean {
		if (denominator <= BigInt(0)) {
			return false;
		}
		const ayeRatio = Number(totalAye * BigInt(1000000)) / Number(denominator * BigInt(1000000));
		return ayeRatio > approval;
	}

	private static calculateVoteOutcomeWithoutDV(totalAye: bigint, totalNay: bigint, dvAyeTotal: bigint, dvNayTotal: bigint, approval: number): boolean {
		const noDvAye = totalAye >= dvAyeTotal ? totalAye - dvAyeTotal : BigInt(0);
		const noDvNay = totalNay >= dvNayTotal ? totalNay - dvNayTotal : BigInt(0);
		const noDvDenominator = noDvAye + noDvNay;

		if (noDvDenominator <= BigInt(0)) {
			return false;
		}
		const noDvAyeRatio = Number(noDvAye * BigInt(1000000)) / Number(noDvDenominator * BigInt(1000000));
		return noDvAyeRatio > approval;
	}

	private static determineInfluenceStatus(isPass: boolean, noDvIsPass: boolean, dvAyeTotal: bigint, dvNayTotal: bigint): EInfluenceStatus {
		const hasInfluence = isPass !== noDvIsPass;
		const dvDecidingTotal = dvAyeTotal + dvNayTotal;
		const dvParticipated = dvDecidingTotal > BigInt(0);

		if (!hasInfluence) {
			return dvParticipated ? EInfluenceStatus.FAILED : EInfluenceStatus.NO_IMPACT;
		}

		if (isPass && !noDvIsPass) {
			return EInfluenceStatus.APPROVED;
		}
		if (!isPass && noDvIsPass) {
			return EInfluenceStatus.REJECTED;
		}

		return EInfluenceStatus.NO_IMPACT;
	}

	static async GetInfluence(network: ENetwork, cohort: IDVCohort, trackFilter = EDVTrackFilter.DV_TRACKS): Promise<IDVReferendumInfluence[]> {
		const cachedData = await RedisService.GetDVInfluence({ network, cohortId: cohort.index.toString(), trackFilter });
		if (cachedData) return cachedData;

		const allowedTracks = trackFilter === EDVTrackFilter.DV_TRACKS ? cohort.tracks : null;
		const cohortReferenda = await this.GetCohortReferenda(network, cohort, allowedTracks);
		const referendaItems = cohortReferenda.slice(0, 1000);
		const referendumIndices = referendaItems.map((r) => r.index);

		const daos = getDelegatesByType(cohort, EDVDelegateType.DAO);
		const guardians = getDelegatesByType(cohort, EDVDelegateType.GUARDIAN);
		const uniqueAddresses = [...new Set([...daos, ...guardians].map((d) => d.address))];

		const voteQueryStartBlock = cohort.endBlock ? getAdjustedStartBlock(network, cohort.startBlock) : 0;

		const allVotes = await fetchAllPages<IProfileVote>(async (page) => {
			const res = await OnChainDbService.GetVotesForAddressesAndReferenda({
				network,
				voters: uniqueAddresses,
				referendumIndices,
				page,
				limit: 1000,
				startBlock: voteQueryStartBlock,
				endBlock: cohort.endBlock
			});
			return res.items || [];
		}, 50);

		const influenceData = referendaItems.map((referendum) => {
			try {
				const dvVotes = allVotes.filter((v) => v.proposalIndex === referendum.index && !(cohort.endTime && new Date(v.createdAt).getTime() > cohort.endTime.getTime()));

				const daoResult = this.ProcessDelegateVotes(daos, referendum, dvVotes);
				const guardianResult = this.ProcessDelegateVotes(guardians, referendum, dvVotes);

				const dvAyeTotal = daoResult.ayeTotal + guardianResult.ayeTotal;
				const dvNayTotal = daoResult.nayTotal + guardianResult.nayTotal;
				const dvAbstainTotal = daoResult.abstainTotal + guardianResult.abstainTotal;

				const dvTotal = dvAyeTotal + dvNayTotal + dvAbstainTotal;
				const dvDecidingTotal = dvAyeTotal + dvNayTotal;

				const influence = this.CalculateInfluenceStatus(referendum, dvAyeTotal, dvNayTotal, network);

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
					title: referendum.title || `Referendum #${referendum.index}`,
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
					title: referendum.title || `Referendum #${referendum.index}`,
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

	static async GetVotingMatrix(
		network: ENetwork,
		cohort: IDVCohort,
		trackFilter = EDVTrackFilter.DV_TRACKS
	): Promise<{ referendumIndices: number[]; delegates: IDVDelegateVotingMatrix[] }> {
		const cachedData = await RedisService.GetDVVotingMatrix({ network, cohortId: cohort.index.toString(), trackFilter });
		if (cachedData) return cachedData;

		const allowedTracks = trackFilter === EDVTrackFilter.DV_TRACKS ? cohort.tracks : null;
		const cohortReferenda = await this.GetCohortReferenda(network, cohort, allowedTracks);

		const matrixPromises = cohort.delegates.map(async (delegate) => {
			const delegateReferendumIndices = filterReferendaForDelegate(cohortReferenda, delegate.startBlock, delegate.endBlock);
			const adjustedStartBlock = getAdjustedStartBlock(network, delegate.startBlock);

			const votesResponse = await OnChainDbService.GetVotesForAddressesAndReferenda({
				network,
				voters: [delegate.address],
				referendumIndices: delegateReferendumIndices,
				page: 1,
				limit: 1000,
				startBlock: adjustedStartBlock,
				endBlock: delegate.endBlock || undefined
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
