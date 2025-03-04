// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '@/_shared/types';
import { formatBnBalance } from './formatBnBalance';

export const formatNumberWithSuffix = (value: number): string => {
	const cleanedValue = Number(value.toString().replace(/,/g, ''));
	if (cleanedValue >= 1e6) {
		return `${(cleanedValue / 1e6).toFixed(1)}m`;
	}
	if (cleanedValue >= 1e3) {
		return `${(cleanedValue / 1e3).toFixed(1)}k`;
	}
	return cleanedValue.toFixed(1);
};

export const getFormattedValue = (value: string, network: string, currentTokenPrice: string): string => {
	const numericValue = Number(formatBnBalance(value, { numberAfterComma: 1, withThousandDelimitor: false }, network as ENetwork));

	if (isNaN(Number(currentTokenPrice))) {
		return formatNumberWithSuffix(numericValue);
	}

	const tokenPrice = Number(currentTokenPrice);
	const dividedValue = numericValue * tokenPrice;

	return formatNumberWithSuffix(dividedValue);
};

export const formatTokenValue = (value: string, network: string, tokenPrice: string, unit?: string): string => {
	if (isNaN(Number(tokenPrice))) {
		return `${getFormattedValue(value, network, tokenPrice)} ${unit ?? ''}`;
	}
	return `$${getFormattedValue(value, network, tokenPrice)}`;
};
