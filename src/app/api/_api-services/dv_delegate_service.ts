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
	IDVDelegateVotingMatrix,
	IDVDelegateWithStats,
	IOnChainPostListing,
	IProfileVote,
	EDVDelegateType,
	EDVTrackFilter,
	EInfluenceStatus,
	IStatusHistoryItem,
	IVoteMetrics
} from '@/_shared/types';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { RedisService } from './redis_service';

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
		const limit = 1000;

		const delegateAddresses = cohort.delegates.map((d) => d.address);
		const votedProposalsPromise = this.fetchAllPages<IOnChainPostListing>(async (page) => {
			const votesListing = await OnChainDbService.GetVotesForAddressesAndReferenda({
				network,
				voters: delegateAddresses,
				startBlock,
				endBlock: endBlock || (await OnChainDbService.GetLatestBlockNumber(network)),
				limit,
				page
			});

			return (
				votesListing.items?.map((vote) => {
					return vote.proposal as IOnChainPostListing;
				}) || []
			);
		}, limit);

		const votedProposals = await votedProposalsPromise;

		const allItemsMap = new Map<number, IOnChainPostListing>();
		votedProposals.forEach((item) => {
			if (item && item.index !== undefined && !allItemsMap.has(item.index)) {
				allItemsMap.set(item.index, item);
			}
		});

		const allItems = Array.from(allItemsMap.values());
		console.log('first item', allItems[0]);
		console.log('last item', allItems[allItems.length - 1]);

		const filteredItems = allItems
			.filter((r) => {
				if (allowedTracks && r.origin && !allowedTracks.includes(r.origin as EPostOrigin)) return false;
				if (r.createdAtBlock && r.createdAtBlock < startBlock) return false;
				return !(endBlock && r.createdAtBlock && r.createdAtBlock > endBlock);
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
			}));

		console.log('filteredItems', filteredItems[0]);
		console.log('filteredItems', filteredItems[filteredItems.length - 1]);

		return filteredItems;
	}

	static filterReferendaForDelegate(
		referenda: { index: number; status: EProposalStatus; createdAtBlock?: number; updatedAtBlock?: number }[],
		delegateStartBlock: number,
		delegateEndBlock: number | null
	): number[] {
		const endBlock = delegateEndBlock ?? Number.MAX_SAFE_INTEGER;
		return referenda
			.filter((r) => {
				return (
					(r.createdAtBlock && r.createdAtBlock >= delegateStartBlock && r.createdAtBlock <= endBlock) ||
					(r.updatedAtBlock && r.updatedAtBlock >= delegateStartBlock && r.updatedAtBlock <= endBlock)
				);
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
			const votes = await this.fetchAllPages<IProfileVote>(async (page) => {
				const response = await OnChainDbService.GetVotesForAddressesAndReferenda({
					network,
					voters: [address],
					page,
					limit: 1000,
					startBlock: startBlock || 0,
					endBlock: endBlock || (await OnChainDbService.GetLatestBlockNumber(network))
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

		const delegatesWithStats = await Promise.all(statsPromises);
		await RedisService.SetDVDelegates({ network, cohortId: cohort.index.toString(), trackFilter, data: delegatesWithStats });

		return delegatesWithStats;
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

				let influence = EInfluenceStatus.NO_IMPACT;
				const totalAye = BigInt(referendum.voteMetrics?.aye?.value || '0');
				const totalNay = BigInt(referendum.voteMetrics?.nay?.value || '0');

				const ayeWithoutDV = totalAye - dvAyeTotal;
				const nayWithoutDV = totalNay - dvNayTotal;

				const { status } = referendum;
				const isPassed = [EProposalStatus.Executed, EProposalStatus.Approved, EProposalStatus.Confirmed].includes(status as EProposalStatus);
				const isFailed = [EProposalStatus.Rejected, EProposalStatus.TimedOut, EProposalStatus.Cancelled].includes(status as EProposalStatus);

				let wouldPassWithoutDv = isPassed;

				if (isPassed && ayeWithoutDV <= nayWithoutDV) {
					wouldPassWithoutDv = false;
				} else if (isFailed && ayeWithoutDV > nayWithoutDV) {
					wouldPassWithoutDv = true;
				}

				if (isPassed && !wouldPassWithoutDv) {
					influence = EInfluenceStatus.APPROVED;
				} else if (isFailed && wouldPassWithoutDv) {
					influence = EInfluenceStatus.REJECTED;
				}

				const dvTotal = dvAyeTotal + dvNayTotal;
				const tally = referendum.voteMetrics;
				const ayeValue = BigInt(tally?.[EVoteDecision.AYE]?.value || '0');
				const nayValue = BigInt(tally?.[EVoteDecision.NAY]?.value || '0');
				const totalValue = ayeValue + nayValue;

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
				votes[idx] = 'novote';
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
