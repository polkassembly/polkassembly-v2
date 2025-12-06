// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';
'use client';

import { useTranslations } from 'next-intl';
import { CheckSquare } from 'lucide-react';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { MdSort } from '@react-icons/all-files/md/MdSort';
import { useCallback, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_shared-components/Select/Select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/_shared-components/DropdownMenu';
import { Button } from '@/app/_shared-components/Button';

enum ESpendsSortBy {
	oldest = 'oldest',
	latest = 'latest',
	amountASC = 'amount_ASC',
	amountDESC = 'amount_DESC',
	timestampASC = 'timestamp_ASC',
	timestampDESC = 'timestamp_DESC'
}

function SpendsFilter() {
	const t = useTranslations();
	const [sortBy, setSortBy] = useState<ESpendsSortBy>(ESpendsSortBy.latest);
	const [activeFilters, setActiveFilters] = useState<string[]>(['tracks']);

	// Optimized filter toggle handler
	const toggleFilter = useCallback(
		(filter: string) => {
			setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
		},
		[setActiveFilters]
	);

	// Filter options configuration
	const filterOptions = useMemo(
		() => [
			{
				condition: 'categories',
				label: 'Categories'
			},
			{
				condition: 'tracks',
				label: 'Tracks'
			}
		],
		[]
	);

	return (
		<div className='flex items-center gap-2'>
			<DropdownMenu>
				<DropdownMenuTrigger
					noArrow
					className='flex !size-9 items-center justify-center rounded-md border border-border_grey p-2 text-sm text-text_pink hover:bg-grey_bg'
				>
					<FaFilter className='text-base text-basic_text' />
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align='end'
					className='min-w-[220px] border border-border_grey p-2'
				>
					<div className='flex items-center justify-between'>
						<span className='px-2 text-xs font-semibold uppercase text-basic_text opacity-70'>{t('TreasuryAnalytics.spendsFilter.conditions')}</span>
						<Button
							variant='ghost'
							size='sm'
							className='text-xs font-medium text-text_pink'
							// onClick={handleReset}
						>
							{t('TreasuryAnalytics.spendsFilter.reset')}
						</Button>
					</div>
					<DropdownMenuItem>
						<div className='flex w-full items-center justify-between gap-2 text-sm'>
							<span className='text-sm text-basic_text'>{t('TreasuryAnalytics.spendsFilter.sortBy')}</span>
							<Select
								value={sortBy}
								onValueChange={(val) => setSortBy(val as ESpendsSortBy)}
							>
								<SelectTrigger className='h-8 w-fit min-w-[82px] px-3 text-sm text-basic_text'>
									<SelectValue placeholder={t('TreasuryAnalytics.spendsFilter.latest')} />
								</SelectTrigger>
								<SelectContent className='w-fit border-border_grey text-basic_text'>
									<SelectItem value={ESpendsSortBy.latest}>{t('TreasuryAnalytics.spendsFilter.latest')}</SelectItem>
									<SelectItem value={ESpendsSortBy.oldest}>{t('TreasuryAnalytics.spendsFilter.oldest')}</SelectItem>
									<SelectItem value={ESpendsSortBy.amountASC}>{t('TreasuryAnalytics.spendsFilter.amountASC')}</SelectItem>
									<SelectItem value={ESpendsSortBy.amountDESC}>{t('TreasuryAnalytics.spendsFilter.amountDESC')}</SelectItem>
									<SelectItem value={ESpendsSortBy.timestampASC}>{t('TreasuryAnalytics.spendsFilter.timestampASC')}</SelectItem>
									<SelectItem value={ESpendsSortBy.timestampDESC}>{t('TreasuryAnalytics.spendsFilter.timestampDESC')}</SelectItem>
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
			<button
				type='button'
				className='bg-bg_card !size-9 rounded-md border border-primary_border p-1.5 hover:text-text_primary'
				title='Menu'
			>
				<MdSort className='text-2xl text-basic_text' />
			</button>
		</div>
	);
}

export default SpendsFilter;
