// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { EPeriodType, EPostOrigin } from '@shared/types';
import { getTrackPeriodsTimeInMinutes } from './getTrackPeriodsTimeInMinutes';

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
	const { decisionMinutes, prepareMinutes, confirmMinutes } = getTrackPeriodsTimeInMinutes(trackName);

	let totalMinutes = 0;
	switch (periodType) {
		case EPeriodType.PREPARE:
			totalMinutes = prepareMinutes || 0;
			break;
		case EPeriodType.CONFIRM:
			totalMinutes = confirmMinutes || 0;
			break;
		case EPeriodType.DECISION:
		default:
			totalMinutes = decisionMinutes || 0;
			break;
	}

	if (!endAt) {
		return getLabel(0, totalMinutes);
	}

	const endDate = dayjs(endAt);
	const startDate = endDate.subtract(totalMinutes, 'minutes');
	const now = dayjs();

	const diffMinutes = now.diff(startDate, 'minutes');

	const passed = Math.max(0, Math.min(totalMinutes, diffMinutes));

	return getLabel(passed, totalMinutes);
};
