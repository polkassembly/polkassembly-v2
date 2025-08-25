// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { atom } from 'jotai';

interface ITipModalState {
	open: boolean;
	beneficiaryAddress?: string;
}

export const tipModalAtom = atom<ITipModalState>({
	open: false
});
