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

const networkToCoinGeckoId: Record<ENetwork, string> = {
	[ENetwork.POLKADOT]: 'polkadot',
	[ENetwork.KUSAMA]: 'kusama',
	[ENetwork.ASSETHUB_KUSAMA]: 'kusama',
	[ENetwork.WESTEND]: 'westend',
	[ENetwork.PASEO]: 'paseo',
	[ENetwork.CERE]: 'cere-network'
};

export async function fetchHistoricalTreasuryStats({ network, date }: { network: ENetwork; date: Date }): Promise<ITreasuryStats | null> {
	try {
		const formattedDate = dayjs(date).format('DD-MM-YYYY');
		const coinId = networkToCoinGeckoId[network as ENetwork];

		if (!coinId) {
			return null;
		}

		const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${formattedDate}`);

		if (!response.ok) {
			console.error(`CoinGecko API error: ${response.statusText}`);
			return null;
		}

		const data = (await response.json()) as CoinGeckoHistoryResponse;
		const nativeTokenUsdPrice = data?.market_data?.current_price?.usd?.toString();

		if (!nativeTokenUsdPrice) {
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
			dedTokenUsdPrice
		} as ITreasuryStats;
	} catch (error) {
		console.error('Error fetching historical treasury stats:', error);
		return null;
	}
}
