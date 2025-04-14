// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { EPeriodType, EPostOrigin } from '@shared/types';
import { getTrackDays } from '@/app/_client-utils/getTrackDays';
import { useTranslations } from 'next-intl';

interface PeriodProgressLabelProps {
	endAt?: Date;
	trackName: EPostOrigin;
	periodType: EPeriodType;
}

function PeriodProgressLabel({ endAt, trackName, periodType }: PeriodProgressLabelProps) {
	const t = useTranslations('timeUnits');
	const { decisionDays, prepareDays, confirmDays, enactmentDays } = getTrackDays(trackName);

	const periodDaysMapping = {
		[EPeriodType.PREPARE]: prepareDays,
		[EPeriodType.CONFIRM]: confirmDays,
		[EPeriodType.DECISION]: decisionDays,
		[EPeriodType.ENACTMENT]: enactmentDays
	};

	const totalDays = periodDaysMapping[periodType] || 0;
	const totalMinutes = totalDays * 24 * 60;

	const getLabel = (passed: number, totalMinutes: number) => {
		if (totalMinutes < 60) {
			return `${Math.round(passed)} / ${Math.round(totalMinutes)} ${t('minutes')}`;
		}
		if (totalMinutes < 1440) {
			return `${Math.round(passed / 60)} / ${Math.round(totalMinutes / 60)} ${t('hours')}`;
		}
		return `${Math.round(passed / 1440)} / ${Math.round(totalMinutes / 1440)} ${t('days')}`;
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
