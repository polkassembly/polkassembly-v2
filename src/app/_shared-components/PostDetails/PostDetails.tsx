// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostDetailsTab, EProposalType, IPost, IPostListing } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import PostHeader from './PostHeader/PostHeader';
import PostComments from '../PostComments/PostComments';
import classes from './PostDetails.module.scss';
import { Skeleton } from '../Skeleton';
import { Tabs, TabsContent } from '../Tabs';
import Timeline from './Timeline/Timeline';
import ProposalPeriods from './ProposalPeriods/ProposalPeriods';
import VoteSummary from './VoteSummary/VoteSummary';
import VoteReferendumButton from './VoteReferendumButton';
import PostContent from './PostContent';

function PostDetails({ index, isModalOpen, postData }: { index: string; isModalOpen?: boolean; postData?: IPost }) {
	return (
		<Tabs defaultValue={EPostDetailsTab.DESCRIPTION}>
			<div className={classes.headerWrapper}>
				<PostHeader
					isModalOpen={isModalOpen ?? false}
					postData={postData as IPostListing}
				/>
			</div>
			<div className={cn(classes.detailsWrapper, isModalOpen ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-3')}>
				<div className={classes.leftWrapper}>
					<div className={classes.descBox}>
						<TabsContent value={EPostDetailsTab.DESCRIPTION}>
							<PostContent
								postData={postData as IPostListing}
								isModalOpen={isModalOpen ?? false}
							/>
						</TabsContent>
						<TabsContent value={EPostDetailsTab.TIMELINE}>
							<Timeline timeline={postData?.onChainInfo?.timeline} />
						</TabsContent>
					</div>
					{isModalOpen && (
						<div className='pt-5'>
							{' '}
							<VoteReferendumButton index={index} />
						</div>
					)}
					{!isModalOpen && (
						<div className={classes.commentsBox}>
							<Suspense
								fallback={
									<div className='p-6'>
										<Skeleton className='h-4' />
									</div>
								}
							>
								<PostComments
									proposalType={EProposalType.REFERENDUM_V2}
									index={index}
								/>
							</Suspense>
						</div>
					)}
				</div>
				{!isModalOpen && (
					<div className={classes.rightWrapper}>
						<VoteReferendumButton index={index} />
						<ProposalPeriods
							confirmationPeriodEndsAt={postData?.onChainInfo?.confirmationPeriodEndsAt}
							decisionPeriodEndsAt={postData?.onChainInfo?.decisionPeriodEndsAt}
							preparePeriodEndsAt={postData?.onChainInfo?.preparePeriodEndsAt}
							status={postData?.onChainInfo?.status}
						/>
						<VoteSummary
							proposalType={EProposalType.REFERENDUM_V2}
							index={index}
							voteMetrics={postData?.onChainInfo?.voteMetrics}
						/>
					</div>
				)}
			</div>
		</Tabs>
	);
}

export default PostDetails;
