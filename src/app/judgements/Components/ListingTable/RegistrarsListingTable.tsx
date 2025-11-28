// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { getRegistrarsWithStats } from '@/app/_client-utils/identityUtils';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '../../../_shared-components/Table';
import styles from './ListingTable.module.scss';

function RegistrarsListingTable() {
	const t = useTranslations('Judgements');
	const network = getCurrentNetwork();
	const { identityService } = useIdentityService();
	const searchParams = useSearchParams();
	const search = searchParams?.get('registrarSearch') || '';

	const { data: allRegistrarsData, isLoading } = useQuery({
		queryKey: ['allRegistrarsData', identityService],
		queryFn: async () => {
			if (!identityService) return { registrars: [], judgements: [] };
			const registrarsData = await identityService.getRegistrars();
			const judgements = await identityService.getAllIdentityJudgements();
			return { registrars: registrarsData, judgements };
		},
		enabled: !!identityService,
		staleTime: 60000
	});

	const registrars = useMemo(() => {
		if (!allRegistrarsData?.registrars) return [];
		return getRegistrarsWithStats({ registrars: allRegistrarsData.registrars, judgements: allRegistrarsData.judgements, search });
	}, [allRegistrarsData, search]);

	if (isLoading || !identityService) {
		return (
			<div className='flex flex-col gap-4 rounded-lg bg-bg_modal p-4'>
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
			</div>
		);
	}

	return (
		<div className='w-full'>
			{registrars && registrars.length > 0 ? (
				<div className='w-full rounded-lg border border-primary_border bg-bg_modal p-6'>
					<Table>
						<TableHeader>
							<TableRow className={styles.tableRow}>
								<TableHead className={styles.tableCell_1}>{t('address')}</TableHead>
								<TableHead className={styles.tableCell}>{t('receivedRequests')}</TableHead>
								<TableHead className={styles.tableCell}>{t('totalGiven')}</TableHead>
								<TableHead className={styles.tableCell_last}>{t('fee')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{registrars.map((registrar) => (
								<TableRow key={registrar.address}>
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
