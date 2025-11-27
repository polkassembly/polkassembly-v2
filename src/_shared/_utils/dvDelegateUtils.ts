// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import { DV_COHORTS_KUSAMA, DV_COHORTS_POLKADOT } from '../_constants/dvCohorts';
import { NETWORKS_DETAILS } from '../_constants/networks';
import { ECohortStatus, ENetwork, IDVCohort, EDVDelegateType, EVoteDecision, IProfileVote, EProposalStatus, IStatusHistoryItem } from '../types';

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
	const endDate = cohort.endTime || new Date();
	const days = Math.floor((endDate.getTime() - cohort.startTime.getTime()) / MS_PER_DAY);
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
	return cohort.delegates.filter((d) => d.type === type);
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

		const isClosed = [EProposalStatus.Executed, EProposalStatus.Approved, EProposalStatus.Rejected, EProposalStatus.TimedOut, EProposalStatus.Cancelled].includes(
			status as EProposalStatus
		);

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
