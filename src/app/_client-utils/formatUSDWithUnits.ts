// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';

export const formatUSDWithUnits = (usd: string, numberAfterDot?: number) => {
	const toFixed = numberAfterDot && ValidatorService.isValidNumber(numberAfterDot) ? numberAfterDot : 2;
	let newUsd = usd;
	let suffix = '';
	if (typeof usd === 'string') {
		const [value, unit] = usd.split(' ');
		if (unit) {
			newUsd = value.replace(/,/g, '');
			suffix = ` ${unit}`;
		}
	}
	// Nine Zeroes for Billions
	const formattedUSD =
		Math.abs(Number(newUsd)) >= 1.0e9
			? `${(Math.abs(Number(newUsd)) / 1.0e9).toFixed(toFixed)}B`
			: // Six Zeroes for Millions
				Math.abs(Number(newUsd)) >= 1.0e6
				? `${(Math.abs(Number(newUsd)) / 1.0e6).toFixed(toFixed)}M`
				: // Three Zeroes for Thousands
					Math.abs(Number(newUsd)) >= 1.0e3
					? `${(Math.abs(Number(newUsd)) / 1.0e3).toFixed(toFixed)}K`
					: Math.abs(Number(newUsd)).toLocaleString('en-US', {
							minimumFractionDigits: toFixed,
							maximumFractionDigits: toFixed
						});

	return `${formattedUSD}${suffix}`;
};
