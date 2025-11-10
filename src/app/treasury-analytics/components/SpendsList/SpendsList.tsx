// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../_shared-components/Table';
import { PaginationWithLinks } from '../../../_shared-components/PaginationWithLinks';
import { LoadingSpinner } from '../../../_shared-components/LoadingSpinner';
import styles from './SpendsList.module.scss';

function ProxyListingTable() {
	const searchParams = useSearchParams();
	const network = getCurrentNetwork();

	const page = searchParams?.get('page') || 1;
	const t = useTranslations('TreasuryAnalytics');
	const totalCount = 2;
	const DATE_FORMAT = "Do MMM 'YY, hh:mm:ss";

	const isLoading = false;

	if (isLoading) {
		return (
			<div className='flex w-full items-center justify-center rounded-lg border border-primary_border bg-bg_modal p-6 py-12'>
				<LoadingSpinner
					size='large'
					message='Loading...'
				/>
			</div>
		);
	}

	const data = [
		{
			id: '45',
			title: 'Standard Guidelines for Kusama',
			proposer: '5CQBRJGDuzgRFLkMVhapZ4HVag5U2EcXuC2Wi1pgeNMxGFDT',
			category: 'Technical',
			track: 'Medium Spender',
			assetId: '1984',
			amount: '271786000000',
			status: 'Approved',
			timestamp: '2025-01-01 12:45:00'
		},
		{
			id: '46',
			title: 'Nominating Pools for Kusama',
			proposer: '5CQBRJGDuzgRFLkMVhapZ4HVag5U2EcXuC2Wi1pgeNMxGFDT',
			category: 'Governance',
			track: 'Governance',
			amount: '1165260000000000',
			status: 'Pending',
			assetId: null,
			timestamp: '2025-01-01 12:00:00'
		}
	];

	return (
		<div className='w-full'>
			{data && data.length > 0 ? (
				<>
					<div className='w-full rounded-lg border border-primary_border bg-bg_modal p-6'>
						<Table>
							<TableHeader>
								<TableRow className={`${styles.tableRow} border-t border-border_grey uppercase`}>
									<TableHead className={styles.tableCell_2}>{t('title')}</TableHead>
									<TableHead className={styles.tableCell}>{t('proposer')}</TableHead>
									<TableHead className={styles.tableCell}>{t('category')}</TableHead>
									<TableHead className={styles.tableCell_last}>{t('track')}</TableHead>
									<TableHead className={styles.tableCell_last}>{t('amount')}</TableHead>
									<TableHead className={styles.tableCell_last}>{t('status')}</TableHead>
									<TableHead className={styles.tableCell_last}>{t('timestamp')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((spend) => {
									return (
										<React.Fragment key={spend?.id}>
											<TableRow>
												<TableCell className='max-w-[300px] truncate py-5'>
													<div className='flex items-center'>
														#{spend.id} {spend.title}
													</div>
												</TableCell>
												<TableCell className='truncate py-5'>
													<Address
														address={spend.proposer}
														truncateCharLen={5}
													/>
												</TableCell>
												<TableCell className='px-3 py-5'>{spend.category}</TableCell>
												<TableCell className='px-3 py-5'>{spend.track}</TableCell>
												<TableCell className='px-3 py-5'>
													{formatBnBalance(
														spend.amount.toString(),
														{ withUnit: true, numberAfterComma: 2, compactNotation: true },
														network,
														spend.assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : spend.assetId
													)}
												</TableCell>
												<TableCell className='px-3 py-5'>{spend.status}</TableCell>
												<TableCell className='px-3 py-5'>{dayjs(spend.timestamp).format(DATE_FORMAT)}</TableCell>
											</TableRow>
										</React.Fragment>
									);
								})}
							</TableBody>
						</Table>
					</div>
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
	);
}

export default ProxyListingTable;
