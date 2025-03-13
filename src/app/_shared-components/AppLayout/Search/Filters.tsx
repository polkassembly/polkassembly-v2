// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useCallback, useState, useMemo } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { RefinementList, useInstantSearch, Configure } from 'react-instantsearch';
import { allowedNetwork, POST_TOPIC_MAP } from '@/_shared/_constants/searchConstants';
import { IoIosArrowDown } from 'react-icons/io';
import { RadioGroup, RadioGroupItem } from '@ui/RadioGroup/RadioGroup';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { ESearchType } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

interface FiltersProps {
	activeIndex: ESearchType | null;
	onChange: (index: ESearchType | null) => void;
	isSuperSearch?: boolean;
}

interface RefinementItem {
	value: string;
	label: string;
	count: number;
	isRefined: boolean;
}

const options = [
	{ value: ESearchType.POSTS, label: 'Referenda' },
	{ value: ESearchType.USERS, label: 'Users' },
	{ value: ESearchType.DISCUSSIONS, label: 'Discussions' }
];

interface DateRange {
	label: string;
	start: number;
	end: number;
}

type DropdownType = 'networks' | 'date' | 'tracks' | 'topics' | 'tags' | null;

const LABELSTYLE = 'flex items-center gap-1 text-xs text-text_primary';
export default function Filters({ activeIndex, onChange, isSuperSearch = false }: FiltersProps) {
	const { results, refresh } = useInstantSearch();
	const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
	const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
	const network = getCurrentNetwork();

	const transformTopicItems = useCallback((items: RefinementItem[]) => {
		return items.map((item: RefinementItem) => {
			const topicName = Object.keys(POST_TOPIC_MAP).find((key) => POST_TOPIC_MAP[key as keyof typeof POST_TOPIC_MAP] === Number(item.value));
			return {
				...item,
				label: `${
					topicName
						? topicName
								.replace(/_/g, ' ')
								.toLowerCase()
								.replace(/^\w/, (c) => c.toUpperCase())
						: item.label
				} (${item.count})`
			};
		});
	}, []);

	const transformTagItems = useCallback((items: RefinementItem[]) => {
		return items.map((item: RefinementItem) => ({
			...item,
			label: `${item.label} (${item.count})`
		}));
	}, []);

	const clearDateFilter = useCallback(() => {
		setSelectedDateRange(null);
		refresh();
	}, [refresh]);

	const handleDropdownOpen = useCallback((dropdown: DropdownType) => {
		setOpenDropdown(dropdown);
	}, []);

	const handleDateSelection = useCallback(
		(range: DateRange | null) => {
			setSelectedDateRange(range);
			refresh();
		},
		[refresh]
	);

	const handleDateClick = useCallback(
		(label: string) => {
			const now = dayjs.utc();
			let range: DateRange | null = null;

			switch (label) {
				case 'Today':
					range = {
						label,
						start: now.startOf('day').unix(),
						end: now.endOf('day').unix()
					};
					break;
				case 'Last 7 days':
					range = {
						label,
						start: now.subtract(7, 'days').startOf('day').unix(),
						end: now.endOf('day').unix()
					};
					break;
				case 'Last 30 days':
					range = {
						label,
						start: now.subtract(30, 'days').startOf('day').unix(),
						end: now.endOf('day').unix()
					};
					break;
				case 'Last 3 months':
					range = {
						label,
						start: now.subtract(3, 'months').startOf('day').unix(),
						end: now.endOf('day').unix()
					};
					break;
				case 'All time':
					range = {
						label,
						start: dayjs.utc('2020-01-01').startOf('day').unix(),
						end: now.endOf('day').unix()
					};
					break;
				default:
					range = null;
			}

			handleDateSelection(range);
		},
		[handleDateSelection]
	);

	useMemo(() => {
		if (results.query.length > 2 && activeIndex === null) {
			onChange(ESearchType.POSTS);
		}
		if (results.query.length === 0 && activeIndex !== null) {
			onChange(null);
		}
	}, [results.query.length, activeIndex, onChange]);

	const transformTrackItems = useCallback(
		(items: RefinementItem[]) => {
			return items.map((item: RefinementItem) => {
				const trackDetails = NETWORKS_DETAILS[network as keyof typeof NETWORKS_DETAILS]?.trackDetails;
				const trackInfo = Object.values(trackDetails || {}).find((track) => track.trackId?.toString() === item.value);
				const trackName = trackInfo?.name || item.label;
				const formattedTrackName = trackName
					.replace(/_/g, ' ')
					.toLowerCase()
					.replace(/^\w/, (c) => c.toUpperCase());

				return {
					...item,
					label: `${formattedTrackName} (${item.count})`
				};
			});
		},
		[network]
	);

	return (
		<div>
			<div className='mt-3 flex justify-between gap-6'>
				<div>
					<RadioGroup
						value={activeIndex || (results.query.length > 2 ? ESearchType.POSTS : undefined)}
						onValueChange={(e) => onChange(e as ESearchType | null)}
						className='flex flex-row gap-3'
						disabled={results.query.length < 3}
					>
						{options.map((option) => {
							return (
								<label
									key={option.value}
									htmlFor={option.value}
									className={`flex cursor-pointer flex-row items-center gap-1 ${activeIndex === option.value ? 'rounded-full bg-progress_pink_bg p-2' : ''}`}
								>
									<RadioGroupItem
										value={option.value}
										id={option.value}
										className='h-4 w-4'
									/>
									<span className='text-xs text-text_primary'>{option.label}</span>
								</label>
							);
						})}
					</RadioGroup>
				</div>
				<div>
					{(activeIndex === ESearchType.POSTS || activeIndex === ESearchType.DISCUSSIONS) && (
						<div className='flex gap-4'>
							{isSuperSearch && (
								<DropdownMenu
									open={openDropdown === 'networks'}
									onOpenChange={(open) => handleDropdownOpen(open ? 'networks' : null)}
								>
									<DropdownMenuTrigger asChild>
										<button
											type='button'
											className='flex items-center gap-1 text-xs text-text_primary'
										>
											Networks <IoIosArrowDown />
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className='max-h-[250px] w-full overflow-auto p-3'>
										<RefinementList
											attribute='network'
											classNames={{
												list: 'space-y-2',
												label: LABELSTYLE,
												labelText: LABELSTYLE,
												count: 'hidden'
											}}
											transformItems={(items: RefinementItem[]) => items.filter((item) => allowedNetwork.includes(item.value))}
										/>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
							<DropdownMenu
								open={openDropdown === 'date'}
								onOpenChange={(open) => handleDropdownOpen(open ? 'date' : null)}
							>
								<DropdownMenuTrigger asChild>
									<button
										type='button'
										className='flex items-center gap-1 text-xs text-text_primary'
									>
										{selectedDateRange ? selectedDateRange.label : 'Date'} <IoIosArrowDown />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className='max-h-[250px] w-48 overflow-auto p-3'>
									{selectedDateRange && (
										<Configure
											filters={`created_at >= ${selectedDateRange.start} AND created_at <= ${selectedDateRange.end}`}
											numericFilters={[`created_at >= ${selectedDateRange.start}`, `created_at <= ${selectedDateRange.end}`]}
										/>
									)}
									<div className='space-y-2'>
										{['Today', 'Last 7 days', 'Last 30 days', 'Last 3 months', 'All time'].map((label) => (
											<button
												key={label}
												type='button'
												className={`w-full rounded px-2 py-1 text-left text-xs ${selectedDateRange?.label === label ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
												onClick={() => handleDateClick(label)}
											>
												{label}
											</button>
										))}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
							{activeIndex === ESearchType.POSTS && (
								<DropdownMenu
									open={openDropdown === 'tracks'}
									onOpenChange={(open) => handleDropdownOpen(open ? 'tracks' : null)}
								>
									<DropdownMenuTrigger asChild>
										<button
											type='button'
											className='flex items-center gap-1 text-xs text-text_primary'
										>
											Tracks <IoIosArrowDown />
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className='max-h-[250px] w-full overflow-auto p-3'>
										<RefinementList
											attribute='track_number'
											classNames={{
												list: 'space-y-2',
												label: LABELSTYLE,
												labelText: LABELSTYLE,
												count: 'hidden'
											}}
											transformItems={transformTrackItems}
											limit={15}
											showMore={false}
										/>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
							<DropdownMenu
								open={openDropdown === 'topics'}
								onOpenChange={(open) => handleDropdownOpen(open ? 'topics' : null)}
							>
								<DropdownMenuTrigger asChild>
									<button
										type='button'
										className='flex items-center gap-1 text-xs text-text_primary'
									>
										Topics <IoIosArrowDown />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className='max-h-[250px] w-full overflow-auto p-3'>
									<RefinementList
										attribute='topic'
										classNames={{
											list: 'space-y-2',
											label: LABELSTYLE,
											labelText: LABELSTYLE,
											count: 'hidden'
										}}
										transformItems={transformTopicItems}
										limit={15}
										showMore={false}
									/>
								</DropdownMenuContent>
							</DropdownMenu>

							<DropdownMenu
								open={openDropdown === 'tags'}
								onOpenChange={(open) => handleDropdownOpen(open ? 'tags' : null)}
							>
								<DropdownMenuTrigger asChild>
									<button
										type='button'
										className='flex items-center gap-1 text-xs text-text_primary'
									>
										Tags <IoIosArrowDown />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className='max-h-[250px] w-full overflow-auto p-3'>
									<RefinementList
										attribute='tags'
										classNames={{
											list: 'space-y-2',
											label: LABELSTYLE,
											labelText: LABELSTYLE,
											count: 'hidden'
										}}
										transformItems={transformTagItems}
									/>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}
				</div>
			</div>
			<div className='mt-3 flex justify-start'>
				{' '}
				{selectedDateRange && (
					<button
						type='button'
						onClick={clearDateFilter}
						className='rounded-full bg-toast_info_bg px-2 py-1 text-xs text-toast_info_text'
					>
						X Date Filter
					</button>
				)}
			</div>
		</div>
	);
}
