// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EPostDetailsTab, EProposalType } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { Suspense, useState } from 'react';
import { OutputData } from '@editorjs/editorjs';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/app/loading';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useTranslations } from 'next-intl';
import PostHeader from './PostHeader/PostHeader';
import PostComments from '../PostComments/PostComments';
import classes from './PostDetails.module.scss';
import { Skeleton } from '../Skeleton';
import BlockEditor from '../BlockEditor/BlockEditor';
import { Tabs, TabsContent } from '../Tabs';
import Timeline from './Timeline/Timeline';
import ProposalPeriods from './ProposalPeriods/ProposalPeriods';
import VoteSummary from './VoteSummary/VoteSummary';
import VoteReferendumButton from './VoteReferendumButton';

async function fetchProposalDetails(proposalType: EProposalType, index: string) {
	return NextApiClientService.fetchProposalDetailsApi(proposalType, index);
}

function PostDetails({ index, isModalOpen }: { index: string; isModalOpen?: boolean }) {
	const { data, error, isLoading } = useQuery({
		queryKey: ['proposal', EProposalType.REFERENDUM_V2, index],
		queryFn: () => fetchProposalDetails(EProposalType.REFERENDUM_V2, index),
		staleTime: 300000,
		retry: 3
	});

	const [showMore, setShowMore] = useState(false);
	const t = useTranslations();

	const handleShowMore = () => {
		setShowMore(true);
	};

	const truncatedData = showMore
		? data?.data?.content
		: data?.data?.content && {
				...data?.data?.content,
				blocks: data?.data?.content.blocks?.slice(0, 4) || []
			};

	if (isLoading) return <Loading />;
	if (error || !data) return <div className='text-center text-text_primary'>{error?.message}</div>;

	return (
		<Tabs defaultValue={EPostDetailsTab.DESCRIPTION}>
			<div className={classes.headerWrapper}>
				<PostHeader
					title={data?.data?.title || ''}
					proposer={data?.data?.onChainInfo?.proposer || ''}
					createdAt={data?.data?.createdAt || new Date()}
					tags={data?.data?.tags}
					status={data?.data?.onChainInfo?.status || ''}
					beneficiaries={data?.data?.onChainInfo?.beneficiaries}
				/>
			</div>
			<div className={cn(classes.detailsWrapper, isModalOpen ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-3')}>
				<div className={classes.leftWrapper}>
					<div className={classes.descBox}>
						<TabsContent value={EPostDetailsTab.DESCRIPTION}>
							<BlockEditor
								data={truncatedData as OutputData}
								readOnly
								id='post-content'
								className={isModalOpen ? '' : 'max-h-full border-none'}
								onChange={() => {}}
							/>
							{!showMore && (
								<span
									onClick={handleShowMore}
									className='cursor-pointer text-sm font-medium text-text_pink'
									aria-hidden='true'
								>
									{t('ActivityFeed.PostItem.showMore')}
								</span>
							)}
						</TabsContent>
						<TabsContent value={EPostDetailsTab.TIMELINE}>
							<Timeline timeline={data?.data?.onChainInfo?.timeline} />
						</TabsContent>
					</div>
					<div className={classes.commentsBox}>
						<Suspense fallback={<Skeleton className='h-4' />}>
							<PostComments
								proposalType={EProposalType.REFERENDUM_V2}
								index={index}
							/>
						</Suspense>
					</div>
				</div>
				<div className={classes.rightWrapper}>
					<VoteReferendumButton index={index} />
					<ProposalPeriods
						confirmationPeriodEndsAt={data?.data?.onChainInfo?.confirmationPeriodEndsAt}
						decisionPeriodEndsAt={data?.data?.onChainInfo?.decisionPeriodEndsAt}
						preparePeriodEndsAt={data?.data?.onChainInfo?.preparePeriodEndsAt}
						status={data?.data?.onChainInfo?.status}
					/>
					<VoteSummary
						proposalType={EProposalType.REFERENDUM_V2}
						index={index}
						voteMetrics={data?.data?.onChainInfo?.voteMetrics}
					/>
				</div>
			</div>
		</Tabs>
	);
}

export default PostDetails;
