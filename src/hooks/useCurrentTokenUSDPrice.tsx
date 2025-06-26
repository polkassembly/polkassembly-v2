// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { tokenUSDPriceCacheAtom } from '@/app/_atoms/tokenUSDPrice/tokenUSDPriceCacheAtom';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';

interface CoinGeckoResponse {
	[network: string]: { usd: number; usd_24h_change: number };
}

const CACHE_DURATION = FIVE_MIN_IN_MILLI;

export const useTokenUSDPrice = () => {
	const [tokenUSDPriceCache, setTokenUSDPriceCache] = useAtom(tokenUSDPriceCacheAtom);
	const network = getCurrentNetwork();

	const fetchNativeTokenPriceInUsd = async () => {
		const response = await (await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${network}&vs_currencies=usd&include_24hr_change=true`)).json();
		// check if data is of type CoinGeckoResponse
		if (!response || typeof response !== 'object' || !(network in response) || !('usd' in response[String(network)]) || typeof response[String(network)]?.usd !== 'number') {
			return null;
		}

		const data = response as CoinGeckoResponse;
		return data[String(network)].usd.toString();
	};

	const getCachedTokenUSDPrice = async () => {
		const cachedData = tokenUSDPriceCache;

		const now = Date.now();

		// If we have valid cached data, return it
		if (cachedData && cachedData.timestamp && now - cachedData.timestamp < CACHE_DURATION) {
			return cachedData.price;
		}

		const nativeTokenUsdPrice = await fetchNativeTokenPriceInUsd();

		// Update cache
		setTokenUSDPriceCache((prev) => ({
			...prev,
			price: nativeTokenUsdPrice || null,
			timestamp: now
		}));

		return nativeTokenUsdPrice || null;
	};

	return useMemo(() => {
		return {
			getCachedTokenUSDPrice
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tokenUSDPriceCache]);
};
