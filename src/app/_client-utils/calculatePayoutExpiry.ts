// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { BN } from '@polkadot/util';
import { ENetwork, TimeUnitOptions } from '@/_shared/types';
import { BlockCalculationsService } from '../_client-services/block_calculations_service';

// Utility functions
export const formatDate = (timestamp: Date | string): string => {
	return dayjs(timestamp).format('MMM DD, YYYY');
};

export const buildTimeUnit = (value: number, unit: string, options: TimeUnitOptions = {}): string | null => {
	const { withUnitSpace = true, withPluralSuffix = true } = options;
	const pluralSuffix = withPluralSuffix && value !== 1 ? 's' : '';
	return value ? `${value}${withUnitSpace ? ' ' : ''}${unit}${pluralSuffix}` : null;
};

export const getTimeRemaining = (endDate: Date | string, withUnitSpace = true): string | null => {
	const now = dayjs();
	const end = dayjs(endDate);
	const diff = end.diff(now);

	if (diff <= 0) return null;

	const duration = dayjs.duration(diff);
	const timeUnits = [
		buildTimeUnit(Math.floor(duration.years()), 'yr', { withUnitSpace }),
		buildTimeUnit(Math.floor(duration.months()), 'mo', { withUnitSpace }),
		buildTimeUnit(Math.floor(duration.days()), 'd', { withUnitSpace, withPluralSuffix: false }),
		buildTimeUnit(duration.hours(), 'hr', { withUnitSpace }),
		buildTimeUnit(duration.minutes(), 'min', { withUnitSpace })
	];

	return timeUnits.filter(Boolean).slice(0, 2).join(' ');
};

export const calculatePayoutExpiry = (currentBlockHeight: number, validFromBlockHeight: number | null, network: ENetwork): string | null => {
	if (!currentBlockHeight || !validFromBlockHeight || !network) {
		return null;
	}

	const date = BlockCalculationsService.getDateFromBlockNumber({
		currentBlockNumber: new BN(currentBlockHeight),
		targetBlockNumber: new BN(validFromBlockHeight),
		network
	});

	if (dayjs().isAfter(date)) {
		return formatDate(date);
	}

	return getTimeRemaining(date, false);
};
