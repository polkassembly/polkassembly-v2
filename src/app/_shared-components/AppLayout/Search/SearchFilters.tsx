// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useMemo } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { useInstantSearch, useRefinementList, useClearRefinements, useNumericMenu } from 'react-instantsearch';
import { POST_TOPIC_MAP } from '@/_shared/_constants/searchConstants';
import { RadioGroup, RadioGroupItem } from '@ui/RadioGroup/RadioGroup';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { ESearchType } from '@/_shared/types';
import { parseCamelCase } from '@/app/_client-utils/parseCamelCase';
import styles from './Search.module.scss';
import { Checkbox } from '../../Checkbox';
import { Button } from '../../Button';

interface SearchFiltersProps {
	activeIndex: ESearchType;
	onChange: (index: ESearchType) => void;
}

interface RefinementItem {
	value: string;
	label: string;
	count: number;
	isRefined: boolean;
}

export default function SearchFilters({ activeIndex, onChange }: SearchFiltersProps) {
	const t = useTranslations('Search');

	const now = dayjs.utc();

	const { items: dateItems, refine: refineDate } = useNumericMenu({
		attribute: 'createdAtTimestamp',
		items: [
			{
				label: 'Today',
				start: now.startOf('day').unix(),
				end: now.endOf('day').unix()
			},
			{
				label: 'Last 7 days',
				start: now.subtract(7, 'days').startOf('day').unix(),
				end: now.endOf('day').unix()
			},
			{
				label: 'Last 30 days',
				start: now.subtract(30, 'days').startOf('day').unix(),
				end: now.endOf('day').unix()
			},
			{
				label: 'Last 3 months',
				start: now.subtract(3, 'months').startOf('day').unix(),
				end: now.endOf('day').unix()
			},
			{
				label: 'All time',
				start: dayjs.utc('2020-01-01').startOf('day').unix(),
				end: now.endOf('day').unix()
			}
		]
	});

	const { items: topicItems, refine: refineTopic } = useRefinementList({
		attribute: 'topic'
	});
	const { items: tagItems, refine: refineTag } = useRefinementList({
		attribute: 'tags'
	});

	const { items: trackItems, refine: refineTrack } = useRefinementList({
		attribute: 'origin'
	});

	const { refine: clearRefinements } = useClearRefinements();

	const { results } = useInstantSearch();

	const options = [
		{ value: ESearchType.POSTS, label: t('referenda') },
		{ value: ESearchType.USERS, label: t('users') },
		{ value: ESearchType.DISCUSSIONS, label: t('discussions') }
	];

	const trackItemsList = useMemo(() => {
		return trackItems.map((item: RefinementItem) => {
			const trackName = item.value;
			const formattedTrackName = parseCamelCase(trackName);

			return {
				...item,
				label: `${formattedTrackName} (${item.count})`
			};
		});
	}, [trackItems]);

	const topicItemsList = useMemo(() => {
		return topicItems.map((item: RefinementItem) => {
			const topicName = Object.entries(POST_TOPIC_MAP).find(([, value]) => value === Number(item.value))?.[0];
			return {
				...item,
				label: `${topicName ? parseCamelCase(topicName) : item.label} (${item.count})`
			};
		});
	}, [topicItems]);

	const tagItemsList = useMemo(() => {
		return tagItems.map((item: RefinementItem) => ({
			...item,
			label: `${item.label} (${item.count})`
		}));
	}, [tagItems]);

	const refinedDateItems = useMemo(() => {
		return dateItems.filter((item) => item.isRefined);
	}, [dateItems]);

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
			<div className='mt-3 flex flex-wrap justify-between gap-6'>
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
						<div className='flex items-center gap-x-2 md:gap-x-4'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>{t('date')}</DropdownMenuTrigger>
								<DropdownMenuContent>
									<div className='space-y-2'>
										{dateItems.map((item) => (
											<button
												key={item.label}
												type='button'
												className={cn(styles.date_filter_label, item.isRefined ? styles.radio_label_active : 'whitespace-nowrap hover:bg-topic_tag_bg')}
												onClick={() => refineDate(item.value)}
											>
												{item.label}
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
													onCheckedChange={() => refineTrack(item.value)}
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
							{topicItemsList.length > 0 && (
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
													onCheckedChange={() => refineTopic(item.value)}
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

							{tagItemsList.length > 0 && (
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
													onCheckedChange={() => refineTag(item.value)}
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
						</div>
					)}
				</div>
			</div>
			<div className='mt-3 flex flex-wrap items-center gap-x-4'>
				{refinedDateItems.length > 0 && (
					<div className='flex items-center gap-x-1 text-xs text-wallet_btn_text'>
						<span className='text-text_pink'>{t('date')}:</span>
						<div className='flex'>
							{refinedDateItems.map((item, index) => (
								<span key={item.value}>
									{index !== 0 ? ', ' : ''}
									{item.label}
								</span>
							))}
						</div>
					</div>
				)}
				{refinedTrackItems?.length > 0 && (
					<div className='flex items-center gap-x-1 text-xs text-wallet_btn_text'>
						<span className='text-text_pink'>{t('tracks')}:</span>
						<div className='flex flex-wrap gap-x-1'>
							{refinedTrackItems.map((item, index) => (
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
							{refinedTopicItems.map((item, index) => (
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
							{refinedTagItems.map((item, index) => (
								<span key={item.value}>
									{index !== 0 ? ', ' : ''}
									{item.label}
								</span>
							))}
						</div>
					</div>
				)}
				<div className='flex-1' />
				{(refinedDateItems?.length > 0 || refinedTrackItems?.length > 0 || refinedTopicItems?.length > 0 || refinedTagItems?.length > 0) && (
					<Button
						variant='ghost'
						className='text-text_pink'
						size='sm'
						onClick={clearRefinements}
					>
						{t('clearFilters')}
					</Button>
				)}
			</div>
		</div>
	);
}
