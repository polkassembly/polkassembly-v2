// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ITreasuryStats } from '@/_shared/types';
import { formatUSDWithUnits } from './formatUSDWithUnits';

const getExactDot = (dotAmount: string): number => {
	return Number(dotAmount) / 1e10 || 0;
};

const getExactTokenAmount = (amount: string, divisor: number = 1e6): number => {
	return Number(amount) / divisor || 0;
};

const calculateUsdValues = (data: ITreasuryStats) => {
	const formatDotToUsd = (dotAmount: string): string => {
		const dot = getExactDot(dotAmount);
		const usdValue = dot * Number(data.nativeTokenUsdPrice);
		return formatUSDWithUnits(usdValue.toString());
	};

	const getExactDotToUsd = (dotAmount: string): string => {
		const dot = getExactDot(dotAmount);
		return (dot * Number(data.nativeTokenUsdPrice)).toString();
	};

	return {
		relayChainUsd: formatDotToUsd(data?.relayChain?.dot || '0'),
		assetHubUsd: formatDotToUsd(data?.assetHub?.dot || '0'),
		hydrationUsd: formatDotToUsd(data?.hydration?.dot || '0'),
		bountiesUsd: formatDotToUsd(data?.bounties?.dot || '0'),
		ambassadorUsd: formatDotToUsd(data?.ambassador?.dot || '0'),
		fellowshipUsd: formatDotToUsd(data?.fellowship?.dot || '0'),
		loansUsd: formatDotToUsd(data?.loans?.dot || '0'),

		exactRelayChainUsd: getExactDotToUsd(data?.relayChain?.dot || '0'),
		exactAssetHubUsd: getExactDotToUsd(data?.assetHub?.dot || '0'),
		exactHydrationUsd: getExactDotToUsd(data?.hydration?.dot || '0'),
		exactBountiesUsd: getExactDotToUsd(data?.bounties?.dot || '0'),
		exactAmbassadorUsd: getExactDotToUsd(data?.ambassador?.dot || '0'),
		exactFellowshipUsd: getExactDotToUsd(data?.fellowship?.dot || '0'),
		exactLoansUsd: getExactDotToUsd(data?.loans?.dot || '0')
	};
};

const calculateTokenAmounts = (data: ITreasuryStats) => {
	return {
		relayChainDot: getExactDot(data?.relayChain?.dot || '0'),
		assetHubDot: getExactDot(data?.assetHub?.dot || '0'),
		assetHubUsdc: getExactTokenAmount(data?.assetHub?.usdc || '0'),
		assetHubUsdt: getExactTokenAmount(data?.assetHub?.usdt || '0'),
		hydrationDot: getExactDot(data?.hydration?.dot || '0'),
		hydrationUsdc: getExactTokenAmount(data?.hydration?.usdc || '0'),
		hydrationUsdt: getExactTokenAmount(data?.hydration?.usdt || '0'),
		bountiesDot: getExactDot(data?.bounties?.dot || '0'),
		ambassadorValue: data?.ambassador?.dot ? getExactDot(data.ambassador.dot) : getExactTokenAmount(data?.ambassador?.usdt || '0'),
		fellowshipDot: getExactDot(data?.fellowship?.dot || '0'),
		fellowshipUsdt: getExactTokenAmount(data?.fellowship?.usdt || '0')
	};
};

export const formatTreasuryValues = (data: ITreasuryStats) => {
	return {
		...calculateUsdValues(data),
		...calculateTokenAmounts(data)
	};
};
