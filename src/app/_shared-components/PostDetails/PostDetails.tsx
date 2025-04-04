// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EPostDetailsTab, EProposalType, IPost, IPostListing } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { canVote } from '@/_shared/_utils/canVote';
import PostHeader from './PostHeader/PostHeader';
import PostComments from '../PostComments/PostComments';
import classes from './PostDetails.module.scss';
import { Tabs, TabsContent } from '../Tabs';
import Timeline from './Timeline/Timeline';
import ProposalPeriods from './ProposalPeriods/ProposalPeriods';
import VoteSummary from './VoteSummary/VoteSummary';
import VoteReferendumButton from './VoteReferendumButton';
import PostContent from './PostContent';
import OnchainInfo from './OnchainInfo/OnchainInfo';

function PostDetails({ index, isModalOpen, postData }: { index: string; isModalOpen?: boolean; postData?: IPost }) {
	const [post, setPost] = useState<IPost>(postData || ({} as IPost));

	const onEditPostSuccess = (title: string, content: string) => {
		setPost((prev) => ({ ...prev, title, content }));
	};

	const isOffchainPost = ValidatorService.isValidOffChainProposalType(post.proposalType);

	return (
		<Tabs defaultValue={EPostDetailsTab.DESCRIPTION}>
			<div className={classes.headerWrapper}>
				<PostHeader
					isModalOpen={isModalOpen ?? false}
					postData={post as IPostListing}
				/>
			</div>
			<div className={cn(classes.detailsWrapper, isModalOpen ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-3')}>
				<div className={classes.leftWrapper}>
					<div className={classes.descBox}>
						<TabsContent value={EPostDetailsTab.DESCRIPTION}>
							<PostContent
								postData={post as IPostListing}
								isModalOpen={isModalOpen ?? false}
								onEditPostSuccess={onEditPostSuccess}
							/>
						</TabsContent>
						<TabsContent value={EPostDetailsTab.TIMELINE}>
							<Timeline
								proposalType={postData?.proposalType}
								timeline={postData?.onChainInfo?.timeline}
								createdAt={postData?.createdAt}
							/>
						</TabsContent>
						<TabsContent value={EPostDetailsTab.ONCHAIN_INFO}>
							<OnchainInfo
								proposalType={EProposalType.REFERENDUM_V2}
								index={index}
								onchainInfo={postData?.onChainInfo}
							/>
						</TabsContent>
					</div>
					{isModalOpen && !isOffchainPost && (
						<div className='pt-5'>{canVote(postData?.onChainInfo?.status, postData?.onChainInfo?.preparePeriodEndsAt) && <VoteReferendumButton index={index} />}</div>
					)}
					<div className={classes.commentsBox}>
						<PostComments
							proposalType={EProposalType.REFERENDUM_V2}
							index={index}
						/>
					</div>
				</div>
				{!isModalOpen && !isOffchainPost && (
					<div className={classes.rightWrapper}>
						{canVote(postData?.onChainInfo?.status, postData?.onChainInfo?.preparePeriodEndsAt) && <VoteReferendumButton index={index} />}
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
