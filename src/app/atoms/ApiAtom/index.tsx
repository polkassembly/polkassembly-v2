// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import { atom, useAtom } from 'jotai';

const apiAtom = atom<ApiPromise | null>(null);

export const useApiAtom = () => {
	const [api, setApi] = useAtom(apiAtom);
	return { api, setApi };
};
