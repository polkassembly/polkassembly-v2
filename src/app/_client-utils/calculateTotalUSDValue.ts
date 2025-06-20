// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAssets, ENetwork } from '@/_shared/types';
import { BN_ZERO } from '@polkadot/util';
import { calculateAssetUSDValue } from './calculateAssetUSDValue';
import { formatUSDWithUnits } from './formatUSDWithUnits';

export const calculateTotalUSDValue = ({
	amountsDetails,
	currentTokenPrice,
	dedTokenUSDPrice,
	network
}: {
	amountsDetails: { amount: string | null; asset: Exclude<EAssets, EAssets.MYTH> | null }[];
	currentTokenPrice: string | null;
	dedTokenUSDPrice?: string | null;
	network: ENetwork;
}) => {
	let totalUSD = BN_ZERO;

	amountsDetails?.forEach(({ amount, asset }) => {
		if (amount) {
			const assetUSDValue = calculateAssetUSDValue({
				amount,
				asset,
				currentTokenPrice,
				dedTokenUSDPrice: dedTokenUSDPrice || null,
				network
			});
			totalUSD = totalUSD.add(assetUSDValue);
		}
	});

	return formatUSDWithUnits(totalUSD.toString(), 2);
};
