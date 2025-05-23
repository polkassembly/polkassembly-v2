// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/ja';
import 'dayjs/locale/zh';

dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);

export { dayjs };
