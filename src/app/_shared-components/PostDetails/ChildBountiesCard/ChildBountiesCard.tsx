// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { IPost } from '@/_shared/types';
import { useState } from 'react';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { ValidatorService } from '@/_shared/_services/validator_service';
import Link from 'next/link';
import style from './ChildBountiesCard.module.scss';
import { PaginationWithLinks } from '../../PaginationWithLinks';
import StatusTag from '../../StatusTag/StatusTag';
import { LoadingSpinner } from '../../LoadingSpinner';

function ChildBountiesCard({ parentIndex }: { parentIndex: string }) {
	const t = useTranslations('ChildBounties');
	const [page, setPage] = useState(1);

	const fetchChildBounties = async () => {
		const { data, error } = await NextApiClientService.fetchChildBountiesApi({ bountyIndex: parentIndex, page: page.toString(), limit: DEFAULT_LISTING_LIMIT.toString() });
		if (error) {
			throw new ClientError(error.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['childBountiesInBountySidebar', parentIndex, page],
		queryFn: fetchChildBounties,
		enabled: !!parentIndex
	});

	return (
		<div className={style.childBountiesCardWrapper}>
			<p className={style.childBountiesCardTitle}>
				{t('childBounties')}
				{ValidatorService.isValidNumber(data?.totalCount) ? `(${data?.totalCount})` : ''}
			</p>
			{isFetching ? (
				<LoadingSpinner className='h-56' />
			) : (
				<div className={style.childBountiesCardItemWrapper}>
					{data?.items?.map((item: IPost) => (
						<Link
							key={item.index}
							href={`/child-bounty/${item.index}`}
							className={style.childBountiesCardItem}
						>
							<div className='flex gap-1'>
								<p className='font-bold'>#{item.index}</p>
								<p className='font-medium'>{item.title}</p>
							</div>
							<div>
								<StatusTag status={item.onChainInfo?.status} />
							</div>
						</Link>
					))}
				</div>
			)}
			{ValidatorService.isValidNumber(data?.totalCount) && Number(data?.totalCount) > DEFAULT_LISTING_LIMIT && (
				<PaginationWithLinks
					page={page}
					pageSize={DEFAULT_LISTING_LIMIT}
					totalCount={data?.totalCount || 0}
					onPageChange={(newPage) => setPage(newPage)}
				/>
			)}
		</div>
	);
}

export default ChildBountiesCard;
