// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ChangeEvent, ReactNode, useState } from 'react';
import { DayPicker, SelectSingleEventHandler } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import styles from './Calendar.module.scss';
import LoadingLayover from '../LoadingLayover';

interface CalendarProps {
	cellRender: (date: Date | undefined) => ReactNode;
	selectedDate: Date;
	setSelectedDate: (date: Date) => void;
	isLoading?: boolean;
	onMonthChange: (date: Date) => void;
}

function Calendar({ cellRender, selectedDate, setSelectedDate, isLoading, onMonthChange }: CalendarProps) {
	const t = useTranslations();
	const [view, setView] = useState<'month' | 'year'>('month');

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const newDate = new Date(selectedDate);
		newDate.setMonth(parseInt(event.target.value, 10));
		setSelectedDate(newDate);
		onMonthChange(newDate);
	};

	const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
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
			<div className={cn(styles.calendar_day, isSelected && 'border-2 border-primary_border bg-bg_pink', 'cursor-pointer hover:text-white')}>{customContent || date.getDate()}</div>
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
		<div className={styles.calendary_container}>
			<div className={styles.calendary_header}>
				<select
					className={styles.calendary_header_select}
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
						className={styles.calendary_header_select}
						onChange={handleMonthChange}
						value={selectedDate.getMonth()}
					>
						{months.map((month, index) => (
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
						className={cn(styles.calendary_header_button, 'rounded-l-sm', view === 'month' ? 'border-text_pink' : 'border-border_grey')}
						onClick={() => setView('month')}
					>
						{t('Overview.month')}
					</button>
					<button
						type='button'
						className={cn(styles.calendary_header_button, 'rounded-r-sm', view === 'year' ? 'border-text_pink' : 'border-border_grey')}
						onClick={() => setView('year')}
					>
						{t('Overview.year')}
					</button>
				</div>
			</div>

			{isLoading && (
				<div className='relative'>
					<LoadingLayover />
				</div>
			)}

			{view === 'month' ? (
				<div className={styles.calendary_month_container}>
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
				<div className={styles.calendary_month_container_header}>
					<div className='grid grid-cols-3 gap-3'>
						{months.map((month, index) => (
							<button
								type='button'
								key={`month-button-${month}`}
								onClick={() => handleMonthButtonClick(index)}
								className={cn(styles.calendary_month_container_header_button, selectedDate.getMonth() === index ? 'bg-bg_pink text-white' : 'hover:bg-bg_pink hover:text-white')}
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
