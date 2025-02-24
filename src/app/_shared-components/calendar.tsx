// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { cn } from '@/lib/utils';

function Calendar() {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
	const [view, setView] = useState<'month' | 'year'>('month');

	const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newDate = new Date(selectedDate || new Date());
		newDate.setMonth(parseInt(event.target.value, 10));
		setSelectedDate(newDate);
	};

	const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newDate = new Date(selectedDate || new Date());
		newDate.setFullYear(parseInt(event.target.value, 10));
		setSelectedDate(newDate);
	};

	return (
		<div className='relative w-[320px] rounded-lg border border-border_grey shadow-md'>
			<div className='flex w-full justify-end gap-2 px-2 py-4'>
				<select
					className='rounded-sm border border-border_grey px-1 py-0.5 text-sm focus:outline-none'
					onChange={handleYearChange}
					value={selectedDate?.getFullYear()}
				>
					{[...Array(126).keys()].map((i) => (
						<option
							key={1900 + i}
							value={1900 + i}
						>
							{1900 + i}
						</option>
					))}
				</select>
				{view === 'month' && (
					<select
						className='rounded-sm border border-border_grey px-1 py-0.5 text-sm focus:outline-none'
						onChange={handleMonthChange}
						value={selectedDate?.getMonth()}
					>
						{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
							<option
								key={index}
								value={index}
							>
								{month}
							</option>
						))}
					</select>
				)}
				<div>
					<button
						type='button'
						className={cn('text-text_btn_secondary_text rounded-l-sm border px-1 py-0.5 text-sm', view === 'month' ? 'border-text_pink' : 'border-border_grey')}
						onClick={() => setView('month')}
					>
						Month
					</button>
					<button
						type='button'
						className={cn('text-text_btn_secondary_text rounded-r-sm border px-3 py-0.5 text-sm', view === 'year' ? 'border-text_pink' : 'border-border_grey')}
						onClick={() => setView('year')}
					>
						Year
					</button>
				</div>
			</div>

			{view === 'month' ? (
				<div className='w-full'>
					<DayPicker
						mode='single'
						selected={selectedDate}
						onSelect={setSelectedDate}
						showOutsideDays
						fromYear={1900}
						toYear={2025}
						month={selectedDate}
						classNames={{
							caption_label: 'text-sm font-medium hidden', // Hide default caption
							nav: 'hidden', // Hide default navigation
							table: 'w-full border-collapse',
							head_row: 'flex gap-2 justify-between w-full',
							head_cell: 'text-text_primary text-sm font-medium p-1',
							row: 'flex gap-2',
							cell: cn(
								'relative w-8 h-8 flex items-center text-text_primary justify-center text-sm rounded-full cursor-pointer',
								'hover:bg-btn_secondary_background',
								'focus:outline-none  focus:ring-text_pink',
								'[&:has([aria-selected])]:bg-text_pink [&:has([aria-selected])]:text-btn_primary_text'
							),
							day_today: 'border border-text_pink',
							day_selected: 'bg-text_pink text-btn_primary_text',
							day_disabled: 'text-text_grey cursor-not-allowed'
						}}
					/>
				</div>
			) : (
				<div className='flex w-full flex-col justify-between border-t border-border_grey px-2 py-4'>
					<div className='grid grid-cols-3 gap-3'>
						{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
							<button
								type='button'
								key={month}
								onClick={() => setSelectedDate(new Date(selectedDate?.getFullYear() || 2025, index, 1))}
								className={cn(
									'flex h-10 items-center justify-center rounded-full text-sm text-text_primary hover:rounded-md',
									selectedDate?.getMonth() === index ? 'bg-text_pink text-btn_primary_text' : 'hover:bg-btn_secondary_background'
								)}
							>
								{month}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export default Calendar;
