// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { atom } from 'jotai';
import { IProxyRequest } from '@/_shared/types';

interface IProxyData {
	items: IProxyRequest[];
	totalCount: number;
}

export const allProxiesAtom = atom<IProxyData>({
	items: [],
	totalCount: 0
});
