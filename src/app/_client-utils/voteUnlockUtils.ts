// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN, BN_ZERO } from '@polkadot/util';
import { IVoteLock, IVotingLocks } from '@/_shared/types';

/**
 * Calculate total unlockable balance (max of all unlockable vote balances)
 */
export const calculateTotalUnlockableBalance = (unlockableVotes: IVoteLock[]): BN => {
	return unlockableVotes.reduce((total, vote) => {
		return total.gt(vote.balance) ? total : vote.balance;
	}, BN_ZERO);
};

/**
 * Get the next unlock information for display
 */
export const getNextUnlockData = (votingLocks: IVotingLocks): IVoteLock | null => {
	// First check for unlockable votes (highest priority)
	if (votingLocks.unlockableVotes.length > 0) {
		return votingLocks.unlockableVotes.reduce((max, vote) => (vote.balance.gt(max.balance) ? vote : max));
	}

	// Then check for locked votes (next unlock)
	if (votingLocks.lockedVotes.length > 0) {
		// Sort by end block and return the closest one
		const sortedLocked = [...votingLocks.lockedVotes].sort((a, b) => {
			if (!a.endBlock || !b.endBlock) return 0;
			return a.endBlock.cmp(b.endBlock);
		});
		return sortedLocked[0];
	}

	// Finally check for ongoing votes
	if (votingLocks.ongoingVotes.length > 0) {
		return votingLocks.ongoingVotes.reduce((max, vote) => (vote.balance.gt(max.balance) ? vote : max));
	}

	return null;
};

/**
 * Combine locked and ongoing votes for display
 */
export const combineLockedVotes = (votingLocks: IVotingLocks): IVoteLock[] => {
	return [...votingLocks.lockedVotes, ...votingLocks.ongoingVotes];
};
