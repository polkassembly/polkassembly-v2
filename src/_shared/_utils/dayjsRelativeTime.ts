// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import { dayjs } from './dayjsInit';

// Register required plugins
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Customize the relative time thresholds and formats
dayjs.updateLocale('en', {
	relativeTime: {
		future: '%s',
		past: '%s ago',
		s: 'a few seconds',
		m: 'a minute',
		mm: '%d minutes',
		h: 'an hour',
		hh: '%d hours',
		d: 'a day',
		dd: '%d days',
		// Override the larger units to use days instead
		M: '%d days',
		MM(number: number) {
			return `${number * 30} days`;
		},
		y(number: number) {
			return `${number * 365} days`;
		},
		yy(number: number) {
			return `${number * 365} days`;
		}
	}
});

export { dayjs };
