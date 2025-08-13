// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import { decimalToBN } from '@/_shared/_utils/decimalToBN';
import { EAssets, ENetwork } from '@/_shared/types';
import { BN, BN_ZERO } from '@polkadot/util';

export const convertAssetToUSD = ({
	amount,
	asset,
	currentTokenPrice,
	dedTokenUSDPrice,
	network
}: {
	amount: string;
	asset: Exclude<EAssets, EAssets.MYTH> | null;
	currentTokenPrice?: string;
	dedTokenUSDPrice?: string;
	network: ENetwork;
}): BN => {
	if (!asset) {
		const nativeTokenPriceBN = currentTokenPrice ? decimalToBN(currentTokenPrice) : null;
		if (!nativeTokenPriceBN) return BN_ZERO;
		return nativeTokenPriceBN.value
			.mul(new BN(amount))
			.div(new BN(10).pow(new BN(NETWORKS_DETAILS[`${network}`].tokenDecimals)))
			.div(new BN(10).pow(new BN(nativeTokenPriceBN.decimals)));
	}

	if (asset === EAssets.DED) {
		const dedTokenPriceBN = dedTokenUSDPrice ? decimalToBN(dedTokenUSDPrice) : null;
		if (!dedTokenPriceBN) return BN_ZERO;
		return dedTokenPriceBN.value
			.mul(new BN(amount))
			.div(new BN(10).pow(new BN(treasuryAssetsData[asset as EAssets]?.tokenDecimal)))
			.div(new BN(10).pow(new BN(dedTokenPriceBN.decimals)));
	}

	return new BN(amount).div(new BN(10).pow(new BN(treasuryAssetsData[asset as EAssets]?.tokenDecimal)));
};
