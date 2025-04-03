// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { dateToBlockNum } from '@/_shared/_utils/dateToBlockNum';
import { useState, useCallback, useMemo } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EProposalType, ICalendarEvent } from '@/_shared/types';
import Link from 'next/link';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import type { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { cn } from '@/lib/utils';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useQuery } from '@tanstack/react-query';
import styles from '../Overview.module.scss';
import OverviewCalendar from '../OverviewCalendar/OverviewCalendar';

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
	const [eventsData, setEventsData] = useState<Record<string, ICalendarEvent[]>>({});
	const t = useTranslations('Overview');

	const currentYear = selectedDate.getFullYear();
	const currentMonth = selectedDate.getMonth();

	const monthKey = useMemo(() => {
		return dayjs(new Date(currentYear, currentMonth, 1)).format('YYYY-MM');
	}, [currentYear, currentMonth]);

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

	const fetchCalendarEvents = useCallback(async () => {
		const startOfMonth = new Date(currentYear, currentMonth, 1);
		const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
		const { startBlockNo, endBlockNo } = await getBlockNumbers(startOfMonth, endOfMonth);
		if (!startBlockNo || !endBlockNo) return null;

		const response = await NextApiClientService.getCalendarEvents({
			endBlockNo,
			startBlockNo
		});
		if (response.error) return null;
		setEventsData((prevData) => ({
			...prevData,
			[monthKey]: response.data || []
		}));
		return Array.isArray(response.data) ? response.data : [];
	}, [currentYear, currentMonth, getBlockNumbers, monthKey]);

	const { isFetching } = useQuery({
		queryKey: ['calendarEvents', currentYear, currentMonth],
		queryFn: fetchCalendarEvents,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!apiService
	});

	const handleMonthChange = (date: Date) => {
		setSelectedDate(date);
	};

	const getDateHasEvent = (value: Dayjs): boolean => {
		const dateMonthKey = value.format('YYYY-MM');
		const exactDate = value.format(DATE_FORMAT);
		const monthEvents = eventsData[dateMonthKey];
		if (!monthEvents || !Array.isArray(monthEvents)) {
			return false;
		}
		return monthEvents.some((event) => dayjs(event.createdAt).format(DATE_FORMAT) === exactDate);
	};

	const getEventData = (value: Dayjs): ICalendarEvent[] => {
		const dateMonthKey = value.format('YYYY-MM');
		const exactDate = value.format(DATE_FORMAT);
		const monthEvents = eventsData[dateMonthKey];
		if (!monthEvents || !Array.isArray(monthEvents)) {
			return [];
		}
		return monthEvents.filter((event) => dayjs(event.createdAt).format(DATE_FORMAT) === exactDate);
	};

	// eslint-disable-next-line
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
						<OverviewCalendar
							selectedDate={selectedDate}
							setSelectedDate={setSelectedDate}
							isLoading={isFetching}
							onMonthChange={handleMonthChange}
						/>
						<p className='mt-4 text-xs text-text_grey'>{t('*DateTimeinUTC')}</p>
					</div>
				</div>
				<div className='my-3 w-full xl:mt-5 xl:h-[400px] xl:w-[50%] xl:pl-8'>
					{isFetching ? (
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
