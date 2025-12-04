// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ArrowUpRightFromSquareIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import NoActivity from '@assets/activityfeed/gifs/noactivity.gif';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DelegateXClientService } from '@/app/_client-services/delegate_x_client_service';
import { IDelegateXVoteData, EProposalStatus } from '@/_shared/types';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import VotingHistoryTable from './Components/VotingHistoryTable';

function VotingHistoryPage() {
	const t = useTranslations();
	const [votingHistory, setVotingHistory] = useState<(IDelegateXVoteData & { status: EProposalStatus })[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const searchParams = useSearchParams();
	const page = Number(searchParams?.get('page')) || 1;

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			const { data, error } = await DelegateXClientService.getDelegateXVoteHistory({ page, limit: 10 });
			if (error || !data) {
				console.error('Error fetching vote history', error);
				setIsLoading(false);
				return;
			}
			if (data.success && data.voteData) {
				setVotingHistory(data.voteData as (IDelegateXVoteData & { status: EProposalStatus })[]);
				setTotalCount(data.totalCount);
			}
			setIsLoading(false);
		})();
	}, [page]);

	return (
		<div className='min-h-screen'>
			<div className='flex flex-col gap-2 bg-bg_modal px-20 py-8 text-text_primary shadow-lg'>
				<p className='text-[28px] font-semibold'>Voting History</p>
				<p className='text-sm font-medium'>Every vote is auditable. Click a proposal to see which criteria were met and the delegate&apos;s reasoning.</p>
				<Link
					href='https://wiki.polkadot.com/general/glossary/#referendum'
					target='_blank'
					rel='noopener noreferrer'
					className='flex items-center gap-x-1 text-sm font-medium text-text_pink underline'
				>
					{t('ActivityFeed.PostItem.readMore')} <ArrowUpRightFromSquareIcon className='h-3.5 w-3.5' />
				</Link>{' '}
			</div>

			{isLoading ? (
				<div className='px-4 py-6 md:px-20'>
					<div className='space-y-4'>
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
						<Skeleton className='h-12 w-full' />
					</div>
				</div>
			) : votingHistory && votingHistory.length === 0 ? (
				<div className='flex flex-col items-center justify-center pt-6'>
					<div className='flex max-w-3xl flex-col items-center text-center'>
						<Image
							src={NoActivity}
							alt='empty state'
							className='h-80 w-80 p-0'
							width={320}
							height={320}
						/>{' '}
						<p className='pb-3 text-xl font-semibold text-text_primary'>
							No votes yet — Delegate X will record results as soon as
							<br /> new referenda arrive.
						</p>
						<Link
							href='/delegation'
							className='w-full rounded-lg bg-bg_pink px-6 py-3 text-center text-sm font-semibold text-btn_primary_text hover:bg-opacity-90'
						>
							View Dashboard
						</Link>
					</div>
				</div>
			) : (
				<div className='px-4 py-6 md:px-20'>
					<VotingHistoryTable votingHistory={votingHistory} />
					<div className='mt-6 flex justify-end'>
						<PaginationWithLinks
							page={page}
							pageSize={10}
							totalCount={totalCount}
							pageSearchParam='page'
						/>
					</div>
				</div>
			)}
		</div>
	);
}

export default VotingHistoryPage;
