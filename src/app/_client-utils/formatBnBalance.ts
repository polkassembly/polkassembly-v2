// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';

interface Options {
	numberAfterComma?: number;
	withUnit?: boolean;
	withThousandDelimitor?: boolean;
}

export function formatBnBalance(value: string, options: Options, network: ENetwork, assetId?: string | null): string {
	const tokenDecimals = assetId ? NETWORKS_DETAILS[`${network}`]?.supportedAssets[`${assetId}`]?.tokenDecimal : NETWORKS_DETAILS[`${network}`]?.tokenDecimals;
	const valueString = value.toString();

	let suffix = '';
	let prefix = '';

	if (valueString.length > tokenDecimals) {
		suffix = valueString.slice(-tokenDecimals);
		prefix = valueString.slice(0, valueString.length - tokenDecimals);
	} else {
		prefix = '0';
		suffix = valueString.padStart(tokenDecimals, '0');
	}

	let comma = '.';
	const { numberAfterComma, withThousandDelimitor = true, withUnit } = options;
	const numberAfterCommaLtZero = numberAfterComma && numberAfterComma < 0;

	if (numberAfterCommaLtZero || numberAfterComma === 0 || suffix === '') {
		comma = '';
		suffix = '';
	} else if (numberAfterComma && numberAfterComma > 0) {
		suffix = suffix.slice(0, numberAfterComma);
	}

	if (withThousandDelimitor) {
		prefix = prefix.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	const unit = withUnit ? (assetId ? NETWORKS_DETAILS[`${network}`]?.supportedAssets[`${assetId}`]?.symbol : NETWORKS_DETAILS[`${network}`]?.tokenSymbol) : '';

	return `${prefix}${comma}${suffix} ${unit}`;
}
