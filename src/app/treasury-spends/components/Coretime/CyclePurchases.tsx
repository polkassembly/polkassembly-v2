// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { EAssets } from '@/_shared/types';
import React from 'react';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useSearchParams } from 'next/navigation';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS, treasuryAssetsData } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Copy } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../_shared-components/Table';
import { PaginationWithLinks } from '../../../_shared-components/PaginationWithLinks';
import styles from './Coretime.module.scss';

function CyclePurchases({ cycleId }: { cycleId: string }) {
	const searchParams = useSearchParams();
	const network = getCurrentNetwork();

	const page = searchParams?.get('page') || 1;
	const totalCount = 2;
	const DATE_FORMAT = "Do MMM '25, HH:mm:ss";

	console.log('cycleId in CyclePurchases:', cycleId);

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
			username: 'alice',
			address: '5F3sa2TJAWMqDhXG6jhV4N8ko9rL5QWQ1Z3f6a5v7v4Y5YbY',
			cost: '1165260000000000',
			assetId: null,
			timestamp: '2025-01-01 12:30:00'
		},
		{
			id: '2',
			parachain: 'Polkadot',
			core: 45,
			startPeriod: '2025-01-01',
			endPeriod: '2025-06-30',
			renewal: 'No',
			username: 'bob',
			address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
			utilization: '70%',
			cost: '271786000000',
			assetId: null,
			timestamp: '2025-01-01 12:00:00'
		}
	];

	return (
		<div className='flex flex-col gap-y-4'>
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
								<TableHead className={styles.headerCell}>CORE</TableHead>
								<TableHead className={styles.headerCell}>PURCHASED BY</TableHead>
								<TableHead className={styles.headerCell}>TIMESTAMP</TableHead>
								<TableHead className={styles.headerCell}>PRICE</TableHead>
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
											<TableCell className='px-6 py-3'>{allocation.core}</TableCell>
											<TableCell className='px-6 py-3'>
												<div className='flex items-center gap-1'>
													<span className='text-xs text-basic_text'>
														<Address
															iconSize={24}
															address={allocation.address}
														/>
													</span>
													<span className='text-xs text-basic_text'>
														({allocation.address.slice(0, 6)}...{allocation.address.slice(-5)})
													</span>
													<button
														type='button'
														className='text-basic_text hover:text-text_primary'
														title='Copy address'
														onClick={() => navigator.clipboard.writeText(allocation.address)}
													>
														<Copy size={14} />
													</button>
												</div>
											</TableCell>
											<TableCell className='px-6 py-3'>
												<div className='flex flex-col gap-1'>{dayjs(allocation.timestamp).format(DATE_FORMAT)}</div>
											</TableCell>
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
					<h1 className='text-center text-2xl font-bold text-text_primary'>No purchases found.</h1>
				</div>
			)}
		</div>
	);
}

export default CyclePurchases;
