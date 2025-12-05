// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import { DV_COHORTS_KUSAMA, DV_COHORTS_POLKADOT } from '../_constants/dvCohorts';
import { NETWORKS_DETAILS } from '../_constants/networks';
import {
	ECohortStatus,
	ENetwork,
	IDVCohort,
	EDVDelegateType,
	EVoteDecision,
	IProfileVote,
	EProposalStatus,
	IStatusHistoryItem,
	IDVCohortVote,
	IDVDReferendumResponse,
	IDVDelegateWithStats,
	IDVReferendumInfluence,
	IDVDelegateVotingMatrix,
	EInfluenceStatus,
	IDVDelegateVote
} from '../types';

export function calculateDVCohortStats(votes: IDVCohortVote[], referenda: IDVDReferendumResponse[], cohort: IDVCohort): { delegatesWithStats: IDVDelegateWithStats[] } {
	const getWinningVoteIncrement = (vote: IDVCohortVote, referendum: IDVDReferendumResponse): number => {
		if (vote.isSplit || vote.isSplitAbstain) return 0;

		const isClosed = [
			EProposalStatus.Executed,
			EProposalStatus.Approved,
			EProposalStatus.Rejected,
			EProposalStatus.TimedOut,
			EProposalStatus.Cancelled,
			EProposalStatus.Confirmed
		].includes(referendum.status);

		if (!isClosed) return 0;

		const passed = [EProposalStatus.Executed, EProposalStatus.Approved, EProposalStatus.Confirmed].includes(referendum.status);
		if ((passed && vote.aye) || (!passed && !vote.aye)) {
			return 1;
		}
		return 0;
	};

	const getVoteStatsIncrement = (
		vote: IDVCohortVote,
		referendum: IDVDReferendumResponse | undefined
	): { ayeCount: number; nayCount: number; abstainCount: number; winningVotes: number } => {
		const result = { ayeCount: 0, nayCount: 0, abstainCount: 0, winningVotes: 0 };

		if (!referendum) return result;

		if (vote.isSplit || vote.isSplitAbstain) {
			if (BigInt(vote.ayeBalance || 0) > 0) result.ayeCount = 1;
			if (BigInt(vote.nayBalance || 0) > 0) result.nayCount = 1;
			if (BigInt(vote.abstainBalance || 0) > 0) result.abstainCount = 1;
		} else if (vote.aye) {
			result.ayeCount = 1;
		} else if (vote.balance) {
			result.nayCount = 1;
		}

		result.winningVotes = getWinningVoteIncrement(vote, referendum);
		return result;
	};

	const delegatesWithStats = cohort.delegates.map((delegate) => {
		const delegateVotes = votes.filter((v) => v.account === delegate.address);
		const stats = {
			ayeCount: 0,
			nayCount: 0,
			abstainCount: 0,
			winningVotes: 0
		};

		delegateVotes.forEach((vote) => {
			const referendum = referenda.find((r) => r.index === vote.referendumIndex);
			const increment = getVoteStatsIncrement(vote, referendum);
			stats.ayeCount += increment.ayeCount;
			stats.nayCount += increment.nayCount;
			stats.abstainCount += increment.abstainCount;
			stats.winningVotes += increment.winningVotes;
		});

		const totalVotes = stats.ayeCount + stats.nayCount + stats.abstainCount;
		const participation = referenda.length > 0 ? (totalVotes / referenda.length) * 100 : 0;
		const winRate = delegateVotes.length > 0 ? (stats.winningVotes / delegateVotes.length) * 100 : 0;

		return {
			...delegate,
			voteStats: {
				ayeCount: stats.ayeCount,
				nayCount: stats.nayCount,
				abstainCount: stats.abstainCount,
				participation,
				winRate
			}
		};
	});

	return { delegatesWithStats };
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_MONTH = 30;
const DEFAULT_MAX_PAGES = 10;
const DEFAULT_START_PAGE = 1;
const LOCK_PERIOD_DIVISOR = 10;

export function formatNumber(num: number): string {
	if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
	if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
	return num.toString();
}

export function formatDelegationAmount(amount: string | number, network: ENetwork): string {
	if (!amount) return '0';
	const { tokenDecimals, tokenSymbol } = NETWORKS_DETAILS[network];
	// Handle potential scientific notation or precision issues if it's a number
	const safeAmount = typeof amount === 'number' ? BigInt(amount.toLocaleString('fullwide', { useGrouping: false }).split('.')[0]) : BigInt(amount);
	const divisor = BigInt(10) ** BigInt(tokenDecimals);
	const wholeUnits = safeAmount / divisor;
	const num = Number(wholeUnits);
	return `${formatNumber(num)} ${tokenSymbol}`;
}

export function formatDate(date: Date): { date: string; time: string } {
	const d = dayjs(date);
	return { date: d.format("MMM D 'YY"), time: d.format('HH:mm:ss') };
}

export function formatDateWithYear(date: Date): string {
	return dayjs(date).format("MMM D 'YY");
}

export function formatDateRange(startDate: Date, endDate?: Date, isOngoing?: boolean): string {
	const startStr = formatDateWithYear(startDate);
	if (isOngoing) {
		return startStr;
	}
	const endStr = endDate ? formatDateWithYear(endDate) : '';
	return `${startStr} - ${endStr}`;
}

export function getCohortTenureDays(cohort: IDVCohort): number {
	const startTime = new Date(cohort.startTime);
	const endTime = cohort.endTime ? new Date(cohort.endTime) : new Date();
	const days = Math.floor((endTime.getTime() - startTime.getTime()) / MS_PER_DAY);
	return Math.max(0, days);
}

export function getDVCohortsByNetwork(network: ENetwork): IDVCohort[] {
	if (network === ENetwork.KUSAMA) return DV_COHORTS_KUSAMA;
	if (network === ENetwork.POLKADOT) return DV_COHORTS_POLKADOT;
	return [];
}

export function getCurrentDVCohort(network: ENetwork): IDVCohort | null {
	const cohorts = getDVCohortsByNetwork(network);
	return cohorts.find((c) => c.status === ECohortStatus.ONGOING) || null;
}

export function getDVCohortByIndex(network: ENetwork, index: number): IDVCohort | null {
	const cohorts = getDVCohortsByNetwork(network);
	return cohorts.find((c) => c.index === index) || null;
}

export function getOneMonthBufferInBlocks(network: ENetwork): number {
	const { blockTime } = NETWORKS_DETAILS[network];
	const oneMonthInMs = DAYS_PER_MONTH * MS_PER_DAY;
	return Math.floor(oneMonthInMs / blockTime);
}

export function getAdjustedStartBlock(network: ENetwork, startBlock: number): number {
	const buffer = getOneMonthBufferInBlocks(network);
	return Math.max(0, startBlock - buffer);
}

export function getDelegatesByType(cohort: IDVCohort, type: EDVDelegateType) {
	return cohort.delegates.filter((d) => d.role === type);
}

export async function fetchAllPages<T>(fetcher: (page: number) => Promise<T[]>, maxPages = DEFAULT_MAX_PAGES, page = DEFAULT_START_PAGE, acc: T[] = []): Promise<T[]> {
	if (page > maxPages) return acc;
	const items = await fetcher(page);
	if (items.length === 0) return acc;
	return fetchAllPages(fetcher, maxPages, page + 1, [...acc, ...items]);
}

export function filterReferendaForDelegate(
	referenda: { index: number; status: EProposalStatus; createdAtBlock?: number; updatedAtBlock?: number }[],
	delegateStartBlock: number,
	delegateEndBlock: number | null
): number[] {
	const endBlock = delegateEndBlock ?? Number.MAX_SAFE_INTEGER;

	return referenda
		.filter((r) => {
			const createdAt = r.createdAtBlock || 0;
			const updatedAt = r.updatedAtBlock;

			if (!createdAt && !updatedAt) {
				return delegateEndBlock === null;
			}

			if (!updatedAt || updatedAt === 0) {
				return createdAt >= delegateStartBlock && createdAt <= endBlock;
			}

			return updatedAt >= delegateStartBlock && updatedAt <= endBlock;
		})
		.map((r) => r.index);
}

export function isReferendumActiveForDelegate(referendum: { createdAtBlock?: number; updatedAtBlock?: number }, delegate: IDVCohort['delegates'][0]): boolean {
	const isOngoingDelegate = delegate.endBlock === null;

	if (!referendum.createdAtBlock && !referendum.updatedAtBlock) {
		return isOngoingDelegate;
	}

	const endBlock = delegate.endBlock ?? Number.MAX_SAFE_INTEGER;
	const createdAt = referendum.createdAtBlock || 0;
	const updatedAt = referendum.updatedAtBlock;

	if (!updatedAt || updatedAt === 0) {
		return createdAt >= delegate.startBlock && createdAt <= endBlock;
	}

	return updatedAt >= delegate.startBlock && updatedAt <= endBlock;
}

export function getVotePower(vote: IProfileVote): bigint {
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
			power /= BigInt(LOCK_PERIOD_DIVISOR);
		} else {
			power *= BigInt(lockPeriod);
		}
	}
	return power;
}

