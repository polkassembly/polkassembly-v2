// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IUser } from '@shared/types';
import { atom, useAtom } from 'jotai';

const userAtom = atom<IUser | null>(null);

export const useUserAtom = () => {
	const [api, setApi] = useAtom(userAtom);
	return { api, setApi };
};
