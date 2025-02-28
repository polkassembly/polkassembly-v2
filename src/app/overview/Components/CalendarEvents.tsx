// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Calendar from '@/app/_shared-components/calendar';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { dateToBlockNo } from '@/_shared/_utils/dateToBlockNo';
import { useState, useEffect } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ICalendarEvent } from '@/_shared/types';

function CalendarEvents() {
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const [calendarEvents, setCalendarEvents] = useState<ICalendarEvent[]>([]);

	const selectedDate = new Date();
	const startDate = dayjs(selectedDate).startOf('month');
	const endDate = dayjs(selectedDate).endOf('month');

	const [startBlockNo, setStartBlockNo] = useState<number | null>(null);
	const [endBlockNo, setEndBlockNo] = useState<number | null>(null);
	async function fetchCalendarEvents() {
		if (!startBlockNo || !endBlockNo) return;

		try {
			const { data, error } = await NextApiClientService.getCalendarEvents({
				endBlockNo,
				startBlockNo
			});

			setCalendarEvents(data || []);

			if (error) {
				console.error('Error fetching calendar events:', error);
			}
		} catch (error) {
			console.error('Error fetching calendar events:', error);
		}
	}
	console.log('calendarEvents', calendarEvents);

	useEffect(() => {
		const fetchBlockNumbers = async () => {
			const currentBlock = (await apiService?.getBlockTime()) || 0;
			setStartBlockNo(
				dateToBlockNo({
					currentBlockNumber: currentBlock,
					date: startDate.toDate(),
					network
				})
			);
			setEndBlockNo(
				dateToBlockNo({
					currentBlockNumber: currentBlock,
					date: endDate.toDate(),
					network
				})
			);
		};

		fetchBlockNumbers();
	}, [apiService, startDate, endDate, network]);

	useEffect(() => {
		fetchCalendarEvents();
	}, [startBlockNo, endBlockNo]);
	return (
		<div className='mt-6 rounded-xl bg-bg_modal p-6 shadow-lg lg:col-span-1'>
			<h2 className='mb-4 text-lg font-semibold text-btn_secondary_text'>Upcoming Events</h2>
			<Calendar />
			<p className='mt-4 text-xs text-text_grey'>*DateTime in UTC</p>
		</div>
	);
}

export default CalendarEvents;
