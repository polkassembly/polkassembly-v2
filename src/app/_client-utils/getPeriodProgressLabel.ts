// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { EPeriodType, EPostOrigin } from '@shared/types';
import { getTrackDays } from './getTrackDays';

const getLabel = (passed: number, totalMinutes: number) => {
	if (totalMinutes < 60) {
		return `${Math.round(passed)} / ${Math.round(totalMinutes)} minutes`;
	}
	if (totalMinutes < 1440) {
		return `${Math.round(passed / 60)} / ${Math.round(totalMinutes / 60)} hours`;
	}
	return `${Math.round(passed / 1440)} / ${Math.round(totalMinutes / 1440)} days`;
};

export const getPeriodProgressLabel = ({ endAt, trackName, periodType }: { endAt?: Date; trackName: EPostOrigin; periodType: EPeriodType }): string => {
	const { decisionDays, prepareDays, confirmDays } = getTrackDays(trackName);

	let totalDays = 0;
	switch (periodType) {
		case EPeriodType.PREPARE:
			totalDays = prepareDays || 0;
			break;
		case EPeriodType.CONFIRM:
			totalDays = confirmDays || 0;
			break;
		case EPeriodType.DECISION:
		default:
			totalDays = decisionDays || 0;
			break;
	}
	const totalMinutes = totalDays * 24 * 60;

	if (!endAt) {
		return getLabel(0, totalMinutes);
	}

	const endDate = dayjs(endAt);
	const startDate = endDate.subtract(totalDays, 'days');
	const now = dayjs();

	const diffMinutes = now.diff(startDate, 'minutes');

	const passed = Math.max(0, Math.min(totalMinutes, diffMinutes));

	return getLabel(passed, totalMinutes);
};
