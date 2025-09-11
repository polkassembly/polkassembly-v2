// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { CheckSquare, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../Select/Select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';
import { Button } from '../../Button';

function CommentsFilter({
	sortBy,
	setSortBy,
	filterBy,
	setFilterBy
}: Readonly<{
	sortBy: 'newest' | 'oldest' | 'top';
	setSortBy: (sortBy: 'newest' | 'oldest' | 'top') => void;
	filterBy: 'hide_zero_balance' | 'voters_only' | 'dv_delegates_only' | 'hide_deleted';
	setFilterBy: (filterBy: 'hide_zero_balance' | 'voters_only' | 'dv_delegates_only' | 'hide_deleted') => void;
}>) {
	const t = useTranslations();

	const CHECK_ICON_BASE = 'h-4 w-4';
	const CHECK_ICON_ACTIVE = 'text-text_pink';
	const CHECK_ICON_INACTIVE = 'text-accent_blue';

	return (
		<div className='flex items-center gap-2'>
			<DropdownMenu>
				<DropdownMenuTrigger
					noArrow
					className='flex items-center gap-x-2 rounded-md border border-border_grey px-3 py-1.5 text-sm text-text_pink hover:bg-grey_bg'
				>
					{t('PostDetails.CommentsFilter.filter')}
					<Filter className='h-4 w-4' />
				</DropdownMenuTrigger>
				<DropdownMenuContent className='min-w-[220px] border border-border_grey p-2'>
					<div className='flex items-center justify-between'>
						<span className='px-2 text-xs font-semibold uppercase text-basic_text opacity-70'>{t('PostDetails.CommentsFilter.conditions')}</span>
						<Button
							variant='ghost'
							size='sm'
							className='text-xs font-medium text-text_pink'
							onClick={() => {
								setSortBy('newest');
								setFilterBy('hide_zero_balance');
							}}
						>
							{t('PostDetails.CommentsFilter.reset')}
						</Button>
					</div>
					<DropdownMenuItem>
						<div className='flex w-full items-center justify-between gap-2 text-sm'>
							<span className='text-sm text-basic_text'>{t('PostDetails.CommentsFilter.sortBy')}</span>
							<Select
								value={sortBy}
								onValueChange={(val) => setSortBy(val as typeof sortBy)}
							>
								<SelectTrigger className='h-8 w-fit min-w-[82px] px-3 text-sm text-basic_text'>
									<SelectValue placeholder={t('PostDetails.CommentsFilter.newest')} />
								</SelectTrigger>
								<SelectContent className='w-fit border-border_grey text-basic_text'>
									<SelectItem value='newest'>{t('PostDetails.CommentsFilter.newest')}</SelectItem>
									<SelectItem value='oldest'>{t('PostDetails.CommentsFilter.oldest')}</SelectItem>
									<SelectItem value='top'>{t('PostDetails.CommentsFilter.top')}</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setFilterBy('hide_zero_balance')}
						className='flex cursor-pointer items-center justify-between text-xs text-basic_text'
					>
						<span>Hide 0 Balance Accounts</span>
						<CheckSquare className={`${CHECK_ICON_BASE} ${filterBy === 'hide_zero_balance' ? CHECK_ICON_ACTIVE : CHECK_ICON_INACTIVE}`} />
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => setFilterBy('voters_only')}
						className='flex cursor-pointer items-center justify-between text-xs text-basic_text'
					>
						<span>Show Voter&apos;s Comments Only</span>
						<CheckSquare className={`${CHECK_ICON_BASE} ${filterBy === 'voters_only' ? CHECK_ICON_ACTIVE : CHECK_ICON_INACTIVE}`} />
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => setFilterBy('dv_delegates_only')}
						className='flex cursor-pointer items-center justify-between text-xs text-basic_text'
					>
						<span>Show DV delegates Only</span>
						<CheckSquare className={`${CHECK_ICON_BASE} ${filterBy === 'dv_delegates_only' ? CHECK_ICON_ACTIVE : CHECK_ICON_INACTIVE}`} />
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setFilterBy('hide_deleted')}
						className='flex cursor-pointer items-center justify-between text-xs text-basic_text'
					>
						<span>Hide (deleted) Comments</span>
						<CheckSquare className={`${CHECK_ICON_BASE} ${filterBy === 'hide_deleted' ? CHECK_ICON_ACTIVE : CHECK_ICON_INACTIVE}`} />
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export default CommentsFilter;
