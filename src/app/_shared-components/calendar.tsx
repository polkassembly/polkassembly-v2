// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { DayPicker, SelectSingleEventHandler } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { cn } from '@/lib/utils';

interface CalendarProps {
	cellRender: (date: Date | undefined) => React.ReactNode;
	selectedDate: Date;
	setSelectedDate: (date: Date) => void;
	isLoading?: boolean;
	onMonthChange: (date: Date) => void;
}

function Calendar({ cellRender, selectedDate, setSelectedDate, isLoading, onMonthChange }: CalendarProps) {
	const [view, setView] = useState<'month' | 'year'>('month');

	const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newDate = new Date(selectedDate);
		newDate.setMonth(parseInt(event.target.value, 10));
		setSelectedDate(newDate);
		onMonthChange(newDate);
	};

	const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const newDate = new Date(selectedDate);
		newDate.setFullYear(parseInt(event.target.value, 10));
		setSelectedDate(newDate);
		onMonthChange(newDate);
	};

	const handleMonthButtonClick = (index: number) => {
		const newDate = new Date(selectedDate);
		newDate.setMonth(index);
		setSelectedDate(newDate);
		setView('month');
		onMonthChange(newDate);
	};

	// Custom day content renderer that integrates with cellRender
	const renderDay = (date: Date) => {
		const isSelected = date.toDateString() === selectedDate.toDateString();
		const customContent = cellRender(date);

		return (
			<div
				className={cn(
					'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
					isSelected && 'border-2 border-primary_border bg-bg_pink',
					'cursor-pointer hover:text-white'
				)}
			>
				{customContent || date.getDate()}
			</div>
		);
	};
	const handleDateSelect = (date: Date) => {
		setSelectedDate(date);

		// Check if month or year has changed
		if (date.getMonth() !== selectedDate.getMonth() || date.getFullYear() !== selectedDate.getFullYear()) {
			onMonthChange(date);
		}
	};

	return (
		<div className='relative w-full rounded-lg border border-border_grey shadow-md xl:w-[320px]'>
			<div className='flex w-full justify-end gap-2 px-2 py-4'>
				<select
					className='rounded-sm border border-border_grey px-1 py-0.5 text-sm focus:outline-none'
					onChange={handleYearChange}
					value={selectedDate.getFullYear()}
				>
					{[...Array(126).keys()].map((i) => {
						const year = 1900 + i;
						return (
							<option
								key={`year-${year}`}
								value={year}
							>
								{year}
							</option>
						);
					})}
				</select>
				{view === 'month' && (
					<select
						className='rounded-sm border border-border_grey px-1 py-0.5 text-sm focus:outline-none'
						onChange={handleMonthChange}
						value={selectedDate.getMonth()}
					>
						{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
							<option
								key={`month-${month}`}
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

			{isLoading && (
				<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
					<div className='text-white'>Loading...</div>
				</div>
			)}

			{view === 'month' ? (
				<div className='w-full border-t border-border_grey'>
					<DayPicker
						mode='single'
						selected={selectedDate}
						onSelect={handleDateSelect as SelectSingleEventHandler}
						showOutsideDays
						fromYear={1900}
						className='m-0 p-0'
						onMonthChange={onMonthChange}
						components={{
							Day: ({ date }) => {
								if (!date) return null;
								return renderDay(date);
							}
						}}
						month={selectedDate}
						classNames={{
							caption_label: 'text-sm font-medium hidden',
							nav: 'hidden',
							table: 'w-full border-collapse',
							head_row: 'flex gap-2 justify-between w-full',
							head_cell: 'text-text_primary text-sm font-medium p-1',
							row: 'flex gap-2',
							cell: 'p-0',
							day: 'w-full h-full',
							day_today: 'font-bold',
							day_outside: 'text-gray-400',
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
								key={`month-button-${month}`}
								onClick={() => handleMonthButtonClick(index)}
								className={cn(
									'flex h-10 items-center justify-center rounded-full text-sm text-text_primary',
									selectedDate.getMonth() === index ? 'bg-bg_pink text-white' : 'hover:bg-bg_pink hover:text-white'
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
