// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { EStatusTagType, IJudgementRequest } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '../../../_shared-components/Table';
import { PaginationWithLinks } from '../../../_shared-components/PaginationWithLinks';
import StatusTag from '../../../_shared-components/StatusTag/StatusTag';
import styles from './ListingTable.module.scss';
// TODO: Create JudgementRequestRow component

function JudgementListingTable({ data, totalCount }: { data: IJudgementRequest[]; totalCount: number }) {
	const searchParams = useSearchParams();
	const page = searchParams?.get('page') || 1;
	const t = useTranslations('Judgements');

	return (
		<div className='w-full'>
			{data && data.length > 0 ? (
				<>
					<div className='w-full rounded-lg border border-primary_border bg-bg_modal p-6'>
						<Table>
							<TableHeader>
								<TableRow className={styles.tableRow}>
									<TableHead className={styles.tableCell_1}>{t('index')}</TableHead>
									<TableHead className={styles.tableCell_2}>{t('address')}</TableHead>
									<TableHead className={styles.tableCell}>{t('displayName')}</TableHead>
									<TableHead className={styles.tableCell}>{t('email')}</TableHead>
									<TableHead className={styles.tableCell}>{t('twitter')}</TableHead>
									<TableHead className={styles.tableCell}>{t('status')}</TableHead>
									<TableHead className={styles.tableCell_last}>{t('initiatedOn')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((judgement: IJudgementRequest, index: number) => (
									<TableRow key={judgement?.id}>
										<td className={styles.table_content_cell}>{index + 1}</td>
										<td className='px-6 py-5'>
											<Address
												truncateCharLen={5}
												address={judgement.address}
											/>
										</td>
										<td className='max-w-48 px-6 py-5'>
											<div className='truncate'>{judgement.displayName || '-'}</div>
										</td>
										<td className='max-w-48 px-6 py-5'>
											<div className='truncate'>{judgement.email || '-'}</div>
										</td>
										<td className='max-w-48 px-6 py-5'>
											<div className='truncate'>{judgement.twitter || '-'}</div>
										</td>
										<td className='px-6 py-5'>
											<StatusTag
												status={judgement.status}
												type={EStatusTagType.JUDGEMENT}
											/>
										</td>
										<td className='px-6 py-5'>{new Date(judgement.dateInitiated).toLocaleDateString()}</td>
									</TableRow>
								))}
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
				<div className='flex items-center justify-center'>
					<h1 className='text-center text-2xl font-bold'>{t('noJudgementsFound')}</h1>
				</div>
			)}
		</div>
	);
}

export default JudgementListingTable;
