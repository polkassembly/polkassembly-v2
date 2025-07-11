// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { IRegistrarInfo } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '../../../_shared-components/Table';
import styles from './ListingTable.module.scss';
import Address from '../../../_shared-components/Profile/Address/Address';

function RegistrarsListingTable({ data }: { data: IRegistrarInfo[] }) {
	const t = useTranslations('Judgements');
	const network = getCurrentNetwork();

	return (
		<div className='w-full'>
			{data && data.length > 0 ? (
				<div className='w-full rounded-lg border border-primary_border bg-bg_modal p-6'>
					<Table>
						<TableHeader>
							<TableRow className={styles.tableRow}>
								<TableHead className={styles.tableCell_1}>{t('address')}</TableHead>
								<TableHead className={styles.tableCell}>{t('latestJudgement')}</TableHead>
								<TableHead className={styles.tableCell}>{t('receivedRequests')}</TableHead>
								<TableHead className={styles.tableCell}>{t('totalGiven')}</TableHead>
								<TableHead className={styles.tableCell_last}>{t('fee')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.map((registrar: IRegistrarInfo) => (
								<TableRow key={registrar.address}>
									<td className='px-6 py-5'>
										<Address
											truncateCharLen={5}
											address={registrar.address}
										/>
									</td>
									<td className='px-6 py-5'>{registrar.latestJudgementDate ? new Date(registrar.latestJudgementDate).toLocaleDateString() : '-'}</td>
									<td className='px-6 py-5'>{registrar.totalReceivedRequests}</td>
									<td className='px-6 py-5'>{registrar.totalJudgementsGiven}</td>
									<td className='px-6 py-5'>
										{formatBnBalance(
											registrar.registrarFee,
											{
												withUnit: true,
												numberAfterComma: 2,
												compactNotation: true
											},
											network
										)}
									</td>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			) : (
				<div className='flex items-center justify-center'>
					<h1 className='text-center text-2xl font-bold'>{t('noRegistrarsFound')}</h1>
				</div>
			)}
		</div>
	);
}

export default RegistrarsListingTable;
