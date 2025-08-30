// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN, BN_MAX_INTEGER } from '@polkadot/util';

export interface VoteLockData {
	endBlock: BN;
	locked: string;
	refId: BN;
	total: BN;
	track: BN;
}

interface VoteData {
	isStandard?: boolean;
	asStandard?: {
		balance: BN;
		vote: {
			isAye: boolean;
			isNay?: boolean;
			conviction: {
				index: number;
				type: string;
			};
		};
	};
	isSplitAbstain?: boolean;
	asSplitAbstain?: {
		abstain: BN;
		aye: BN;
		nay: BN;
	};
	isSplit?: boolean;
	asSplit?: {
		aye: BN;
		nay: BN;
	};
}

interface VoteCasting {
	votes: [BN, VoteData][];
}

interface TallyData {
	isOngoing?: boolean;
	isKilled?: boolean;
	asKilled?: BN;
	isCancelled?: boolean;
	asCancelled?: [BN];
	isTimedOut?: boolean;
	asTimedOut?: [BN];
	isApproved?: boolean;
	asApproved?: [BN];
	isRejected?: boolean;
	asRejected?: [BN];
}

function calculateVoteBalance(accountVote: VoteData): BN | null {
	if (accountVote.isStandard && accountVote.asStandard?.balance) {
		return accountVote.asStandard.balance;
	}
	if (accountVote.isSplitAbstain && accountVote.asSplitAbstain) {
		const { abstain, aye, nay } = accountVote.asSplitAbstain;
		return aye.add(nay).add(abstain);
	}
	if (accountVote.isSplit && accountVote.asSplit) {
		const { aye, nay } = accountVote.asSplit;
		return aye.add(nay);
	}
	return null;
}

function getConvictionInfo(accountVote: VoteData, tally: TallyData): { conviction: number; locked: string } {
	if (accountVote.isStandard && accountVote.asStandard) {
		const { vote } = accountVote.asStandard;
		if ((tally.isApproved && vote.isAye) || (tally.isRejected && vote.isNay)) {
			return { conviction: vote.conviction.index, locked: vote.conviction.type };
		}
	}
	return { conviction: 0, locked: 'None' };
}

function calculateEndBlock(tally: TallyData, lockPeriod: BN, convictionMultipliers: number[], conviction: number): BN | null {
	if (tally.isOngoing) {
		return BN_MAX_INTEGER;
	}
	if (tally.isKilled && tally.asKilled) {
		return tally.asKilled;
	}
	if (tally.isCancelled && tally.asCancelled) {
		return tally.asCancelled[0];
	}
	if (tally.isTimedOut && tally.asTimedOut) {
		return tally.asTimedOut[0];
	}
	if (tally.isApproved && tally.asApproved) {
		const finishedAt = tally.asApproved[0];
		const lockBlocks = lockPeriod.muln(convictionMultipliers[conviction] || 0);
		return lockBlocks.add(finishedAt);
	}
	if (tally.isRejected && tally.asRejected) {
		const finishedAt = tally.asRejected[0];
		const lockBlocks = lockPeriod.muln(convictionMultipliers[conviction] || 0);
		return lockBlocks.add(finishedAt);
	}
	return null;
}

function processVoteLock(refId: BN, track: BN, accountVote: VoteData, tally: TallyData, lockPeriod: BN, convictionMultipliers: number[]): VoteLockData | null {
	const totalBalance = calculateVoteBalance(accountVote);
	if (!totalBalance) return null;

	const { conviction, locked } = getConvictionInfo(accountVote, tally);
	const endBlock = calculateEndBlock(tally, lockPeriod, convictionMultipliers, conviction);
	if (!endBlock) return null;

	return { endBlock, locked, refId, total: totalBalance, track };
}

export function getAllLockData(
	votes: [track: BN, refIds: BN[], casting: VoteCasting][],
	referendas: [BN, TallyData][],
	lockPeriod: BN,
	convictionMultipliers: number[]
): VoteLockData[] {
	const locks: VoteLockData[] = [];

	votes.forEach(([track, , casting]) => {
		casting.votes.forEach(([refId, accountVote]) => {
			const referendaInfo = referendas.find(([id]) => Number(id) === Number(refId));
			if (referendaInfo) {
				const lockData = processVoteLock(refId, track, accountVote, referendaInfo[1], lockPeriod, convictionMultipliers);
				if (lockData) {
					locks.push(lockData);
				}
			}
		});
	});

	return locks;
}
