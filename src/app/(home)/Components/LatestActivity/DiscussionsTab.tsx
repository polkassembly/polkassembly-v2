// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/app/_shared-components/Table';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { parseCamelCase } from '@/app/_client-utils/parseCamelCase';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EProposalType } from '@/_shared/types';
import { ClientError } from '@/app/_client-utils/clientError';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';

function DiscussionsTab() {
	const t = useTranslations('Overview');

	const fetchDiscussionsList = async () => {
		const { data: discussionData, error: discussionError } = await NextApiClientService.fetchListingData({
			proposalType: EProposalType.DISCUSSION,
			limit: DEFAULT_LISTING_LIMIT,
			page: 1
		});

		if (discussionError || !discussionData) {
			throw new ClientError(discussionError?.message || 'Failed to fetch data');
		}
		return discussionData;
	};

	const { data, isFetching } = useQuery({
		queryKey: ['discussions'],
		queryFn: () => fetchDiscussionsList(),
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
					<TableHead className='py-4'>{t('topic')}</TableHead>
					<TableHead className='py-4'>{t('creator')}</TableHead>
					<TableHead className='py-4'>{t('created')}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data?.items && data.items.length > 0 ? (
					data.items.map((row) => (
						<Link
							href={`/post/${row.index}`}
							key={row.index}
							className='contents'
						>
							<TableRow key={row.index}>
								<TableCell className='py-4'>{row.index}</TableCell>
								<TableCell className='max-w-[300px] truncate py-4'>{row.title}</TableCell>
								<TableCell className='py-4'>{row.topic && parseCamelCase(row.topic)}</TableCell>
								<TableCell className='py-4'>{row.publicUser?.addresses?.[0] && <Address address={row.publicUser?.addresses?.[0]} />}</TableCell>
								<TableCell className='py-4'>{row.createdAt && dayjs(row.createdAt).format("Do MMM 'YY")}</TableCell>
							</TableRow>
						</Link>
					))
				) : (
					<TableRow className='h-48'>
						<TableCell
							colSpan={6}
							className='text-center'
						>
							{t('nodiscussionposts')}
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

export default DiscussionsTab;
