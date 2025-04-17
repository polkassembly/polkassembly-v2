// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { atom, useAtom } from 'jotai';
import { ILinkedAddress } from '@/_shared/types';

export const linkedAddressAtom = atom<ILinkedAddress | null>(null);

export const useLinkedAddress = () => {
	const [linkedAddress, setLinkedAddress] = useAtom(linkedAddressAtom);

	return { linkedAddress, setLinkedAddress };
};
