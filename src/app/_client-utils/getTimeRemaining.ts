// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@/_shared/_utils/dayjsInit';

export const getTimeRemaining = (endDate: Date | string) => {
	const now = dayjs();
	const end = dayjs(endDate);
	const diff = end.diff(now);
	if (diff <= 0) return null;

	const duration = dayjs.duration(diff);
	return {
		days: Math.floor(duration.asDays()),
		hours: duration.hours(),
		minutes: duration.minutes(),
		seconds: duration.seconds()
	};
};
