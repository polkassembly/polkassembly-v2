// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import {
	ENetwork,
	EProposalStatus,
	EProposalType,
	EVoteDecision,
	EPostOrigin,
	IDVCohort,
	IDVDelegateVoteStats,
	IDVReferendumInfluence,
	IDVDelegateVotingMatrix,
	IDVDelegateWithStats,
	IOnChainPostListing,
	IProfileVote,
	EDVDelegateType,
	EDVTrackFilter,
	EInfluenceStatus
} from '@/_shared/types';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';

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
		startTime: Date,
		endTime?: Date,
		allowedTracks: EPostOrigin[] | null = null
	): Promise<
		{
			index: number;
			status: EProposalStatus;
			origin: string;
			description: string;
			voteMetrics: Record<string, { value: string }>;
			createdAtBlock?: number;
			updatedAtBlock?: number;
		}[]
	> {
		const startTimestamp = startTime.getTime();
		const endTimestamp = endTime ? endTime.getTime() : Date.now();

		const lookBackWindow = 300 * 24 * 60 * 60 * 1000;
		const queryStartDate = new Date(startTime.getTime() - lookBackWindow);
		const queryEndDate = endTime || new Date();
		const limit = 1000;

		const allItems = await this.fetchAllPages<IOnChainPostListing>(async (page) => {
			const postsListing = await OnChainDbService.GetOnChainPostsListing({
				network,
				proposalType: EProposalType.REFERENDUM_V2,
				limit,
				page,
				startDate: queryStartDate.toISOString(),
				endDate: queryEndDate.toISOString()
			});
			return postsListing.items || [];
		}, 10);

		return allItems
			.filter((r) => {
				if (r.index === undefined) return false;
				if (allowedTracks && r.origin && !allowedTracks.includes(r.origin as EPostOrigin)) return false;

				const createdAt = new Date(r.createdAt).getTime();
				if (createdAt >= startTimestamp && createdAt <= endTimestamp) return true;

				if (r.statusHistory && r.statusHistory.length > 0) {
					const terminalStatuses = [
						EProposalStatus.Executed,
						EProposalStatus.Approved,
						EProposalStatus.Rejected,
						EProposalStatus.TimedOut,
						EProposalStatus.Cancelled,
						EProposalStatus.Confirmed
					];

					const terminalStatusItem = r.statusHistory.find((h) => terminalStatuses.includes(h.status as EProposalStatus));

					if (terminalStatusItem && terminalStatusItem.timestamp) {
						const referendumEndTimestamp = new Date(terminalStatusItem.timestamp).getTime();
						if (referendumEndTimestamp < startTimestamp) {
							return false;
						}
					}
				}

				return true;
			})
			.map((r) => ({
				index: r.index || 0,
				status: r.status || EProposalStatus.Unknown,
				origin: r.origin || 'Unknown',
				description: r.description || '',
				voteMetrics: r.voteMetrics || {},
				createdAtBlock: r.createdAtBlock,
				updatedAtBlock: r.updatedAtBlock
			}));
	}

	static filterReferendaForDelegate(
		referenda: { index: number; status: EProposalStatus; createdAtBlock?: number; updatedAtBlock?: number }[],
		delegateStartBlock: number,
		delegateEndBlock: number | null
	): number[] {
		const endBlock = delegateEndBlock ?? Number.MAX_SAFE_INTEGER;

		return referenda
			.filter((r) => {
				if (!r.createdAtBlock && !r.updatedAtBlock) return true;

				if (r.createdAtBlock && r.createdAtBlock >= delegateStartBlock && r.createdAtBlock <= endBlock) {
					return true;
				}

				return !!(r.updatedAtBlock && r.updatedAtBlock >= delegateStartBlock && r.updatedAtBlock <= endBlock);
			})
			.map((r) => r.index);
	}

	static async getDelegateVoteStats(network: ENetwork, address: string, eligibleReferendumIndices: number[]): Promise<IDVDelegateVoteStats> {
		try {
			const votesResponse = await OnChainDbService.GetVotesForAddresses({
				network,
				voters: [address],
				page: 1,
				limit: 500
			});

			const allVotes = votesResponse.items || [];
			const votes = allVotes.filter((v) => v.proposalIndex !== undefined && eligibleReferendumIndices.includes(v.proposalIndex));

			let ayeCount = 0;
			let nayCount = 0;
			let abstainCount = 0;
			let winningVotes = 0;

			const referendumIndices = [...new Set(votes.map((v) => v.proposalIndex).filter((i): i is number => i !== undefined))];

			const referendaDetails = await Promise.all(
				referendumIndices.slice(0, 100).map(async (index) => {
					try {
						const postInfo = await OnChainDbService.GetOnChainPostInfo({
							network,
							proposalType: EProposalType.REFERENDUM_V2,
							indexOrHash: String(index)
						});

						return { index, status: postInfo?.status };
					} catch {
						return { index, status: undefined };
					}
				})
			);

			const statusMap = new Map(referendaDetails.map((r) => [r.index, r.status]));

			votes.forEach((vote) => {
				const status = statusMap.get(vote.proposalIndex);
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
		const cachedData = await RedisService.GetDVDelegates({ network, cohortId: cohort.index.toString() });
		if (cachedData) return cachedData;

		const allowedTracks = trackFilter === EDVTrackFilter.DV_TRACKS ? cohort.tracks : null;
		const cohortReferenda = await this.getCohortReferenda(network, cohort.startTime, cohort.endTime, allowedTracks);

		const statsPromises = cohort.delegates.map(async (delegate) => {
			const delegateReferendumIndices = this.filterReferendaForDelegate(cohortReferenda, delegate.startBlock, delegate.endBlock);
			const voteStats = await this.getDelegateVoteStats(network, delegate.address, delegateReferendumIndices);
			return { ...delegate, voteStats } as IDVDelegateWithStats;
		});

		const result = await Promise.all(statsPromises);
		await RedisService.SetDVDelegates({ network, cohortId: cohort.index.toString(), data: result });

		return result;
	}

	static async getInfluence(network: ENetwork, cohort: IDVCohort, trackFilter = EDVTrackFilter.DV_TRACKS): Promise<IDVReferendumInfluence[]> {
		const allowedTracks = trackFilter === EDVTrackFilter.DV_TRACKS ? cohort.tracks : null;
		const cohortReferenda = await this.getCohortReferenda(network, cohort.startTime, cohort.endTime, allowedTracks);
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
				limit: 1000
			});
			return res.items || [];
		}, 50);

		return referendaItems.map((referendum) => {
			try {
				const dvVotes = allVotes.filter((v) => v.proposalIndex === referendum.index);
				let dvAyeTotal = BigInt(0);
				let dvNayTotal = BigInt(0);

				const delegateVotes = daos.map((dao) => {
					const endBlock = dao.endBlock ?? Number.MAX_SAFE_INTEGER;
					const isReferendumActiveForDelegate =
						(referendum.createdAtBlock && referendum.createdAtBlock >= dao.startBlock && referendum.createdAtBlock <= endBlock) ||
						(referendum.updatedAtBlock && referendum.updatedAtBlock >= dao.startBlock && referendum.updatedAtBlock <= endBlock) ||
						(!referendum.createdAtBlock && !referendum.updatedAtBlock);

					const vote = dvVotes.find((v) => v.voterAddress === dao.address);

					if (vote && isReferendumActiveForDelegate) {
						const power = BigInt(vote.totalVotingPower || '0');
						if (vote.decision === EVoteDecision.AYE) dvAyeTotal += power;
						else if (vote.decision === EVoteDecision.NAY) dvNayTotal += power;
					}

					return {
						address: dao.address,
						decision: vote && isReferendumActiveForDelegate ? vote.decision : 'novote',
						votingPower: vote && isReferendumActiveForDelegate ? vote.totalVotingPower : undefined,
						percentage: 0
					};
				});

				const guardianVotes = guardians.map((guardian) => {
					const endBlock = guardian.endBlock ?? Number.MAX_SAFE_INTEGER;
					const isReferendumActiveForDelegate =
						(referendum.createdAtBlock && referendum.createdAtBlock >= guardian.startBlock && referendum.createdAtBlock <= endBlock) ||
						(referendum.updatedAtBlock && referendum.updatedAtBlock >= guardian.startBlock && referendum.updatedAtBlock <= endBlock) ||
						(!referendum.createdAtBlock && !referendum.updatedAtBlock);

					const vote = dvVotes.find((v) => v.voterAddress === guardian.address);

					if (vote && isReferendumActiveForDelegate) {
						const power = BigInt(vote.totalVotingPower || '0');
						if (vote.decision === EVoteDecision.AYE) dvAyeTotal += power;
						else if (vote.decision === EVoteDecision.NAY) dvNayTotal += power;
					}

					return {
						address: guardian.address,
						decision: vote && isReferendumActiveForDelegate ? vote.decision : 'novote',
						votingPower: vote && isReferendumActiveForDelegate ? vote.totalVotingPower : undefined,
						percentage: 0
					};
				});

				const dvTotal = dvAyeTotal + dvNayTotal;
				const tally = referendum.voteMetrics;
				const ayeValue = BigInt(tally?.ayes?.value || '0');
				const nayValue = BigInt(tally?.nays?.value || '0');
				const totalValue = ayeValue + nayValue;
				const isPass = ayeValue > nayValue;

				const noDvAye = ayeValue - dvAyeTotal;
				const noDvNay = nayValue - dvNayTotal;
				const noDvIsPass = noDvAye > noDvNay;

				let influence = EInfluenceStatus.NO_IMPACT;
				if (isPass !== noDvIsPass) {
					influence = isPass ? EInfluenceStatus.APPROVED : EInfluenceStatus.REJECTED;
				}

				return {
					index: referendum.index || 0,
					title: referendum.description?.substring(0, 50) || `Referendum #${referendum.index}`,
					track: referendum.origin || 'Unknown',
					status: referendum.status || EProposalStatus.Unknown,
					ayePercent: totalValue > 0 ? Number((ayeValue * BigInt(100)) / totalValue) : 50,
					nayPercent: totalValue > 0 ? Number((nayValue * BigInt(100)) / totalValue) : 50,
					dvTotalVotingPower: dvTotal.toString(),
					dvAyeVotingPower: dvAyeTotal.toString(),
					dvNayVotingPower: dvNayTotal.toString(),
					dvPercentage: totalValue > 0 ? Number((dvTotal * BigInt(1000)) / totalValue) / 10 : 0,
					influence,
					delegateVotes,
					guardianVotes
				} as IDVReferendumInfluence;
			} catch (error) {
				console.error(`Error processing influence data for referendum ${referendum.index}:`, error);
				return {
					index: referendum.index || 0,
					title: `Referendum #${referendum.index}`,
					track: referendum.origin || 'Unknown',
					status: referendum.status || EProposalStatus.Unknown,
					ayePercent: 50,
					nayPercent: 50,
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
	}

	static async getVotingMatrix(
		network: ENetwork,
		cohort: IDVCohort,
		trackFilter = EDVTrackFilter.DV_TRACKS
	): Promise<{ referendumIndices: number[]; delegates: IDVDelegateVotingMatrix[] }> {
		const allowedTracks = trackFilter === EDVTrackFilter.DV_TRACKS ? cohort.tracks : null;
		const cohortReferenda = await this.getCohortReferenda(network, cohort.startTime, cohort.endTime, allowedTracks);

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
				votes[idx] = 'novote';
			});

			votesResponse.items.forEach((vote) => {
				if (vote.proposalIndex !== undefined && delegateReferendumIndices.includes(vote.proposalIndex)) {
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

		return {
			referendumIndices: Array.from(allDelegateReferendumIndices).sort((a, b) => a - b),
			delegates
		};
	}
}
