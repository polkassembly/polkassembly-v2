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

type DropdownType = 'networks' | 'date' | 'topics' | 'tags' | null;

const LABELSTYLE = 'flex items-center gap-1 text-xs text-text_primary';
export default function Filters({ activeIndex, onChange, isSuperSearch = false }: FiltersProps) {
	const { results } = useInstantSearch();
	const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

	useMemo(() => {
		if (results.query.length > 2 && activeIndex === null) {
			onChange(ESearchType.POSTS);
		}
		if (results.query.length === 0 && activeIndex !== null) {
			onChange(null);
		}
	}, [results.query.length, activeIndex, onChange]);

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

	const transformDateItems = useCallback((items: RefinementItem[]) => {
		const now = dayjs.utc();

		const timeRanges = [
			{
				label: 'Today',
				value: now.subtract(1, 'day').unix(),
				operator: '>='
			},
			{
				label: 'Last 7 days',
				value: now.subtract(7, 'days').unix(),
				operator: '>='
			},
			{
				label: 'Last 30 days',
				value: now.subtract(30, 'days').unix(),
				operator: '>='
			},
			{
				label: 'Last 3 months',
				value: now.subtract(3, 'months').unix(),
				operator: '>='
			},
			{
				label: 'All time',
				value: 0,
				operator: '>='
			}
		];

		return timeRanges.map((range) => {
			const itemsInRange = items.filter((item) => {
				const itemDate = dayjs.utc(Number(item.value) * 1000);
				return itemDate.isAfter(dayjs.utc(range.value * 1000));
			});

			const count = itemsInRange.reduce((sum, item) => sum + item.count, 0);

			return {
				value: range.value.toString(),
				label: range.label,
				count,
				isRefined: false
			};
		});
	}, []);

	const handleDropdownOpen = (dropdown: DropdownType) => {
		setOpenDropdown(dropdown);
	};

	return (
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
									<Configure filters={allowedNetwork.map((network) => `network:${network}`).join(' OR ')} />
									<RefinementList
										attribute='network'
										classNames={{
											list: 'space-y-2',
											label: LABELSTYLE,
											labelText: LABELSTYLE,
											count: 'hidden'
										}}
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
									Date <IoIosArrowDown />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className='max-h-[250px] w-full overflow-auto p-3'>
								<RefinementList
									attribute='created_at'
									classNames={{
										list: 'space-y-2',
										label: LABELSTYLE,
										labelText: LABELSTYLE,
										count: 'hidden'
									}}
									transformItems={transformDateItems}
									sortBy={['count:desc']}
								/>
							</DropdownMenuContent>
						</DropdownMenu>

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
									attribute='topic_id'
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
	);
}
