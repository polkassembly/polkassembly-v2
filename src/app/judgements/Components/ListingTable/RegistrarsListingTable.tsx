// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getRegistrarsWithStats } from '@/app/_client-utils/identityUtils';
import { useSearchParams } from 'next/navigation';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { IJudgementRequest } from '@/_shared/types';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '../../../_shared-components/Table';
import styles from './ListingTable.module.scss';

interface IRegistrar {
	account: string;
	fee: number;
	fields: number;
}

interface IRegistrarsListingTableProps {
	allRegistrarsData:
		| {
				registrars: IRegistrar[];
				judgements: IJudgementRequest[];
		  }
		| undefined;
}

function RegistrarsListingTable({ allRegistrarsData }: IRegistrarsListingTableProps) {
	const t = useTranslations('Judgements');
	const network = getCurrentNetwork();
	const searchParams = useSearchParams();
	const search = searchParams?.get('registrarSearch') || '';

	const registrars = useMemo(() => {
		if (!allRegistrarsData?.registrars) return [];
		return getRegistrarsWithStats({ registrars: allRegistrarsData.registrars, judgements: allRegistrarsData.judgements, search }).sort(
			(a, b) => b.totalReceivedRequests - a.totalReceivedRequests
		);
	}, [allRegistrarsData, search]);

	return (
		<div className='w-full'>
			{registrars && registrars.length > 0 ? (
				<div className='w-full rounded-3xl border border-primary_border bg-bg_modal p-6'>
					<Table>
						<TableHeader>
							<TableRow className={styles.headerRow}>
								<TableHead className={styles.headerCell}>{t('rank')}</TableHead>
								<TableHead className={styles.headerCell}>{t('registrar')}</TableHead>
								<TableHead className={styles.headerCell}>{t('receivedRequests')}</TableHead>
								<TableHead className={styles.headerCell}>{t('judgementsGranted')}</TableHead>
								<TableHead className={styles.headerCell}>{t('fees')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{registrars.map((registrar, index) => (
								<TableRow key={registrar.address}>
									<td className='px-6 py-5'>{index + 1}</td>
									<td className='px-6 py-5'>
										<Address
											truncateCharLen={5}
											address={registrar.address}
										/>
									</td>
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
