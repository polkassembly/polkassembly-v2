// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ITreasuryStats } from '@/_shared/types';
import { formatUSDWithUnits } from './formatUSDWithUnits';

const getExactDot = (dotAmount: string | undefined): number => {
	if (!dotAmount) return 0;
	return Number(dotAmount) / 1e10;
};

const getExactTokenAmount = (amount: string | undefined, divisor: number = 1e6): number => {
	if (!amount) return 0;
	return Number(amount) / divisor;
};

const calculateUsdValues = (data: ITreasuryStats) => {
	const formatDotToUsd = (dotAmount: string | undefined): string => {
		if (!dotAmount) return '';
		const dot = getExactDot(dotAmount);
		const usdValue = dot * Number(data.nativeTokenUsdPrice);
		return formatUSDWithUnits(usdValue.toString());
	};

	const getExactDotToUsd = (dotAmount: string | undefined): string => {
		if (!dotAmount) return '';
		const dot = getExactDot(dotAmount);
		return (dot * Number(data.nativeTokenUsdPrice)).toString();
	};

	return {
		relayChainUsd: formatDotToUsd(data?.relayChain?.dot),
		assetHubUsd: formatDotToUsd(data?.assetHub?.dot),
		hydrationUsd: formatDotToUsd(data?.hydration?.dot),
		bountiesUsd: formatDotToUsd(data?.bounties?.dot),
		ambassadorUsd: formatDotToUsd(data?.ambassador?.dot),
		fellowshipUsd: formatDotToUsd(data?.fellowship?.dot),
		loansUsd: formatDotToUsd(data?.loans?.dot),

		exactRelayChainUsd: getExactDotToUsd(data?.relayChain?.dot),
		exactAssetHubUsd: getExactDotToUsd(data?.assetHub?.dot),
		exactHydrationUsd: getExactDotToUsd(data?.hydration?.dot),
		exactBountiesUsd: getExactDotToUsd(data?.bounties?.dot),
		exactAmbassadorUsd: getExactDotToUsd(data?.ambassador?.dot),
		exactFellowshipUsd: getExactDotToUsd(data?.fellowship?.dot),
		exactLoansUsd: getExactDotToUsd(data?.loans?.dot)
	};
};

const calculateTokenAmounts = (data: ITreasuryStats) => {
	return {
		relayChainDot: data?.relayChain?.dot ? getExactDot(data.relayChain.dot) : '',
		assetHubDot: data?.assetHub?.dot ? getExactDot(data.assetHub.dot) : '',
		assetHubUsdc: data?.assetHub?.usdc ? getExactTokenAmount(data.assetHub.usdc) : '',
		assetHubUsdt: data?.assetHub?.usdt ? getExactTokenAmount(data.assetHub.usdt) : '',
		hydrationDot: data?.hydration?.dot ? getExactDot(data.hydration.dot) : '',
		hydrationUsdc: data?.hydration?.usdc ? getExactTokenAmount(data.hydration.usdc) : '',
		hydrationUsdt: data?.hydration?.usdt ? getExactTokenAmount(data.hydration.usdt) : '',
		bountiesDot: data?.bounties?.dot ? getExactDot(data.bounties.dot) : '',
		ambassadorValue: data?.ambassador?.dot ? getExactDot(data.ambassador.dot) : data?.ambassador?.usdt ? getExactTokenAmount(data.ambassador.usdt) : '',
		fellowshipDot: data?.fellowship?.dot ? getExactDot(data.fellowship.dot) : '',
		fellowshipUsdt: data?.fellowship?.usdt ? getExactTokenAmount(data.fellowship.usdt) : ''
	};
};

export const formatTreasuryValues = (data: ITreasuryStats) => {
	if (!data) return {};

	return {
		...calculateUsdValues(data),
		...calculateTokenAmounts(data)
	};
};
