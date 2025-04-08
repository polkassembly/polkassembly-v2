// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from '@polkadot/util';
import { ITreasuryStats } from '@/_shared/types';
import { formatUSDWithUnits } from './formatUSDWithUnits';

const getExactDot = (dotAmount: string): number | null => {
	if (!dotAmount) return null;
	try {
		const bn = new BN(dotAmount);
		const divisor = new BN(10).pow(new BN(10));
		return bn.div(divisor).toNumber() + bn.mod(divisor).toNumber() / divisor.toNumber();
	} catch (error) {
		console.error('Error converting DOT amount:', error);
		return null;
	}
};

const getExactTokenAmount = (amount: string, divisor: number = 1e6): number | null => {
	if (!amount) return null;
	try {
		const bn = new BN(amount);
		const divisorBN = new BN(divisor);
		return bn.div(divisorBN).toNumber() + bn.mod(divisorBN).toNumber() / divisor;
	} catch (error) {
		console.error('Error converting token amount:', error);
		return null;
	}
};

const calculateUsdValues = (data: ITreasuryStats) => {
	const formatDotToUsd = (dotAmount: string): string => {
		if (!dotAmount || !data.nativeTokenUsdPrice) return '';
		const dot = getExactDot(dotAmount);
		if (dot === null) return '';
		const usdValue = dot * Number(data.nativeTokenUsdPrice);
		return formatUSDWithUnits(usdValue.toString());
	};

	const getExactDotToUsd = (dotAmount: string): string => {
		if (!dotAmount || !data.nativeTokenUsdPrice) return '';
		const dot = getExactDot(dotAmount);
		if (dot === null) return '';
		return (dot * Number(data.nativeTokenUsdPrice)).toString();
	};

	return {
		relayChainUsd: formatDotToUsd(data?.relayChain?.dot || ''),
		assetHubUsd: formatDotToUsd(data?.assetHub?.dot || ''),
		hydrationUsd: formatDotToUsd(data?.hydration?.dot || ''),
		bountiesUsd: formatDotToUsd(data?.bounties?.dot || ''),
		ambassadorUsd: formatDotToUsd(data?.ambassador?.dot || ''),
		fellowshipUsd: formatDotToUsd(data?.fellowship?.dot || ''),
		loansUsd: formatDotToUsd(data?.loans?.dot || ''),

		exactRelayChainUsd: getExactDotToUsd(data?.relayChain?.dot || ''),
		exactAssetHubUsd: getExactDotToUsd(data?.assetHub?.dot || ''),
		exactHydrationUsd: getExactDotToUsd(data?.hydration?.dot || ''),
		exactBountiesUsd: getExactDotToUsd(data?.bounties?.dot || ''),
		exactAmbassadorUsd: getExactDotToUsd(data?.ambassador?.dot || ''),
		exactFellowshipUsd: getExactDotToUsd(data?.fellowship?.dot || ''),
		exactLoansUsd: getExactDotToUsd(data?.loans?.dot || '')
	};
};

const calculateTokenAmounts = (data: ITreasuryStats) => {
	return {
		relayChainDot: getExactDot(data?.relayChain?.dot || ''),
		assetHubDot: getExactDot(data?.assetHub?.dot || ''),
		assetHubUsdc: getExactTokenAmount(data?.assetHub?.usdc || ''),
		assetHubUsdt: getExactTokenAmount(data?.assetHub?.usdt || ''),
		hydrationDot: getExactDot(data?.hydration?.dot || ''),
		hydrationUsdc: getExactTokenAmount(data?.hydration?.usdc || ''),
		hydrationUsdt: getExactTokenAmount(data?.hydration?.usdt || ''),
		bountiesDot: getExactDot(data?.bounties?.dot || ''),
		ambassadorValue: data?.ambassador?.dot ? getExactDot(data.ambassador.dot) : getExactTokenAmount(data?.ambassador?.usdt || ''),
		fellowshipDot: getExactDot(data?.fellowship?.dot || ''),
		fellowshipUsdt: getExactTokenAmount(data?.fellowship?.usdt || '')
	};
};

export const formatTreasuryValues = (data: ITreasuryStats) => {
	return {
		...calculateUsdValues(data),
		...calculateTokenAmounts(data)
	};
};