export interface IVoteStatsResult {
	ayeCount: number;
	nayCount: number;
	abstainCount: number;
	winningVotes: number;
}

export function calculateVoteStats(votes: IProfileVote[], cohortEndTime?: Date): IVoteStatsResult {
	let ayeCount = 0;
	let nayCount = 0;
	let abstainCount = 0;
	let winningVotes = 0;

	votes.forEach((vote) => {
		const { proposal, decision } = vote;
		let status = proposal?.status;

		const timeline = (proposal && 'statusHistory' in proposal ? proposal.statusHistory : []) as IStatusHistoryItem[];

		if (cohortEndTime && timeline.length > 0) {
			const validHistory = timeline
				.filter((h) => new Date(h.timestamp).getTime() <= cohortEndTime.getTime())
				.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

			if (validHistory.length > 0) {
				status = validHistory[0].status;
			}
		}

		const isClosed = [
			EProposalStatus.Executed,
			EProposalStatus.Approved,
			EProposalStatus.Rejected,
			EProposalStatus.TimedOut,
			EProposalStatus.Cancelled,
			EProposalStatus.Confirmed
		].includes(status as EProposalStatus);

		if (decision === EVoteDecision.AYE) {
			ayeCount += 1;
			if (isClosed && (status === EProposalStatus.Executed || status === EProposalStatus.Approved || status === EProposalStatus.Confirmed)) {
				winningVotes += 1;
			}
		} else if (decision === EVoteDecision.NAY) {
			nayCount += 1;
			if (isClosed && (status === EProposalStatus.Rejected || status === EProposalStatus.TimedOut || status === EProposalStatus.Cancelled)) {
				winningVotes += 1;
			}
		} else {
			abstainCount += 1;
		}
	});

	return { ayeCount, nayCount, abstainCount, winningVotes };
}

