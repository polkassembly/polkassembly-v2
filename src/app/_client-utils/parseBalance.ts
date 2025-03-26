// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { formatBalance } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { formatUSDWithUnits } from './formatUSDWithUnits';

export const parseBalance = (balance: string, decimals: number, withUnit: boolean, network: ENetwork) => {
	let readableBalance = formatUSDWithUnits(
		parseFloat(
			formatBalance(balance, {
				decimals: NETWORKS_DETAILS[network]?.tokenDecimals,
				forceUnit: NETWORKS_DETAILS[network]?.tokenSymbol,
				withAll: false,
				withUnit: false,
				withZero: false
			}).replaceAll(',', '')
		)
			.toFixed(2)
			.toString(),
		decimals
	);
	if (withUnit) {
		readableBalance = `${readableBalance} ${NETWORKS_DETAILS[network as ENetwork]?.tokenSymbol}`;
	}
	return readableBalance;
};
