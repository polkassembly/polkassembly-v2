// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import 'react-day-picker/style.css';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, ...props }: CalendarProps) {
	return (
		<DayPicker
			classNames={{
				// months: 'flex flex-col space-y-4',
				// month: 'space-y-4',
				// caption: 'flex justify-center pt-1 relative items-center',
				// caption_label: 'text-sm font-medium',
				// nav: 'space-x-1 flex items-center justify-between',
				// nav_button: cn(buttonVariants.outline, 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'),
				// nav_button_previous: 'absolute left-1',
				// nav_button_next: 'absolute right-1',
				// table: 'w-full border-collapse space-y-1',
				// head_row: 'flex',
				// head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
				// row: 'flex w-full mt-2',
				// cell: cn(
				// 	'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-bg_pink [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
				// 	props.mode === 'range'
				// 		? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
				// 		: '[&:has([aria-selected])]:rounded-md'
				// ),
				// day: cn(buttonVariants.ghost, 'h-8 w-8 p-0 font-normal aria-selected:opacity-100'),
				// day_range_start: 'day-range-start',
				// day_range_end: 'day-range-end',
				// day_selected: 'bg-bg_pink text-btn_primary_text hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
				// day_today: 'bg-accent text-accent-foreground',
				// day_outside: 'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
				// day_disabled: 'text-placeholder opacity-50',
				// day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
				// day_hidden: 'invisible',
				...classNames
			}}
			{...props}
		/>
	);
}
Calendar.displayName = 'Calendar';

export { Calendar };
