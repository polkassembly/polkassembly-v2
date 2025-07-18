// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { atom } from 'jotai';

interface ICurrentTokenPriceCache {
	price: string | null;
	timestamp: number | null;
}

export const tokenUSDPriceCacheAtom = atom<ICurrentTokenPriceCache>({ price: null, timestamp: null });