export function calculateDVInfluence(
	votes: IDVCohortVote[],
	cohort: IDVCohort,
	referenda: IDVDReferendumResponse[],
	network: ENetwork
): { referendaInfluence: IDVReferendumInfluence[] } {
	const referendaInfluence: IDVReferendumInfluence[] = referenda.map((referendum) => {
		const refVotes = votes.filter((v) => v.referendumIndex === referendum.index);

		const delegateVotes: IDVDelegateVote[] = [];
		const guardianVotes: IDVDelegateVote[] = [];

		let dvAyePower = BigInt(0);
		let dvNayPower = BigInt(0);
		let dvAbstainPower = BigInt(0);

		refVotes.forEach((vote) => {
			let decision = EVoteDecision.ABSTAIN;
			let votingPower = BigInt(0);
			if (vote.isSplit || vote.isSplitAbstain) {
				dvAyePower += BigInt(vote.ayeVotes || 0);
				dvNayPower += BigInt(vote.nayVotes || 0);
				dvAbstainPower += BigInt(vote.abstainVotes || 0);
				votingPower = BigInt(vote.ayeVotes || 0) + BigInt(vote.nayVotes || 0) + BigInt(vote.abstainVotes || 0);
				// Determine major decision for display? Or just split?
				// For now, let's say split is abstain or we need a split type.
				// EVoteDecision has SPLIT and SPLIT_ABSTAIN?
				// Let's check EVoteDecision definition.
				// Assuming it has. If not, use ABSTAIN.
				decision = vote.isSplitAbstain ? EVoteDecision.SPLIT_ABSTAIN : EVoteDecision.SPLIT;
			} else if (vote.aye) {
				const totalVotes = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
				dvAyePower += totalVotes;
				votingPower = totalVotes;
				decision = EVoteDecision.AYE;
			} else if (!vote.aye) {
				const totalVotes = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
				dvNayPower += totalVotes;
				votingPower = totalVotes;
				decision = EVoteDecision.NAY;
			}

			const delegate = cohort.delegates.find((d) => d.address === vote.account);
			if (delegate) {
				const voteData: IDVDelegateVote = {
					address: vote.account,
					decision,
					votingPower: votingPower.toString(),
					balance: vote.balance,
					conviction: vote.conviction || 0
				};

				if (delegate.role === EDVDelegateType.DAO) {
					delegateVotes.push(voteData);
				} else {
					guardianVotes.push(voteData);
				}
			}
		});

		const totalAye = BigInt(referendum.tally?.ayes || 0);
		const totalNay = BigInt(referendum.tally?.nays || 0);

		const isPassed = [EProposalStatus.Executed, EProposalStatus.Approved, EProposalStatus.Confirmed].includes(referendum.status);
		const isFailed = [EProposalStatus.Rejected].includes(referendum.status);

		let influence = EInfluenceStatus.NO_IMPACT;

		if (dvAyePower === BigInt(0) && dvNayPower === BigInt(0)) {
			influence = EInfluenceStatus.NO_IMPACT;
		} else if (isPassed) {
			if (dvAyePower >= dvNayPower) influence = EInfluenceStatus.APPROVED;
			else influence = EInfluenceStatus.FAILED;
		} else if (isFailed) {
			if (dvNayPower >= dvAyePower) influence = EInfluenceStatus.REJECTED;
			else influence = EInfluenceStatus.FAILED;
		}

		const totalPower = dvAyePower + dvNayPower + dvAbstainPower;
		const turnout = totalAye + totalNay;

		const setPercentage = (votesList: IDVDelegateVote[]) => {
			votesList.forEach((v) => {
				const power = BigInt(v.votingPower);
				// eslint-disable-next-line no-param-reassign
				v.percentage = turnout > BigInt(0) ? Number((power * BigInt(10000)) / turnout) / 100 : 0;
			});
		};

		setPercentage(delegateVotes);
		setPercentage(guardianVotes);
		const ayePercent = turnout > BigInt(0) ? Number((totalAye * BigInt(10000)) / turnout) / 100 : 0;
		const nayPercent = turnout > BigInt(0) ? Number((totalNay * BigInt(10000)) / turnout) / 100 : 0;
		const { trackNumber } = referendum;
		const networkDetails = NETWORKS_DETAILS[network];
		const trackDetails = networkDetails?.trackDetails || {};
		const track = Object.values(trackDetails).find((t) => t && t.trackId === trackNumber);
		return {
			index: referendum.index,
			title: referendum.proposalArguments?.description || referendum.preimage?.proposedCall?.description || 'Untitled',
			track: track?.name ? track.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : '',
			status: referendum.status,
			ayeVotingPower: dvAyePower.toString(),
			nayVotingPower: dvNayPower.toString(),
			ayePercent,
			nayPercent,
			influence,
			dvTotalVotingPower: totalPower.toString(),
			delegateVotes,
			guardianVotes,
			totalAyeVotingPower: totalAye.toString(),
			totalNayVotingPower: totalNay.toString()
		};
	});

	return { referendaInfluence };
}

