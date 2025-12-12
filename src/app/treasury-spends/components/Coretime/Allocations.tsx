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
import { EAssets, ETheme } from '@/_shared/types';
import React from 'react';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../_shared-components/Table';
import { PaginationWithLinks } from '../../../_shared-components/PaginationWithLinks';
import styles from './Coretime.module.scss';

function CoretimeAllocations() {
	const { userPreferences } = useUserPreferences();
	const searchParams = useSearchParams();
	const network = getCurrentNetwork();

	const page = searchParams?.get('page') || 1;
	const t = useTranslations('TreasuryAnalytics');
	const totalCount = 2;
	const DATE_FORMAT = 'MMM D';

	const loading = false; // Replace with actual loading state

	// Mock data - replace with actual data fetching logic

	const data = [
		{
			id: '1',
			parachain: 'Kusama',
			core: 23,
			startPeriod: '2025-01-01',
			endPeriod: '2025-06-30',
			renewal: 'Yes',
			utilization: '85%',
			cost: '1165260000000000',
			assetId: null,
			timestamp: '2025-01-01 12:00:00'
		},
		{
			id: '2',
			parachain: 'Polkadot',
			core: 45,
			startPeriod: '2025-01-01',
			endPeriod: '2025-06-30',
			renewal: 'No',
			utilization: '70%',
			cost: '271786000000',
			assetId: null,
			timestamp: '2025-01-01 12:00:00'
		}
	];

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
				<p className='text-base font-semibold text-text_primary'>Allocations</p>
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
										<TableHead className={styles.headerCell}>PARA ID</TableHead>
										<TableHead className={styles.headerCell}>PARACHAIN</TableHead>
										<TableHead className={styles.headerCell}>CORE</TableHead>
										<TableHead className={styles.headerCell}>PERIOD</TableHead>
										<TableHead className={styles.headerCell}>RENEWAL</TableHead>
										<TableHead className={styles.headerCell}>UTILIZATION</TableHead>
										<TableHead className={styles.headerCell}>COST</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.map((allocation) => {
										const unit =
											NETWORKS_DETAILS[`${network}`]?.supportedAssets?.[`${allocation.assetId}`]?.symbol || NETWORKS_DETAILS[`${network}`]?.tokenSymbol || allocation.assetId;
										const icon = treasuryAssetsData[unit as EAssets]?.icon || NETWORKS_DETAILS[`${network}`].logo;
										return (
											<React.Fragment key={allocation?.id}>
												<TableRow>
													<TableCell className='py-3 pl-4 pr-6'>
														<div className='flex items-center'>{allocation.id}</div>
													</TableCell>
													<TableCell className='px-6 py-3'>{allocation.parachain}</TableCell>
													<TableCell className='px-6 py-3'>Core #{allocation.core}</TableCell>
													<TableCell className='px-6 py-3'>
														<div className='flex flex-col gap-1'>
															{dayjs(allocation.startPeriod).format(DATE_FORMAT)} - {dayjs(allocation.endPeriod).format(DATE_FORMAT)}
															<span className='text-xs'>{dayjs(allocation.endPeriod).diff(dayjs(allocation.startPeriod), 'days')} days</span>
														</div>
													</TableCell>
													<TableCell className='px-6 py-3'>{allocation.renewal}</TableCell>
													<TableCell className='px-6 py-3'>{allocation.utilization}</TableCell>
													<TableCell className='px-6 py-3'>
														<div className='flex items-center gap-1'>
															<Image
																src={icon}
																alt={unit || ''}
																width={20}
																height={20}
																className='rounded-full'
															/>
															{formatBnBalance(
																allocation.cost.toString(),
																{ withUnit: true, numberAfterComma: 2, compactNotation: true },
																network,
																allocation.assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : allocation.assetId
															)}
														</div>
													</TableCell>
												</TableRow>
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

export default CoretimeAllocations;
