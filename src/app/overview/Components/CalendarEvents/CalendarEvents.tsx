// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Calendar from '@/app/_shared-components/Calendar/Calendar';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { dateToBlockNum } from '@/_shared/_utils/dateToBlockNum';
import { useState, useCallback } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EProposalType, ICalendarEvent } from '@/_shared/types';
import Link from 'next/link';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import type { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import styles from '../Overview.module.scss';

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

export default function CalendarEvents() {
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const t = useTranslations('Overview');

	// Function to calculate block numbers for a given date range
	const getBlockNumbers = useCallback(
		async (startDate: Date, endDate: Date) => {
			const currentBlock = (await apiService?.getCurrentBlockHeight()) || 0;
			if (!currentBlock) {
				return { startBlockNo: null, endBlockNo: null };
			}

			const start = dayjs(startDate).startOf('month');
			const end = dayjs(endDate).endOf('month');

			const newStartBlockNo = dateToBlockNum({
				currentBlockNumber: currentBlock.toNumber(),
				date: start.toDate(),
				network
			});

			const newEndBlockNo = dateToBlockNum({
				currentBlockNumber: currentBlock.toNumber(),
				date: end.toDate(),
				network
			});

			return { startBlockNo: newStartBlockNo, endBlockNo: newEndBlockNo };
		},
		[apiService, network]
	);
	const { data: monthlyEvents = {}, isLoading } = useQuery({
		queryKey: ['calendarEvents', selectedDate.getFullYear(), selectedDate.getMonth()],
		queryFn: async () => {
			const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
			const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

			const { startBlockNo, endBlockNo } = await getBlockNumbers(startOfMonth, endOfMonth);

			if (!startBlockNo || !endBlockNo) return {};
			const { data, error } = await NextApiClientService.getCalendarEvents({
				endBlockNo,
				startBlockNo
			});

			if (error) {
				console.error('Error fetching calendar events:', error);
				return {};
			}
			const monthKey = dayjs(startOfMonth).format('YYYY-MM');
			return { [monthKey]: data || [] };
		},
		staleTime: 1000 * 60 * 5,
		enabled: true
	});

	const handleMonthChange = (date: Date) => {
		setSelectedDate(date);
	};

	const getDateHasEvent = (value: Dayjs): boolean => {
		const monthKey = value.format('YYYY-MM');
		const exactDate = value.format(DATE_FORMAT);

		return monthlyEvents[monthKey]?.some((event) => dayjs(event.createdAt).format(DATE_FORMAT) === exactDate) || false;
	};

	const getEventData = (value: Dayjs): ICalendarEvent[] => {
		const monthKey = value.format('YYYY-MM');
		const exactDate = value.format(DATE_FORMAT);

		return monthlyEvents[monthKey]?.filter((event) => dayjs(event.createdAt).format(DATE_FORMAT) === exactDate) || [];
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
					<h2 className={styles.calendar_event_title}>{t('events')}</h2>
					<div className='hidden xl:block'>
						<Calendar
							cellRender={dateCellRender}
							selectedDate={selectedDate}
							setSelectedDate={setSelectedDate}
							isLoading={isLoading}
							onMonthChange={handleMonthChange}
						/>
						<p className='mt-4 text-xs text-text_grey'>{t('*DateTimeinUTC')}</p>
					</div>
				</div>
				<div className='my-3 w-full xl:mt-5 xl:h-[400px] xl:w-[50%] xl:pl-8'>
					{isLoading ? (
						<div className='relative'>
							<LoadingLayover />
						</div>
					) : selectedDateEvents.length > 0 ? (
						<EventList
							events={selectedDateEvents}
							color='text-btn_secondary_text hover:text-text_pink'
						/>
					) : (
						<div className='text-text_secondary'>{t('noEventsForThisDate')}</div>
					)}
				</div>
			</div>
		</div>
	);
}
