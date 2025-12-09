// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IJudgementRequest, EJudgementStatus } from '@/_shared/types';
import { useMemo } from 'react';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { formatJudgementLabel, getJudgementRequests } from '@/app/_client-utils/identityUtils';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Copy } from 'lucide-react';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '../../../_shared-components/Table';
import { PaginationWithLinks } from '../../../_shared-components/PaginationWithLinks';
import { JudgementDisplay, SocialLinksDisplay } from '../Overview/IdentityComponents';
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

	const judgementSummaryByAddress = useMemo(() => {
		if (!allJudgements) return {};

		return allJudgements.reduce<Record<string, { labels: string[]; count: number }>>((acc, judgement) => {
			if (judgement.status !== EJudgementStatus.APPROVED && judgement.status !== EJudgementStatus.REJECTED) return acc;

			const label = judgement.judgementLabel || (judgement.judgementType ? formatJudgementLabel(judgement.judgementType) : '');
			if (!label) return acc;

			if (!acc[judgement.address]) {
				acc[judgement.address] = { labels: [], count: 0 };
			}

			acc[judgement.address].labels.push(label);
			acc[judgement.address].count += 1;
			return acc;
		}, {});
	}, [allJudgements]);

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
								<TableRow className={styles.headerRow}>
									<TableHead className={styles.headerCell}>{t('address')}</TableHead>
									<TableHead className={styles.headerCell}>{t('socials')}</TableHead>
									<TableHead className={styles.headerCell}>{t('status')}</TableHead>
									<TableHead className={styles.headerCell}>{t('judgements')}</TableHead>
									<TableHead className={styles.headerCell}>{t('registrar')}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{judgementData.map((judgement: IJudgementRequest) => {
									const judgementSummary = judgementSummaryByAddress[judgement.address];

									return (
										<TableRow key={judgement?.id}>
											<td className='py-4 pl-2 pr-6'>
												<div className='flex items-center gap-1'>
													<span className='text-xs text-basic_text'>
														<Address
															iconSize={24}
															address={judgement.address}
														/>
													</span>
													<span className='text-xs text-basic_text'>
														({judgement.address.slice(0, 6)}...{judgement.address.slice(-5)})
													</span>
													<button
														type='button'
														className='text-basic_text hover:text-text_primary'
														title='Copy address'
														onClick={() => navigator.clipboard.writeText(judgement.address)}
													>
														<Copy size={14} />
													</button>
												</div>
											</td>
											<td className='px-6 py-4'>
												<SocialLinksDisplay
													socials={{
														email: judgement.email,
														twitter: judgement.twitter,
														discord: judgement.discord,
														matrix: judgement.matrix,
														github: judgement.github,
														web: judgement.web
													}}
													size='md'
												/>
											</td>
											<td className='px-6 py-5'>
												<JudgementStatusTag
													status={judgement.status}
													className='w-fit'
												/>
											</td>
											<td className='px-6 py-4'>
												<JudgementDisplay
													count={judgementSummary?.count || 0}
													labels={judgementSummary?.labels || []}
												/>
											</td>
											<td className='px-6 py-4'>
												<Address
													truncateCharLen={5}
													address={judgement.registrarAddress}
												/>
											</td>
										</TableRow>
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
				<div className='flex items-center justify-center'>
					<h1 className='text-center text-2xl font-bold'>{t('noJudgementsFound')}</h1>
				</div>
			)}
		</div>
	);
}

export default JudgementListingTable;
