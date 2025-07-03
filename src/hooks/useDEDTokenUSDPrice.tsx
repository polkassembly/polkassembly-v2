// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { dedTokenUSDPriceCacheAtom } from '@/app/_atoms/dedTokenUSDPrice/dedTokenUSDPriceAtom';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import { EAssets } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';

interface CoinGeckoResponse {
	[network: string]: { usd: number; usd_24h_change: number };
}

const CACHE_DURATION = FIVE_MIN_IN_MILLI;

export const useDEDTokenUSDPrice = () => {
	const [dedTokenUSDPriceCache, setDEDTokenUSDPriceCache] = useAtom(dedTokenUSDPriceCacheAtom);
	const ids = treasuryAssetsData[EAssets.DED].name;
	const network = getCurrentNetwork();

	const fetchNativeTokenPriceInUsd = async () => {
		const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`).then((res) => res.json());
		// check if data is of type CoinGeckoResponse
		if (!response || typeof response !== 'object' || !(ids in response) || !('usd' in response[String(ids)]) || typeof response[String(ids)]?.usd !== 'number') {
			return null;
		}

		const data = response as CoinGeckoResponse;
		return data[String(ids)].usd.toString();
	};

	const getCachedDEDTokenUSDPrice = async () => {
		if (!Object.values(NETWORKS_DETAILS[`${network}`].supportedAssets).find((asset) => asset.symbol === EAssets.DED)) {
			return null;
		}
		const cachedData = dedTokenUSDPriceCache;

		const now = Date.now();

		// If we have valid cached data, return it
		if (cachedData && cachedData.timestamp && now - cachedData.timestamp < CACHE_DURATION) {
			return cachedData.price;
		}

		const nativeTokenUsdPrice = await fetchNativeTokenPriceInUsd();

		// Update cache
		setDEDTokenUSDPriceCache((prev) => ({
			...prev,
			price: nativeTokenUsdPrice || null,
			timestamp: now
		}));

		return nativeTokenUsdPrice || null;
	};

	return useMemo(() => {
		return {
			getCachedDEDTokenUSDPrice
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dedTokenUSDPriceCache]);
};
