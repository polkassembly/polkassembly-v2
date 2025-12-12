// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Separator } from '@/app/_shared-components/Separator';
import Image from 'next/image';
import ExpandIcon from '@assets/icons/expand.svg';
import { cn } from '@/lib/utils';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';
import TimeLineIcon from '@assets/icons/timeline.svg';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { ETheme, EAssets, ETreasurySpendsTabs } from '@/_shared/types';
import React, { useState } from 'react';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../_shared-components/Table';
import { PaginationWithLinks } from '../../../_shared-components/PaginationWithLinks';
import styles from './Coretime.module.scss';
import CycleSummary from './CycleSummary';
import { coretimeCyclesMock, CoretimeCycle } from './mockCycles';

function CoretimeCycles() {
	const { userPreferences } = useUserPreferences();
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const network = getCurrentNetwork();
	const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

	const page = searchParams?.get('page') || 1;
	const t = useTranslations('TreasuryAnalytics');
	const DATE_FORMAT = "Do MMM 'YY";

	const toggleExpand = (address: string) => {
		const newExpanded = new Set(expandedRows);
		if (newExpanded.has(address)) {
			newExpanded.delete(address);
		} else {
			newExpanded.add(address);
		}
		setExpandedRows(newExpanded);
	};

	const goToCoretimeDetail = (cycleId: string) => {
		const queryParams = new URLSearchParams(searchParams?.toString());
		queryParams.set('tab', ETreasurySpendsTabs.CYCLE_DETAIL);
		queryParams.set('cycleId', cycleId);
		router.push(`${pathname}?${queryParams.toString()}`);
	};

	const loading = false; // Replace with actual loading state

	// Mock data - replace with actual data fetching logic
	const data: CoretimeCycle[] = coretimeCyclesMock;
	const totalCount = data.length;

	return (
		<Collapsible
			defaultOpen
			className='rounded-lg border border-border_grey bg-bg_modal'
		>
			<CollapsibleTrigger className='group flex w-full items-center gap-x-4 p-3 lg:p-4'>
				<Image
					src={TimeLineIcon}
					alt='Timeline Icon'
					width={24}
					height={24}
					className='h-6 w-6'
				/>
				<p className='text-base font-semibold text-text_primary'>Coretime Cycles</p>
				<div className='flex-1' />
				<Image
					src={ExpandIcon}
					alt=''
					aria-hidden
					width={16}
					height={16}
					className={cn(userPreferences?.theme === ETheme.DARK ? 'darkIcon' : '', 'transition-transform duration-200 group-data-[state=open]:rotate-180')}
				/>
			</CollapsibleTrigger>
			<CollapsibleContent>
				{loading && <Separator className='my-0' />}
				<div className='flex flex-col gap-y-4 p-3 pt-2 lg:p-4 lg:pt-2'>
					{loading ? (
						<>
							<Skeleton className='h-8 w-full' />
							<Skeleton className='h-8 w-full' />
							<Skeleton className='h-8 w-full' />
						</>
					) : data && data.length > 0 ? (
						<>
							<Table>
								<TableHeader>
									<TableRow className={`${styles.headerRow} border-t border-border_grey uppercase`}>
										<TableHead className={styles.headerCell}>ID</TableHead>
										<TableHead className={styles.headerCell}>REGION BEGIN</TableHead>
										<TableHead className={styles.headerCell}>REGION END</TableHead>
										<TableHead className={styles.headerCell}>TIME RANGE</TableHead>
										<TableHead className={styles.headerCell}>TOTAL REVENUE</TableHead>
										<TableHead />
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.map((cycle) => {
										const unit = NETWORKS_DETAILS[`${network}`]?.supportedAssets?.[`${cycle.assetId}`]?.symbol || NETWORKS_DETAILS[`${network}`]?.tokenSymbol || cycle.assetId;
										const icon = treasuryAssetsData[unit as EAssets]?.icon || NETWORKS_DETAILS[`${network}`].logo;
										return (
											<React.Fragment key={cycle?.id}>
												<TableRow>
													<td className='py-5 pl-4 pr-6'>
														<div className='flex items-center'>{cycle.id}</div>
													</td>
													<td className='px-6 py-5'>{cycle.regionBegin}</td>
													<td className='px-6 py-5'>{cycle.regionEnd}</td>
													<td className='px-6 py-5'>{`${dayjs(cycle.startPeriod).format(DATE_FORMAT)} - ${dayjs(cycle.endPeriod).format(DATE_FORMAT)}`}</td>
													<td className='px-6 py-5'>
														<div className='flex items-center gap-1'>
															<Image
																src={icon}
																alt={unit || ''}
																width={20}
																height={20}
																className='rounded-full'
															/>
															{formatBnBalance(
																cycle.totalRevenue.toString(),
																{ withUnit: true, numberAfterComma: 2, compactNotation: true },
																network,
																cycle.assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : cycle.assetId
															)}
														</div>
													</td>
													<td className='p-4'>
														<div className='flex items-center gap-2'>
															<button
																type='button'
																onClick={() => toggleExpand(cycle.id)}
																className='text-basic_text hover:text-text_primary'
															>
																{expandedRows.has(cycle.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
															</button>
														</div>
													</td>
												</TableRow>
												{expandedRows.has(cycle.id) && (
													<TableRow className='bg-page_background'>
														<TableCell
															className='p-0 py-3'
															colSpan={6}
														>
															<CycleSummary cycle={cycle} />
															<Separator className='mx-auto my-3 max-w-[98%]' />
															<button
																type='button'
																onClick={() => goToCoretimeDetail(cycle.id)}
																className='mx-auto flex items-center justify-center font-medium text-text_pink'
															>
																View Detail
															</button>
														</TableCell>
													</TableRow>
												)}
											</React.Fragment>
										);
									})}
								</TableBody>
							</Table>
							{totalCount && totalCount > DEFAULT_LISTING_LIMIT && (
								<div className='mt-5 flex w-full justify-end'>
									<PaginationWithLinks
										page={Number(page)}
										pageSize={DEFAULT_LISTING_LIMIT}
										totalCount={totalCount}
										pageSearchParam='page'
									/>
								</div>
							)}
						</>
					) : (
						<div className='flex w-full items-center justify-center rounded-lg border border-primary_border bg-bg_modal p-6 py-12'>
							<h1 className='text-center text-2xl font-bold text-text_primary'>{t('noProxiesFound')}</h1>
						</div>
					)}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default CoretimeCycles;
