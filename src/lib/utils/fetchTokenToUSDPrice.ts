import { coinGeckoNetworks } from '@/_shared/_constants/coinGeckoNetworksList';
import formatUSDWithUnits from './formatUSDWithUnits';

export default async function fetchTokenToUSDPrice(networkOrAsset: string) {
	try {
		const coinId = coinGeckoNetworks[networkOrAsset] || networkOrAsset;
		const response = await fetch('https://api.coingecko.com/api/v3/simple/price?' + new URLSearchParams({ ids: coinId, include_24hr_change: 'true', vs_currencies: 'usd' }));
		const responseJSON = await response.json();

		if (!responseJSON[coinId] || !responseJSON[coinId]['usd']) {
			return 'N/A';
		}

		return formatUSDWithUnits(String(responseJSON[coinId]['usd']));
	} catch (error) {
		return 'N/A';
	}
}