export function calculateDVVotingMatrix(
	votes: IDVCohortVote[],
	cohort: IDVCohort,
	referenda: IDVDReferendumResponse[]
): { votingMatrix: IDVDelegateVotingMatrix[]; referendumIndices: number[] } {
	const referendumIndices = referenda.map((r) => r.index).sort((a, b) => a - b);

	const votingMatrix: IDVDelegateVotingMatrix[] = cohort.delegates.map((delegate) => {
		const delegateVotes = votes.filter((v) => v.account === delegate.address);
		const votesMap: Record<number, EVoteDecision> = {};

		let activeCount = 0;
		let ayeCount = 0;

		delegateVotes.forEach((vote) => {
			if (vote.isSplit || vote.isSplitAbstain) {
				if (BigInt(vote.ayeBalance || 0) >= BigInt(vote.nayBalance || 0) && BigInt(vote.ayeBalance || 0) >= BigInt(vote.abstainBalance || 0)) {
					votesMap[vote.referendumIndex] = EVoteDecision.AYE;
					ayeCount += 1;
				} else if (BigInt(vote.nayBalance || 0) >= BigInt(vote.ayeBalance || 0) && BigInt(vote.nayBalance || 0) >= BigInt(vote.abstainBalance || 0)) {
					votesMap[vote.referendumIndex] = EVoteDecision.NAY;
				} else {
					votesMap[vote.referendumIndex] = EVoteDecision.ABSTAIN;
				}
				activeCount += 1;
			} else {
				if (vote.aye) {
					votesMap[vote.referendumIndex] = EVoteDecision.AYE;
					ayeCount += 1;
				} else if (vote.balance && !vote.aye) {
					votesMap[vote.referendumIndex] = EVoteDecision.NAY;
				} else {
					votesMap[vote.referendumIndex] = EVoteDecision.ABSTAIN;
				}
				activeCount += 1;
			}
		});

		const totalRefs = referenda.length;
		const participation = totalRefs > 0 ? (activeCount / totalRefs) * 100 : 0;
		const ayeRate = activeCount > 0 ? (ayeCount / activeCount) * 100 : 0;

		return {
			address: delegate.address,
			type: delegate.role,
			votes: votesMap,
			participation,
			ayeRate,
			activeCount,
			totalRefs
		};
	});

	return { votingMatrix, referendumIndices };
}
