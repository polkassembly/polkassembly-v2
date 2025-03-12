// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useCallback, useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { RefinementList, useInstantSearch } from 'react-instantsearch';
import { Button } from '@ui/Button';
import { RadioGroup, RadioGroupItem } from '@ui/RadioGroup/RadioGroup';
import { POST_TOPIC_MAP } from './SearchResults';

interface FiltersProps {
	activeIndex: 'posts' | 'users' | 'discussions' | null;
	onChange: (index: 'posts' | 'users' | 'discussions' | null) => void;
}

interface RefinementItem {
	value: string;
	label: string;
	count: number;
	isRefined: boolean;
}

const options = [
	{ value: 'posts', label: 'Referenda' },
	{ value: 'users', label: 'Users' },
	{ value: 'discussions', label: 'Discussions' }
];

export default function Filters({ activeIndex, onChange }: FiltersProps) {
	const { results } = useInstantSearch();

	useEffect(() => {
		if (results.query.length > 3 && activeIndex === null) {
			onChange('posts');
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
				label: topicName ? topicName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : item.label
			};
		});
	}, []);
	return (
		<div className='mt-3 flex justify-between gap-6'>
			<div>
				<RadioGroup
					value={activeIndex || (results.query.length > 3 ? 'posts' : undefined)}
					onValueChange={(e) => onChange(e as 'posts' | 'users' | 'discussions' | null)}
					className='flex flex-row gap-3'
					disabled={results.query.length < 3}
				>
					{options.map((option) => {
						return (
							<label
								key={option.value}
								htmlFor={option.value}
								className='flex cursor-pointer flex-row items-center gap-1'
							>
								<RadioGroupItem
									value={option.value}
									id={option.value}
									className='h-4 w-4'
								/>
								<span className='text-sm text-text_primary'>{option.label}</span>
							</label>
						);
					})}
				</RadioGroup>
			</div>
			<div className='flex gap-2'>
				{activeIndex === 'posts' && (
					<>
						<div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button>Topics</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className='h-[250px] w-full overflow-auto p-3'>
									<RefinementList
										attribute='topic_id'
										classNames={{
											list: 'space-y-2',
											label: 'flex items-center gap-2'
										}}
										transformItems={transformTopicItems}
										limit={15}
										showMore={false}
									/>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						{/* <div>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button>Networks</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent className='h-[250px] w-full overflow-auto p-3'>
												<RefinementList
													attribute='network'
													classNames={{
														list: 'space-y-2',
														label: 'flex items-center gap-2'
													}}
												/>
											</DropdownMenuContent>
										</DropdownMenu>
									</div> */}

						<div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button>Tags</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className='h-[250px] w-full overflow-auto p-3'>
									<RefinementList
										attribute='tags'
										classNames={{
											list: 'space-y-2',
											label: 'flex items-center gap-2'
										}}
									/>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
