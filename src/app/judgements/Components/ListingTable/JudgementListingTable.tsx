// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IJudgementRequest } from '@/_shared/types';
import { useMemo } from 'react';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { getJudgementRequests } from '@/app/_client-utils/identityUtils';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '../../../_shared-components/Table';
import { PaginationWithLinks } from '../../../_shared-components/PaginationWithLinks';
import JudgementStatusTag from '../../../_shared-components/JudgementStatusTag/JudgementStatusTag';
import styles from './ListingTable.module.scss';

function JudgementListingTable() {
	const searchParams = useSearchParams();
	const page = Number(searchParams?.get('page')) || 1;
	const search = searchParams?.get('dashboardSearch') || '';
	const t = useTranslations('Judgements');
	const { identityService } = useIdentityService();

	const { data: allJudgements, isLoading } = useQuery({
		queryKey: ['allJudgementRequests', identityService],
		queryFn: async () => {
			if (!identityService) return [];
			return identityService.getAllIdentityJudgements();
		},
		enabled: !!identityService,
		staleTime: 60000
	});

	const data = useMemo(() => {
		if (!allJudgements) return { items: [], totalCount: 0 };
		return getJudgementRequests({ allJudgements, page, limit: DEFAULT_LISTING_LIMIT, search });
	}, [allJudgements, page, search]);

	const judgementData = data?.items || [];
	const totalCount = data?.totalCount || 0;

	if (isLoading || !identityService) {
		return (
			<div className='flex flex-col gap-4 rounded-3xl border border-primary_border bg-bg_modal p-4'>
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
			</div>
		);
	}

	return (
		<div className='w-full'>
			{judgementData && judgementData.length > 0 ? (
				<>
					<div className='w-full rounded-3xl border border-primary_border bg-bg_modal p-6'>
						<Table>
							<TableHeader>
								<TableRow className={styles.tableRow}>
									<TableHead className={styles.tableCell_1}>{t('index')}</TableHead>
									<TableHead className={styles.tableCell_2}>{t('address')}</TableHead>
									<TableHead className={styles.tableCell}>{t('displayName')}</TableHead>
									<TableHead className={styles.tableCell}>{t('email')}</TableHead>
									<TableHead className={styles.tableCell}>{t('twitter')}</TableHead>
									<TableHead className={styles.tableCell}>{t('status')}</TableHead>
									<TableHead className={styles.tableCell_last}>{t('registrar')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{judgementData.map((judgement: IJudgementRequest, index: number) => (
									<TableRow key={judgement?.id}>
										<td className={styles.table_content_cell}>{(page - 1) * DEFAULT_LISTING_LIMIT + index + 1}</td>
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
											<JudgementStatusTag status={judgement.status} />
										</td>
										<td className='px-6 py-5'>
											<Address
												truncateCharLen={5}
												address={judgement.registrarAddress}
											/>
										</td>
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
