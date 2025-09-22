// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { CheckSquare, Filter } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { ECommentFilterCondition, ECommentSortBy } from '@/_shared/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../Select/Select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';
import { Button } from '../../Button';

interface CommentsFilterProps {
	sortBy: ECommentSortBy;
	setSortBy: (sortBy: ECommentSortBy) => void;
	activeFilters: ECommentFilterCondition[];
	setActiveFilters: (filters: ECommentFilterCondition[]) => void;
}

function CommentsFilter({ sortBy, setSortBy, activeFilters, setActiveFilters }: Readonly<CommentsFilterProps>) {
	const t = useTranslations();

	// Optimized filter toggle handler
	const toggleFilter = useCallback(
		(filter: ECommentFilterCondition) => {
			setActiveFilters(activeFilters.includes(filter) ? activeFilters.filter((f) => f !== filter) : [...activeFilters, filter]);
		},
		[activeFilters, setActiveFilters]
	);

	// Reset handler
	const handleReset = useCallback(() => {
		setSortBy(ECommentSortBy.newest);
		setActiveFilters([]);
	}, [setSortBy, setActiveFilters]);

	// Filter options configuration
	const filterOptions = useMemo(
		() => [
			{
				condition: ECommentFilterCondition.HIDE_ZERO_BALANCE,
				label: t('PostDetails.CommentsFilter.hideZeroBalance')
			},
			{
				condition: ECommentFilterCondition.VOTERS_ONLY,
				label: t('PostDetails.CommentsFilter.showVotersComments')
			},
			{
				condition: ECommentFilterCondition.DV_DELEGATES_ONLY,
				label: t('PostDetails.CommentsFilter.showDVDelegates')
			},
			{
				condition: ECommentFilterCondition.HIDE_DELETED,
				label: t('PostDetails.CommentsFilter.hideDeletedComments')
			}
		],
		[t]
	);

	return (
		<div className='flex items-center gap-2'>
			<DropdownMenu>
				<DropdownMenuTrigger
					noArrow
					className='flex items-center justify-center rounded-md border border-border_grey px-3 py-1.5 text-sm text-text_pink hover:bg-grey_bg'
				>
					<Filter className='h-4 w-4' />
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align='end'
					className='min-w-[220px] border border-border_grey p-2'
				>
					<div className='flex items-center justify-between'>
						<span className='px-2 text-xs font-semibold uppercase text-basic_text opacity-70'>{t('PostDetails.CommentsFilter.conditions')}</span>
						<Button
							variant='ghost'
							size='sm'
							className='text-xs font-medium text-text_pink'
							onClick={handleReset}
						>
							{t('PostDetails.CommentsFilter.reset')}
						</Button>
					</div>
					<DropdownMenuItem>
						<div className='flex w-full items-center justify-between gap-2 text-sm'>
							<span className='text-sm text-basic_text'>{t('PostDetails.CommentsFilter.sortBy')}</span>
							<Select
								value={sortBy}
								onValueChange={(val) => setSortBy(val as ECommentSortBy)}
							>
								<SelectTrigger className='h-8 w-fit min-w-[82px] px-3 text-sm text-basic_text'>
									<SelectValue placeholder={t('PostDetails.CommentsFilter.newest')} />
								</SelectTrigger>
								<SelectContent className='w-fit border-border_grey text-basic_text'>
									<SelectItem value={ECommentSortBy.newest}>{t('PostDetails.CommentsFilter.newest')}</SelectItem>
									<SelectItem value={ECommentSortBy.oldest}>{t('PostDetails.CommentsFilter.oldest')}</SelectItem>
									<SelectItem value={ECommentSortBy.top}>{t('PostDetails.CommentsFilter.top')}</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</DropdownMenuItem>
					{filterOptions.map(({ condition, label }) => (
						<DropdownMenuItem
							key={condition}
							onClick={() => toggleFilter(condition)}
							className='flex cursor-pointer items-center justify-between text-xs text-basic_text'
						>
							<span>{label}</span>
							<CheckSquare className={`h-4 w-4 ${activeFilters.includes(condition) ? 'text-text_pink' : 'text-accent_blue'}`} />
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export default CommentsFilter;
