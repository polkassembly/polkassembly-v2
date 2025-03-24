// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { BN, BN_ONE, BN_TEN, BN_TWO, BN_ZERO } from '@polkadot/util';

const BITLENGTH = 128;

function getGlobalMaxValue(): BN {
	return BN_TWO.pow(new BN(BITLENGTH)).isub(BN_ONE);
}

function isValidNumber(bn: BN, isZeroable?: boolean): boolean {
	const bnEqZero = !isZeroable && bn.eq(BN_ZERO);
	return !(
		bn.lt(BN_ZERO) ||
		// cannot be > than allowed max
		bn.gt(getGlobalMaxValue()) ||
		// check if 0 and it should be a value
		bnEqZero ||
		// check that the bitlengths fit
		bn.bitLength() > BITLENGTH
	);
}

export function inputToBn(input: string, network: ENetwork, isZeroable?: boolean, assetId?: string | null): { bnValue: BN; isValid: boolean } {
	const networkDetails = NETWORKS_DETAILS[`${network}`];
	const tokenDecimal = assetId ? networkDetails.supportedAssets[`${assetId}`].tokenDecimal || networkDetails.tokenDecimals : networkDetails.tokenDecimals;
	const tokenDecimalBN = new BN(tokenDecimal);

	const isDecimalValue = input.match(/^(\d+)\.(\d+)$/);

	let result;

	if (isDecimalValue) {
		// return -1 if the amount of decimal is higher than supported
		if (isDecimalValue[2].length > tokenDecimal) {
			result = new BN(-1);
			return { bnValue: result, isValid: isValidNumber(result, isZeroable) };
		}

		// get what is before the point and replace what isn't a number
		const div = new BN(isDecimalValue[1]);
		// get what is after the point  and replace what isn't a number
		const modString = isDecimalValue[2];
		// make it BN
		const mod = new BN(modString);

		result = div.mul(BN_TEN.pow(tokenDecimalBN)).add(mod.mul(BN_TEN.pow(new BN(tokenDecimal - modString.length))));
	} else {
		result = new BN(input.replace(/[^\d]/g, '')).mul(BN_TEN.pow(tokenDecimalBN));
	}

	return { bnValue: result, isValid: isValidNumber(result, isZeroable) };
}
