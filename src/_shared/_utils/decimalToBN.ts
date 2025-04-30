// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { BN } from '@polkadot/util';

export function decimalToBN(priceStr: string | number): {
	value: BN;
	decimals: number;
} {
	const CONVERSION_DECIMALS = 18; // Using 18 decimals for price precision

	if (!priceStr) return { value: new BN(0), decimals: CONVERSION_DECIMALS };

	// Convert to string and remove any commas
	const cleanPrice = priceStr.toString().replace(/,/g, '');
	// Split on decimal point
	const [whole, decimal = ''] = cleanPrice.split('.');
	// Combine whole and decimal, padding decimal with zeros
	const paddedDecimal = decimal.padEnd(CONVERSION_DECIMALS, '0');
	// Remove any leading zeros from whole number and combine with padded decimal
	const combinedStr = whole.replace(/^0+/, '') + paddedDecimal;
	// Convert to BN directly without division
	return {
		value: new BN(combinedStr),
		decimals: CONVERSION_DECIMALS
	};
}
