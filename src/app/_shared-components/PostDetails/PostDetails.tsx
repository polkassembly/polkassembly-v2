// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EPostDetailsTab, IPost, EProposalStatus, EPostOrigin, EProposalType } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { canVote } from '@/_shared/_utils/canVote';
import { useAISummary } from '@/hooks/useAISummary';
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
import SpamPostModal from '../SpamPostModal/SpamPostModal';
import ChildBountiesCard from './ChildBountiesCard/ChildBountiesCard';
import ParentBountyCard from './ParentBountyCard/ParentBountyCard';
import VoteCurvesData from './VoteCurvesData/VoteCurvesData';
import PlaceDecisionDeposit from './PlaceDecisionDeposit/PlaceDecisionDeposit';
import ClaimPayout from './ClaimPayout/ClaimPayout';

function PostDetails({ index, isModalOpen, postData }: { index: string; isModalOpen?: boolean; postData: IPost }) {
	const [post, setPost] = useState<IPost>(postData);
	const [showSpamModal, setShowSpamModal] = useState(postData.contentSummary?.isSpam ?? false);

	const [thresholdValues, setThresholdValues] = useState({ approvalThreshold: 0, supportThreshold: 0 });

	const onEditPostSuccess = (title: string, content: string) => {
		setPost((prev) => ({ ...prev, title, content }));
	};

	const { data: aiSummary } = useAISummary({
		initialData: post.contentSummary,
		proposalType: post.proposalType,
		indexOrHash: String(post.index ?? post.hash)
	});

	useEffect(() => {
		if (aiSummary?.isSpam) {
			setShowSpamModal(true);
		}
	}, [aiSummary]);

	const isOffchainPost = ValidatorService.isValidOffChainProposalType(post.proposalType);

	const canPlaceDecisionDeposit = useMemo(
		() => post.proposalType === EProposalType.REFERENDUM_V2 && post?.onChainInfo?.status === EProposalStatus.Submitted,
		[post.proposalType, post?.onChainInfo?.status]
	);

	return (
		<>
			<SpamPostModal
				open={showSpamModal}
				setOpen={setShowSpamModal}
				proposalType={post.proposalType}
			/>
			<Tabs defaultValue={EPostDetailsTab.DESCRIPTION}>
				<div className={classes.headerWrapper}>
					<PostHeader
						isModalOpen={isModalOpen ?? false}
						postData={post}
					/>
				</div>
				<div className={cn(classes.detailsWrapper, isModalOpen ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-3', 'mx-auto max-w-7xl')}>
					<div className={classes.leftWrapper}>
						<div className={classes.descBox}>
							<TabsContent value={EPostDetailsTab.DESCRIPTION}>
								<PostContent
									postData={post}
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
									proposalType={post.proposalType}
									index={index}
									onchainInfo={postData?.onChainInfo}
								/>
							</TabsContent>
						</div>
						<div className={classes.commentsBox}>
							<PostComments
								proposalType={post.proposalType}
								index={index}
								contentSummary={post.contentSummary}
							/>
						</div>
						{isModalOpen && !isOffchainPost && (
							<div className='sticky bottom-0 z-50 border-t border-border_grey bg-bg_modal p-4'>
								{canVote(postData?.onChainInfo?.status) && (
									<VoteReferendumButton
										iconClassName='hidden'
										index={index}
									/>
								)}
							</div>
						)}
					</div>
					{!isModalOpen && !isOffchainPost && post.proposalType === EProposalType.REFERENDUM_V2 && (
						<div className={classes.rightWrapper}>
							{canPlaceDecisionDeposit && post?.index && post?.onChainInfo?.origin && post?.onChainInfo?.status && (
								<PlaceDecisionDeposit
									postId={post?.index}
									track={post?.onChainInfo?.origin}
									status={post?.onChainInfo?.status}
									onSuccess={() => {
										setPost((prev: IPost) => {
											if (!prev.onChainInfo) return prev;
											return {
												...prev,
												onChainInfo: {
													...prev.onChainInfo,
													status: EProposalStatus.DecisionDepositPlaced
												}
											};
										});
									}}
								/>
							)}
							{canVote(postData?.onChainInfo?.status) && (
								<VoteReferendumButton
									iconClassName='hidden'
									index={index}
								/>
							)}
							<ClaimPayout beneficiaries={postData.onChainInfo?.beneficiaries || []} />
							<ProposalPeriods
								confirmationPeriodEndsAt={postData?.onChainInfo?.confirmationPeriodEndsAt}
								decisionPeriodEndsAt={postData?.onChainInfo?.decisionPeriodEndsAt}
								preparePeriodEndsAt={postData?.onChainInfo?.preparePeriodEndsAt}
								status={postData?.onChainInfo?.status || EProposalStatus.Unknown}
								trackName={postData?.onChainInfo?.origin || EPostOrigin.ROOT}
							/>
							<VoteSummary
								proposalType={post.proposalType}
								index={index}
								voteMetrics={postData?.onChainInfo?.voteMetrics}
								approvalThreshold={thresholdValues.approvalThreshold}
							/>
							{postData?.onChainInfo?.origin && postData.onChainInfo?.timeline?.some((s) => s.status === EProposalStatus.DecisionDepositPlaced) && (
								<VoteCurvesData
									proposalType={post.proposalType}
									index={index}
									createdAt={postData?.createdAt}
									trackName={postData?.onChainInfo?.origin}
									timeline={postData?.onChainInfo?.timeline}
									setThresholdValues={setThresholdValues}
									thresholdValues={thresholdValues}
								/>
							)}
						</div>
					)}
					{post.proposalType === EProposalType.BOUNTY && (
						<div className={classes.rightWrapper}>
							<ChildBountiesCard parentIndex={index} />
						</div>
					)}
					{post.proposalType === EProposalType.CHILD_BOUNTY && post.onChainInfo?.parentBountyIndex && ValidatorService.isValidNumber(post.onChainInfo?.parentBountyIndex) && (
						<div className={classes.rightWrapper}>
							<div className={classes.parentBountyCardWrapper}>
								<ParentBountyCard parentBountyIndex={post.onChainInfo?.parentBountyIndex} />
							</div>
						</div>
					)}
				</div>
			</Tabs>
		</>
	);
}

export default PostDetails;
