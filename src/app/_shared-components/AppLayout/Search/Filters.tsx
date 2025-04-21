// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useCallback, useMemo, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { useInstantSearch, Configure, useRefinementList, useClearRefinements } from 'react-instantsearch';
import { POST_TOPIC_MAP } from '@/_shared/_constants/searchConstants';
import { RadioGroup, RadioGroupItem } from '@ui/RadioGroup/RadioGroup';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ESearchType } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import styles from './Search.module.scss';
import { Checkbox } from '../../Checkbox';
import { Button } from '../../Button';

interface FiltersProps {
	activeIndex: ESearchType;
	onChange: (index: ESearchType) => void;
}

interface RefinementItem {
	value: string;
	label: string;
	count: number;
	isRefined: boolean;
}

interface DateRange {
	label: string;
	start: number;
	end: number;
}

export default function Filters({ activeIndex, onChange }: FiltersProps) {
	const t = useTranslations('Search');
	const { items: topicItems, refine: refineTopic } = useRefinementList({
		attribute: 'topic'
	});
	const { items: tagItems, refine: refineTag } = useRefinementList({
		attribute: 'tags'
	});

	const { items: trackItems, refine: refineTrack } = useRefinementList({
		attribute: 'track_number'
	});

	const { refine: clearRefinements } = useClearRefinements();

	const { results, refresh } = useInstantSearch();
	const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
	const network = getCurrentNetwork();

	const options = [
		{ value: ESearchType.POSTS, label: t('referenda') },
		{ value: ESearchType.USERS, label: t('users') },
		{ value: ESearchType.DISCUSSIONS, label: t('discussions') }
	];

	const trackItemsList = useMemo(() => {
		return trackItems.map((item: RefinementItem) => {
			const trackDetails = NETWORKS_DETAILS[`${network}`]?.trackDetails;
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
	}, [network, trackItems]);

	const topicItemsList = useMemo(() => {
		return topicItems.map((item: RefinementItem) => {
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
	}, [topicItems]);

	const tagItemsList = useMemo(() => {
		return tagItems.map((item: RefinementItem) => ({
			...item,
			label: `${item.label} (${item.count})`
		}));
	}, [tagItems]);

	const clearDateFilter = useCallback(() => {
		setSelectedDateRange(null);
		refresh();
	}, [refresh]);

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
				case t('today'):
					range = {
						label,
						start: now.startOf('day').unix(),
						end: now.endOf('day').unix()
					};
					break;
				case t('last_7_days'):
					range = {
						label,
						start: now.subtract(7, 'days').startOf('day').unix(),
						end: now.endOf('day').unix()
					};
					break;
				case t('last_30_days'):
					range = {
						label,
						start: now.subtract(30, 'days').startOf('day').unix(),
						end: now.endOf('day').unix()
					};
					break;
				case t('last_3_months'):
					range = {
						label,
						start: now.subtract(3, 'months').startOf('day').unix(),
						end: now.endOf('day').unix()
					};
					break;
				case t('all_time'):
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[handleDateSelection]
	);

	const refinedTrackItems = useMemo(() => {
		return trackItemsList.filter((item) => item.isRefined);
	}, [trackItemsList]);

	const refinedTopicItems = useMemo(() => {
		return topicItemsList.filter((item) => item.isRefined);
	}, [topicItemsList]);

	const refinedTagItems = useMemo(() => {
		return tagItemsList.filter((item) => item.isRefined);
	}, [tagItemsList]);

	return (
		<div>
			<div className='mt-3 flex justify-between gap-6'>
				<div>
					<RadioGroup
						value={activeIndex || ESearchType.POSTS}
						onValueChange={(e) => onChange(e as ESearchType)}
						className='flex flex-row gap-3'
						disabled={results.query.length < 3}
					>
						{options.map((option) => {
							return (
								<label
									key={option.value}
									htmlFor={option.value}
									className={`${styles.radio_label} ${activeIndex === option.value ? styles.radio_label_active : ''}`}
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
					{(activeIndex === ESearchType.POSTS || activeIndex === ESearchType.DISCUSSIONS) && results.nbHits > 0 && (
						<div className='flex items-center gap-x-4'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>{selectedDateRange ? selectedDateRange.label : 'Date'}</DropdownMenuTrigger>
								<DropdownMenuContent>
									{selectedDateRange && (
										<Configure
											filters={`created_at >= ${selectedDateRange.start} AND created_at <= ${selectedDateRange.end}`}
											numericFilters={[`created_at >= ${selectedDateRange.start}`, `created_at <= ${selectedDateRange.end}`]}
										/>
									)}
									<div className='space-y-2'>
										{[t('today'), t('last_7_days'), t('last_30_days'), t('last_3_months'), t('all_time')].map((label) => (
											<button
												key={label}
												type='button'
												className={cn(styles.date_filter_label, selectedDateRange?.label === label ? styles.radio_label_active : 'whitespace-nowrap hover:bg-topic_tag_bg')}
												onClick={() => handleDateClick(label)}
											>
												{label}
											</button>
										))}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
							{activeIndex === ESearchType.POSTS && trackItems.length > 0 && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>{t('tracks')}</DropdownMenuTrigger>
									<DropdownMenuContent className='p-2'>
										{trackItemsList.map((item) => (
											<div
												key={item.value}
												className='mb-2 flex flex-nowrap items-center gap-x-2'
											>
												<Checkbox
													key={item.value}
													id={item.value}
													checked={item.isRefined}
													onCheckedChange={(checked) => !!checked && refineTrack(item.value)}
												/>
												<label
													htmlFor={item.value}
													className='cursor-pointer whitespace-nowrap text-xs text-text_primary'
												>
													{item.label}
												</label>
											</div>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							)}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>{t('topics')}</DropdownMenuTrigger>
								<DropdownMenuContent className='p-2'>
									{topicItemsList.map((item) => (
										<div
											key={item.value}
											className='mb-2 flex flex-nowrap items-center gap-x-2'
										>
											<Checkbox
												key={item.value}
												id={item.value}
												checked={item.isRefined}
												onCheckedChange={(checked) => !!checked && refineTopic(item.value)}
											/>
											<label
												htmlFor={item.value}
												className='cursor-pointer whitespace-nowrap text-xs text-text_primary'
											>
												{item.label}
											</label>
										</div>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>{t('tags')}</DropdownMenuTrigger>
								<DropdownMenuContent className='p-2'>
									{tagItemsList.map((item) => (
										<div
											key={item.value}
											className='mb-2 flex flex-nowrap items-center gap-x-2'
										>
											<Checkbox
												key={item.value}
												id={item.value}
												checked={item.isRefined}
												onCheckedChange={(checked) => !!checked && refineTag(item.value)}
											/>
											<label
												htmlFor={item.value}
												className='cursor-pointer whitespace-nowrap text-xs text-text_primary'
											>
												{item.label}
											</label>
										</div>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					)}
				</div>
			</div>
			<div className='mt-3 flex items-center gap-x-4'>
				<div>
					{selectedDateRange && results.query.length > 2 && (
						<button
							type='button'
							onClick={clearDateFilter}
							className={styles.clear_date_filter}
						>
							<X className='text-xs' /> <span>{t('date_filter')}</span>
						</button>
					)}
				</div>
				{refinedTrackItems?.length > 0 && (
					<div className='flex items-center gap-x-1 text-xs text-wallet_btn_text'>
						<span className='text-text_pink'>{t('tracks')}:</span>
						<div className='flex'>
							{refinedTrackItems
								.filter((item) => item.isRefined)
								.map((item, index) => (
									<span key={item.value}>
										{index !== 0 ? ', ' : ''}
										{item.label}
									</span>
								))}
						</div>
					</div>
				)}
				{refinedTopicItems?.length > 0 && (
					<div className='flex items-center gap-x-1 text-xs text-wallet_btn_text'>
						<span className='text-text_pink'>{t('topics')}:</span>
						<div className='flex'>
							{refinedTopicItems
								.filter((item) => item.isRefined)
								.map((item, index) => (
									<span key={item.value}>
										{index !== 0 ? ', ' : ''}
										{item.label}
									</span>
								))}
						</div>
					</div>
				)}
				{refinedTagItems?.length > 0 && (
					<div className='flex items-center gap-x-1 text-xs text-wallet_btn_text'>
						<span className='text-text_pink'>{t('tags')}:</span>
						<div className='flex'>
							{refinedTagItems
								.filter((item) => item.isRefined)
								.map((item, index) => (
									<span key={item.value}>
										{index !== 0 ? ', ' : ''}
										{item.label}
									</span>
								))}
						</div>
					</div>
				)}
				<div className='flex-1' />
				{(refinedTrackItems?.length > 0 || refinedTopicItems?.length > 0 || refinedTagItems?.length > 0) && (
					<Button
						variant='ghost'
						className='text-text_pink'
						size='sm'
						onClick={() => {
							clearRefinements();
							clearDateFilter();
						}}
					>
						{t('clearFilters')}
					</Button>
				)}
			</div>
		</div>
	);
}
