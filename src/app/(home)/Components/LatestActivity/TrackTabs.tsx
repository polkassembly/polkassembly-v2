// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/app/_shared-components/Table';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EPostOrigin, EProposalType } from '@/_shared/types';
import { ClientError } from '@/app/_client-utils/clientError';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import StatusTag from '@/app/_shared-components/StatusTag/StatusTag';

function TrackTabs({ trackName }: { trackName: EPostOrigin }) {
	const t = useTranslations('Overview');

	const fetchTrackList = async () => {
		const { data, error } = await NextApiClientService.fetchListingData({
			proposalType: EProposalType.REFERENDUM_V2,
			origins: [trackName],
			limit: DEFAULT_LISTING_LIMIT,
			page: 1
		});

		if (error || !data) {
			throw new ClientError(error?.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['trackList', trackName],
		queryFn: () => fetchTrackList(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});
	return (
		<Table className='text_text_primary relative text-sm'>
			{isFetching && <LoadingLayover />}
			<TableHeader>
				<TableRow className='bg-page_background text-sm font-medium text-wallet_btn_text'>
					<TableHead className='py-4'>#</TableHead>
					<TableHead className='py-4'>{t('title')}</TableHead>
					<TableHead className='py-4'>{t('postedBy')}</TableHead>
					<TableHead className='py-4'>{t('created')}</TableHead>
					<TableHead className='py-4 text-right'>{t('status')}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data?.items && data.items.length > 0 ? (
					data.items.map((row) => (
						<Link
							href={`/referenda/${row.index}`}
							className='contents'
							key={row.index}
						>
							<TableRow key={row.index}>
								<TableCell className='py-4'>{row.index}</TableCell>
								<TableCell className='max-w-[300px] truncate py-4'>{row.title}</TableCell>
								<TableCell className='py-4'>{row.onChainInfo?.proposer && <Address address={row.onChainInfo.proposer} />}</TableCell>
								<TableCell className='py-4'>{row.onChainInfo?.createdAt && dayjs(row.onChainInfo.createdAt).format("Do MMM 'YY")}</TableCell>
								<TableCell className='flex justify-end py-4'>
									<StatusTag
										className='w-max'
										status={row.onChainInfo?.status}
									/>
								</TableCell>
							</TableRow>
						</Link>
					))
				) : (
					<TableRow className='h-48'>
						<TableCell
							colSpan={6}
							className='text-center'
						>
							{t('no')} {trackName} {t('activityfound')}
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

export default TrackTabs;
