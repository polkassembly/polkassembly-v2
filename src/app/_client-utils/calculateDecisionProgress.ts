// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@/_shared/_utils/dayjsInit';

export const calculateDecisionProgress = (decisionPeriodEndsAt: Date | string | null, durationInDays: number = 28) => {
	if (!decisionPeriodEndsAt) return 0;
	const now = dayjs();
	const endDate = dayjs(decisionPeriodEndsAt);
	const startDate = endDate.subtract(durationInDays, 'days');
	if (now.isAfter(endDate)) return 100;
	if (now.isBefore(startDate)) return 0;
	return (now.diff(startDate, 'minutes') / (durationInDays * 24 * 60)) * 100;
};
