// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import BN from 'bn.js';

interface Options {
	numberAfterComma?: number;
	withUnit?: boolean;
	withThousandDelimitor?: boolean;
}

export const formatBnBalance = (value: BN | string, options: Options, network: string): string => {
	const tokenDecimals = NETWORKS_DETAILS[network as keyof typeof NETWORKS_DETAILS]?.tokenDecimals;
	const valueString = String(value);

	let suffix = '';
	let prefix = '';

	if (valueString.length > tokenDecimals) {
		suffix = valueString.slice(-tokenDecimals);
		prefix = valueString.slice(0, valueString.length - tokenDecimals);
	} else {
		prefix = '0';
		suffix = valueString.padStart(tokenDecimals - 1, '0');
	}

	let comma = '.';
	const { numberAfterComma, withThousandDelimitor = true, withUnit } = options;
	const numberAfterCommaLtZero = numberAfterComma && numberAfterComma < 0;

	if (numberAfterCommaLtZero || numberAfterComma === 0) {
		comma = '';
		suffix = '';
	} else if (numberAfterComma && numberAfterComma > 0) {
		suffix = suffix.slice(0, numberAfterComma);
	}

	if (withThousandDelimitor) {
		prefix = prefix.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	const unit = withUnit ? ` ${NETWORKS_DETAILS[network as keyof typeof NETWORKS_DETAILS]?.tokenSymbol}` : '';

	return `${prefix}${comma}${suffix}${unit}`;
};
