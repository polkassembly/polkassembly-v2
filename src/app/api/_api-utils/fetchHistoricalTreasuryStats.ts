// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets, ENetwork, ITreasuryStats } from '@/_shared/types';
import { treasuryAssetsData } from '@/_shared/_constants/networks';
import { dayjs } from '@/_shared/_utils/dayjsInit';

interface CoinGeckoHistoryResponse {
	market_data?: {
		current_price?: {
			usd?: number;
		};
	};
}

const networkToCoinGeckoId: Record<string, string> = {
	[ENetwork.POLKADOT]: 'polkadot',
	[ENetwork.KUSAMA]: 'kusama',
	[ENetwork.ASSETHUB_KUSAMA]: 'kusama',
	[ENetwork.WESTEND]: 'westend',
	[ENetwork.PASEO]: 'paseo',
	[ENetwork.CERE]: 'cere-network'
};

const networkToCryptoCompareSymbol: Record<string, string> = {
	[ENetwork.POLKADOT]: 'DOT',
	[ENetwork.KUSAMA]: 'KSM',
	[ENetwork.ASSETHUB_KUSAMA]: 'KSM',
	[ENetwork.WESTEND]: 'WND',
	[ENetwork.PASEO]: 'PAS',
	[ENetwork.CERE]: 'CERE'
};

async function fetchCryptoComparePrice(network: ENetwork, date: Date): Promise<string | undefined> {
	try {
		const symbol = networkToCryptoCompareSymbol[network];
		if (!symbol) return undefined;

		const timestamp = dayjs(date).unix();
		const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=1&toTs=${timestamp}`;
		const response = await fetch(url);

		if (!response.ok) return undefined;

		const data = await response.json();
		if (data?.Data?.Data?.length > 0) {
			const candle = data.Data.Data[data.Data.Data.length - 1];
			return candle.close?.toString();
		}
	} catch (error) {
		console.error('CryptoCompare API error:', error);
	}
	return undefined;
}

export async function fetchHistoricalTreasuryStats({ network, date }: { network: ENetwork; date: Date }): Promise<ITreasuryStats | null> {
	try {
		const isOldDate = dayjs().diff(dayjs(date), 'day') > 364;

		if (isOldDate) {
			const price = await fetchCryptoComparePrice(network, date);
			if (price) {
				return {
					network,
					createdAt: date,
					updatedAt: new Date(),
					relayChain: {},
					total: {},
					nativeTokenUsdPrice: price
				} as ITreasuryStats;
			}
			console.warn(`Historical data > 365 days not found for ${network} on ${date}`);
			return null;
		}

		const formattedDate = dayjs(date).format('DD-MM-YYYY');
		const coinId = networkToCoinGeckoId[network];

		if (!coinId) {
			return null;
		}

		const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${formattedDate}`);

		if (!response.ok) {
			if (response.status === 401) {
				console.warn(`CoinGecko API 401: Likely historical data limit exceeded (>365 days) for ${formattedDate} or invalid key. Trying fallback.`);
			} else {
				console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
			}
			// Fallback to CryptoCompare on any CoinGecko failure
			const price = await fetchCryptoComparePrice(network, date);
			if (price) {
				return {
					network,
					createdAt: date,
					updatedAt: new Date(),
					relayChain: {},
					total: {},
					nativeTokenUsdPrice: price
				} as ITreasuryStats;
			}
			return null;
		}

		const data = (await response.json()) as CoinGeckoHistoryResponse;
		const nativeTokenUsdPrice = data?.market_data?.current_price?.usd?.toString();

		if (!nativeTokenUsdPrice) {
			// Try fallback if CoinGecko returns no price
			const price = await fetchCryptoComparePrice(network, date);
			if (price) {
				return {
					network,
					createdAt: date,
					updatedAt: new Date(),
					relayChain: {},
					total: {},
					nativeTokenUsdPrice: price
				} as ITreasuryStats;
			}
			return null;
		}

		let dedTokenUsdPrice: string | undefined;
		if (network === ENetwork.POLKADOT && treasuryAssetsData[EAssets.DED]) {
			const dedId = treasuryAssetsData[EAssets.DED].name;
			try {
				const dedResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${dedId}/history?date=${formattedDate}`);
				if (dedResponse.ok) {
					const dedData = (await dedResponse.json()) as CoinGeckoHistoryResponse;
					dedTokenUsdPrice = dedData?.market_data?.current_price?.usd?.toString();
				}
			} catch (e) {
				console.error('Error fetching DED price:', e);
			}
		}

		return {
			network,
			createdAt: date,
			updatedAt: new Date(),
			relayChain: {},
			total: {},
			nativeTokenUsdPrice,
			...(dedTokenUsdPrice && { dedTokenUsdPrice })
		} as ITreasuryStats;
	} catch (error) {
		console.error('Error fetching historical treasury stats:', error);
		return null;
	}
}
