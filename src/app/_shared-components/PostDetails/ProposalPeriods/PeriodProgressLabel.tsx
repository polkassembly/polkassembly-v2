// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { EPeriodType, EPostOrigin } from '@shared/types';
import { getTrackPeriodDays } from '@/app/_client-utils/getTrackDays';
import { useTranslations } from 'next-intl';
import { MINUTES_IN_DAY, MINUTES_IN_HOUR } from '@/_shared/_constants/timeConstants';

interface PeriodProgressLabelProps {
	endAt?: Date;
	trackName: EPostOrigin;
	periodType: EPeriodType;
}

function PeriodProgressLabel({ endAt, trackName, periodType }: PeriodProgressLabelProps) {
	const t = useTranslations('timeUnits');
	const { decisionDays, prepareDays, confirmDays, enactmentDays } = getTrackPeriodDays(trackName);

	const periodDaysMapping = {
		[EPeriodType.PREPARE]: prepareDays,
		[EPeriodType.CONFIRM]: confirmDays,
		[EPeriodType.DECISION]: decisionDays,
		[EPeriodType.ENACTMENT]: enactmentDays
	};

	const totalDays = periodDaysMapping[periodType] || 0;
	const totalMinutes = totalDays * 24 * 60;

	const getLabel = (passed: number, totalMinutes: number) => {
		if (totalMinutes < MINUTES_IN_HOUR) {
			return `${Math.round(passed)} / ${Math.round(totalMinutes)} ${t('minutes')}`;
		}
		if (totalMinutes < MINUTES_IN_DAY) {
			return `${Math.round(passed / MINUTES_IN_HOUR)} / ${Math.round(totalMinutes / MINUTES_IN_HOUR)} ${t('hours')}`;
		}
		return `${Math.round(passed / MINUTES_IN_DAY)} / ${Math.round(totalMinutes / MINUTES_IN_DAY)} ${t('days')}`;
	};

	if (!endAt) {
		return <span>{getLabel(0, totalMinutes)}</span>;
	}

	const endDate = dayjs(endAt);
	const startDate = endDate.subtract(totalDays, 'days');
	const now = dayjs();

	const diffMinutes = now.diff(startDate, 'minutes');
	const passed = Math.max(0, Math.min(totalMinutes, diffMinutes));

	return <span>{getLabel(passed, totalMinutes)}</span>;
}

export default PeriodProgressLabel;
