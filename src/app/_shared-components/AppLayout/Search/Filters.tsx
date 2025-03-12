// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { RefinementList, useInstantSearch } from 'react-instantsearch';
import { Button } from '@ui/Button';
import { RadioGroup, RadioGroupItem } from '@ui/RadioGroup/RadioGroup';
import { Label } from '@ui/Label';

interface FiltersProps {
	activeIndex: 'posts' | 'users' | 'discussions' | null;
	onChange: (index: 'posts' | 'users' | 'discussions' | null) => void;
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

	return (
		<div className='mt-3 flex justify-between gap-6'>
			<div>
				<RadioGroup
					defaultValue={activeIndex ?? undefined}
					onValueChange={(e) => onChange(e as 'posts' | 'users' | 'discussions' | null)}
					className='flex flex-row gap-3'
					disabled={activeIndex === null}
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
									<Button>Post Type</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className='h-[250px] w-full overflow-auto p-3'>
									<RefinementList
										attribute='post_type'
										classNames={{
											list: 'space-y-2',
											label: 'flex items-center gap-2'
										}}
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
