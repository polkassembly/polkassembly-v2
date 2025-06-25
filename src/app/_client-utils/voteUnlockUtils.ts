// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN, BN_ZERO } from '@polkadot/util';
import { IVoteLock, IVotingLocks, ENetwork, INextUnlockData } from '@/_shared/types';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';

export interface TimeRemaining {
	days: number;
	hours: number;
	minutes: number;
	totalSeconds: number;
}

export interface FormattedTimeRemaining {
	formatted: string;
	raw: TimeRemaining;
}

/**
 * Calculate time remaining from blocks using network-specific block times
 */
export const getTimeRemainingFromBlocks = (blocks: BN, network: ENetwork): TimeRemaining => {
	const { totalSeconds } = BlockCalculationsService.getTimeForBlocks({ network, blocks });

	const days = Math.floor(totalSeconds / (24 * 60 * 60));
	const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
	const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

	return { days, hours, minutes, totalSeconds };
};

/**
 * Format time remaining with internationalization support
 */
export const formatTimeRemaining = (timeRemaining: TimeRemaining, t: (key: string) => string): string => {
	const { days, hours, minutes } = timeRemaining;

	if (days > 0) {
		return `${days} ${t('Profile.days')}, ${hours} ${t('Profile.hours')}`;
	}
	if (hours > 0) {
		return `${hours} ${t('Profile.hours')}, ${minutes} ${t('Profile.minutes')}`;
	}
	if (minutes > 0) {
		return `${minutes} ${t('Profile.minutes')}`;
	}
	return t('Profile.LessThanOneMinute');
};

/**
 * Get formatted time remaining from blocks
 */
export const getFormattedTimeFromBlocks = (blocks: BN, network: ENetwork, t: (key: string) => string): FormattedTimeRemaining => {
	const raw = getTimeRemainingFromBlocks(blocks, network);
	const formatted = formatTimeRemaining(raw, t);

	return { formatted, raw };
};

/**
 * Find the vote with the closest unlock time from a collection of votes
 */
export const findClosestUnlockVote = (votes: IVoteLock[]): IVoteLock | null => {
	if (votes.length === 0) return null;

	return votes.reduce((closest, current) => {
		if (!closest.blocksRemaining || !current.blocksRemaining) return closest;
		return current.blocksRemaining.lt(closest.blocksRemaining) ? current : closest;
	});
};

/**
 * Calculate total unlockable balance (max of all unlockable vote balances)
 */
export const calculateTotalUnlockableBalance = (unlockableVotes: IVoteLock[]): BN => {
	return unlockableVotes.reduce((total, vote) => {
		return total.gt(vote.balance) ? total : vote.balance;
	}, BN_ZERO);
};

/**
 * Get comprehensive data for the next unlock from locked and ongoing votes
 */
export const getNextUnlockData = (votingLocks: IVotingLocks, network: ENetwork, t: (key: string) => string): INextUnlockData | null => {
	const allLockedVotes = [...votingLocks.lockedVotes, ...votingLocks.ongoingVotes];
	const closestVote = findClosestUnlockVote(allLockedVotes);

	if (!closestVote?.blocksRemaining) return null;

	const unlockTime = getFormattedTimeFromBlocks(closestVote.blocksRemaining, network, t).formatted;

	return {
		unlockTime,
		refId: closestVote.refId,
		track: closestVote.track,
		lockedAtBlock: closestVote.lockedAtBlock,
		endBlock: closestVote.endBlock,
		balance: closestVote.balance,
		conviction: closestVote.conviction,
		status: closestVote.status,
		blocksRemaining: closestVote.blocksRemaining
	};
};

/**
 * Get the closest unlock time from locked and ongoing votes (legacy function for backward compatibility)
 */
export const getnextUnlockTime = (votingLocks: IVotingLocks, network: ENetwork, t: (key: string) => string): string | null => {
	const nextUnlockData = getNextUnlockData(votingLocks, network, t);
	return nextUnlockData?.unlockTime || null;
};

/**
 * Check if component should show on referenda page
 */
export const shouldShowOnReferendaPage = (isReferendaPage: boolean, unlockableVotes: IVoteLock[], referendumIndex?: number): boolean => {
	return !isReferendaPage || unlockableVotes.some((vote) => vote.refId === referendumIndex?.toString());
};

/**
 * Combine locked and ongoing votes for display
 */
export const combineLockedVotes = (votingLocks: IVotingLocks): IVoteLock[] => {
	return votingLocks.lockedVotes.concat(votingLocks.ongoingVotes);
};

/**
 * Process voting locks data for optimized rendering
 */
export const processVotingLocksForDisplay = (votingLocks: IVotingLocks) => {
	const totalUnlockableBalance = calculateTotalUnlockableBalance(votingLocks.unlockableVotes);
	const combinedLockedVotes = combineLockedVotes(votingLocks);

	return {
		totalUnlockableBalance,
		combinedLockedVotes,
		hasUnlockableVotes: votingLocks.unlockableVotes.length > 0,
		hasLockedVotes: combinedLockedVotes.length > 0
	};
};

/**
 * Memoized time calculation to prevent unnecessary recalculations
 */
const timeCalculationCache = new Map<string, FormattedTimeRemaining>();

export const getMemoizedTimeFromBlocks = (blocks: BN, network: ENetwork, t: (key: string) => string): FormattedTimeRemaining => {
	const cacheKey = `${blocks.toString()}-${network}`;

	if (timeCalculationCache.has(cacheKey)) {
		const cached = timeCalculationCache.get(cacheKey)!;
		// Re-format with current translation function
		return {
			formatted: formatTimeRemaining(cached.raw, t),
			raw: cached.raw
		};
	}

	const result = getFormattedTimeFromBlocks(blocks, network, t);
	timeCalculationCache.set(cacheKey, result);

	// Clear cache if it gets too large (prevent memory leaks)
	if (timeCalculationCache.size > 100) {
		const firstKey = timeCalculationCache.keys().next().value;
		if (firstKey) {
			timeCalculationCache.delete(firstKey);
		}
	}

	return result;
};
