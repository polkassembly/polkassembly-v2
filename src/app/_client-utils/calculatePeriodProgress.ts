// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { EPeriodType, EPostOrigin } from '@shared/types';
import { getTrackPeriodsTimeInMinutes } from './getTrackPeriodsTimeInMinutes';

export const calculatePeriodProgress = ({ endAt, trackName, periodType }: { endAt?: Date; trackName: EPostOrigin; periodType: EPeriodType }): number => {
	if (!endAt) return 0;

	const { decisionMinutes, prepareMinutes, confirmMinutes } = getTrackPeriodsTimeInMinutes(trackName);

	let totalMinutes: number | undefined;
	switch (periodType) {
		case EPeriodType.PREPARE:
			totalMinutes = prepareMinutes;
			break;
		case EPeriodType.CONFIRM:
			totalMinutes = confirmMinutes;
			break;
		case EPeriodType.DECISION:
		default:
			totalMinutes = decisionMinutes;
	}

	if (!totalMinutes) return 0;

	const endDate = dayjs(endAt);
	const startDate = endDate.subtract(totalMinutes, 'minutes');
	const now = dayjs();

	if (now.isAfter(endDate)) return 100;
	if (now.isBefore(startDate)) return 0;

	const totalDurationMs = endDate.diff(startDate);
	const elapsedDurationMs = now.diff(startDate);

	return Math.min(100, Math.max(0, (elapsedDurationMs / totalDurationMs) * 100));
};
