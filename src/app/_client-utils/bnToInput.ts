// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { BN } from '@polkadot/util';

export function bnToInput(bn: BN, network: ENetwork): string {
	const tokenDecimal = NETWORKS_DETAILS[`${network}`].tokenDecimals;

	if (bn.isZero()) {
		return '0';
	}

	// Convert to string and pad with zeros if needed
	const numberString = bn.toString();
	const paddedString = numberString.padStart(tokenDecimal + 1, '0');

	// Split into whole and decimal parts
	const wholePartString = paddedString.slice(0, -tokenDecimal) || '0';
	const decimalPartString = paddedString.slice(-tokenDecimal);

	// Trim trailing zeros in decimal part
	const trimmedDecimalPart = decimalPartString.replace(/0+$/, '');

	// Combine whole and decimal parts
	return trimmedDecimalPart ? `${wholePartString}.${trimmedDecimalPart}` : wholePartString;
}
