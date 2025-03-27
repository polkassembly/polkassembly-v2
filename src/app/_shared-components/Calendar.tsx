// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import 'react-day-picker/style.css';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ ...props }: CalendarProps) {
	return <DayPicker {...props} />;
}
Calendar.displayName = 'Calendar';

export { Calendar };
