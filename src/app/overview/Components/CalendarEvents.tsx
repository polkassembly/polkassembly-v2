// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Calendar from '@/app/_shared-components/Calendar/Calendar';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { dateToBlockNo } from '@/_shared/_utils/dateToBlockNo';
import { useState, useEffect, useCallback } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EProposalType, ICalendarEvent } from '@/_shared/types';
import Link from 'next/link';
import { Skeleton } from '@ui/Skeleton';
import type { Dayjs } from 'dayjs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { cn } from '@/lib/utils';
import styles from './Overview.module.scss';

const DATE_FORMAT = 'YYYY-MM-DD';
function getSinglePostLinkFromProposalType(proposalType: EProposalType): string {
	switch (proposalType) {
		case EProposalType.BOUNTY:
			return 'bounty';
		case EProposalType.DISCUSSION:
			return 'post';
		case EProposalType.REFERENDUM_V2:
			return 'referenda';
		default:
			return '';
	}
}

function EventList({ events, color }: { events: ICalendarEvent[]; color: string }) {
	return (
		<div className={styles.event_list_container}>
			{events.map((eventObj, index) => (
				// eslint-disable-next-line react/no-array-index-key
				<div key={`${eventObj.proposer}-${eventObj.index}-${index}`}>
					<p className='mb-0.5 text-xs text-text_primary'>{dayjs(eventObj.createdAt).format('MMM DD, YYYY HH:mm:ss')}</p>
					<Link
						className={cn(styles.event_list_link, color)}
						href={`/${getSinglePostLinkFromProposalType(eventObj.proposalType)}/${eventObj.index}`}
						target='_blank'
						rel='noreferrer'
					>
						{eventObj.title}
					</Link>
					{index !== events.length - 1 && <hr className='my-1 border-border_grey' />}
				</div>
			))}
		</div>
	);
}

function CalendarEvents() {
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const [monthlyEvents, setMonthlyEvents] = useState<{ [key: string]: ICalendarEvent[] }>({});
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [isLoading, setIsLoading] = useState(false);
	const [currentMonth, setCurrentMonth] = useState<string>(dayjs(new Date()).format('YYYY-MM'));

	const fetchMonthEvents = useCallback(
		async (date: Date) => {
			const monthKey = dayjs(date).format('YYYY-MM');

			// If we already have data for this month, don't fetch again
			if (monthlyEvents[monthKey as keyof typeof monthlyEvents] && !isLoading) {
				return;
			}

			setIsLoading(true);
			try {
				const startDate = dayjs(date).startOf('month');
				const endDate = dayjs(date).endOf('month');
				const currentBlock = (await apiService?.getBlockTime()) || 0;

				const newStartBlockNo = dateToBlockNo({
					currentBlockNumber: currentBlock,
					date: startDate.toDate(),
					network
				});

				const newEndBlockNo = dateToBlockNo({
					currentBlockNumber: currentBlock,
					date: endDate.toDate(),
					network
				});

				if (!newStartBlockNo || !newEndBlockNo) return;

				const { data, error } = await NextApiClientService.getCalendarEvents({
					endBlockNo: newEndBlockNo,
					startBlockNo: newStartBlockNo
				});

				if (error) {
					console.error('Error fetching calendar events:', error);
					return;
				}

				setMonthlyEvents((prev) => ({
					...prev,
					[monthKey]: data || []
				}));
			} catch (error) {
				console.error('Error fetching calendar events:', error);
			} finally {
				setIsLoading(false);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[apiService, network, monthlyEvents]
	);

	useEffect(() => {
		fetchMonthEvents(selectedDate);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentMonth, apiService, network]);

	const handleMonthChange = (date: Date) => {
		const newMonth = dayjs(date).format('YYYY-MM');
		setCurrentMonth(newMonth);
		fetchMonthEvents(date);
	};

	const getDateHasEvent = (value: Dayjs): boolean => {
		const monthKey = value.format('YYYY-MM');
		const exactDate = value.format(DATE_FORMAT);

		return monthlyEvents[monthKey as keyof typeof monthlyEvents]?.some((event) => dayjs(event.createdAt).format(DATE_FORMAT) === exactDate) || false;
	};

	const getEventData = (value: Dayjs): ICalendarEvent[] => {
		const monthKey = value.format('YYYY-MM');
		const exactDate = value.format(DATE_FORMAT);

		return monthlyEvents[monthKey as keyof typeof monthlyEvents]?.filter((event) => dayjs(event.createdAt).format(DATE_FORMAT) === exactDate) || [];
	};

	const dateCellRender = (value: Date | undefined) => {
		if (!value) return null;
		const dateValue = dayjs(value);
		const hasEvent = getDateHasEvent(dateValue);
		const isSelected = dayjs(selectedDate).format(DATE_FORMAT) === dateValue.format(DATE_FORMAT);

		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div
							aria-hidden='true'
							onClick={() => setSelectedDate(value)}
							className={cn(
								styles.calendar_event_tooltip_trigger,
								hasEvent ? 'bg-bg_pink text-white' : '',
								isSelected ? 'border-2 border-primary_border' : '',
								!hasEvent && !isSelected ? 'hover:bg-primary_border' : ''
							)}
						>
							{value.getDate()}
						</div>
					</TooltipTrigger>
					{hasEvent && (
						<TooltipContent className='w-[280px] bg-social_tooltip_background p-2'>
							<EventList
								events={getEventData(dateValue)}
								color='text-btn_primary_text hover:text-text_pink'
							/>
						</TooltipContent>
					)}
				</Tooltip>
			</TooltipProvider>
		);
	};

	const selectedDateEvents = getEventData(dayjs(selectedDate));

	return (
		<div>
			<div className={styles.calendar_event_container}>
				<div>
					<h2 className={styles.calendar_event_title}>Events</h2>
					<div className='hidden xl:block'>
						<Calendar
							cellRender={dateCellRender}
							selectedDate={selectedDate}
							setSelectedDate={setSelectedDate}
							isLoading={isLoading}
							onMonthChange={handleMonthChange}
						/>
						<p className='mt-4 text-xs text-text_grey'>*DateTime in UTC</p>
					</div>
				</div>
				<div className='my-3 w-full xl:mt-5 xl:h-[400px] xl:w-[50%] xl:pl-8'>
					{isLoading ? (
						<div className='text-text_secondary'>
							<Skeleton className='h-[400px] w-full' />
						</div>
					) : selectedDateEvents.length > 0 ? (
						<EventList
							events={getEventData(dayjs(selectedDate))}
							color='text-btn_secondary_text hover:text-text_pink'
						/>
					) : (
						<div className='text-text_secondary'>No events for this date</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default CalendarEvents;
