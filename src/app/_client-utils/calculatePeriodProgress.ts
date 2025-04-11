// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@/_shared/_utils/dayjsInit';
import { EPeriodType, EPostOrigin } from '@shared/types';
import { getTrackDays } from './getTrackDays';

export const calculatePeriodProgress = (endAt: Date | string | null, trackName: EPostOrigin, periodType: EPeriodType): number => {
	if (!endAt) return 0;

	const { decisionDays, prepareDays, confirmDays } = getTrackDays(trackName);

	let totalDays: number | undefined;
	switch (periodType) {
		case EPeriodType.PREPARE:
			totalDays = prepareDays;
			break;
		case EPeriodType.CONFIRM:
			totalDays = confirmDays;
			break;
		case EPeriodType.DECISION:
		default:
			totalDays = decisionDays;
	}

	if (!totalDays) return 0;

	const endDate = dayjs(endAt);
	const startDate = endDate.subtract(totalDays, 'days');
	const now = dayjs();

	if (now.isAfter(endDate)) return 100;
	if (now.isBefore(startDate)) return 0;

	const totalDurationMs = endDate.diff(startDate);
	const elapsedDurationMs = now.diff(startDate);

	return Math.min(100, Math.max(0, (elapsedDurationMs / totalDurationMs) * 100));
};
