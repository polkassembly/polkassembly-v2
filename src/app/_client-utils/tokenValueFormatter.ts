// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '@/_shared/types';
import { formatBnBalance } from './formatBnBalance';

/**
 * Formats a token value for display, either as a token amount or as USD value
 *
 * @param tokenAmount - The token amount as a string
 * @param network - The blockchain network
 * @param tokenPrice - The token price in USD (if available)
 * @param unit - The token unit symbol (optional)
 * @returns A human-readable string with the formatted token value
 *
 * Examples:
 * - With token price: "$1.5K" (USD value)
 * - Without token price: "1.5K DOT" (token amount with unit)
 */
export const formatTokenValue = (tokenAmount: string, network: ENetwork, tokenPrice: number, unit?: string): string => {
	if (isNaN(tokenPrice)) {
		return formatBnBalance(
			tokenAmount,
			{
				compactNotation: true,
				numberAfterComma: 1,
				withUnit: !!unit,
				withThousandDelimitor: false
			},
			network
		);
	}

	const numericValue = Number(formatBnBalance(tokenAmount, { numberAfterComma: 1, withThousandDelimitor: false }, network));
	const usdValue = numericValue * tokenPrice;

	return `$${new Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: 1
	}).format(usdValue)}`;
};
