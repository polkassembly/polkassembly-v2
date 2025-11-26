// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { atom } from 'jotai';
import { IDelegateXAccount } from '@/_shared/types';

export interface IDelegateXData {
	address: string;
	bio: string;
	votingPower: string;
	ayeCount: number;
	nayCount: number;
	abstainCount: number;
	votesPast30Days: number;
	totalVotingPower: string;
	totalVotesPast30Days: number;
	totalDelegators: number;
}

export interface IDelegateXState {
	data: IDelegateXData | null;
	account: IDelegateXAccount | null;
	isLoading: boolean;
	error: string | null;
}

export const delegateXAtom = atom<IDelegateXState>({
	data: null,
	account: null,
	isLoading: false,
	error: null
});
