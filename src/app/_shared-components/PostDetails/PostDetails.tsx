// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EPostDetailsTab, IPost, EProposalStatus, EPostOrigin, EProposalType, EReactQueryKeys } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { canVote } from '@/_shared/_utils/canVote';
import { useAISummary } from '@/hooks/useAISummary';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSuccessModal } from '@/hooks/useSuccessModal';
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
	const [showSpamModal, setShowSpamModal] = useState(postData.contentSummary?.isSpam ?? false);

	const [thresholdValues, setThresholdValues] = useState({ approvalThreshold: 0, supportThreshold: 0 });

	const queryClient = useQueryClient();

	const { setOpenSuccessModal, open: openSuccessModal } = useSuccessModal();

	const fetchPostDetails = async () => {
		const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: postData.proposalType, indexOrHash: index, skipCache: true });

		if (error || !data) {
			throw new Error(error?.message || 'Failed to fetch post details');
		}

		return data;
	};

	const { data: post } = useQuery({
		queryKey: [EReactQueryKeys.POST_DETAILS, index],
		queryFn: fetchPostDetails,
		enabled: !!index,
		placeholderData: (prev) => prev || postData,
		retry: true,
		refetchOnWindowFocus: true,
		refetchOnMount: true
	});

	const { data: aiSummary } = useAISummary({
		initialData: post?.contentSummary,
		proposalType: post?.proposalType || postData.proposalType,
		indexOrHash: String(post?.index ?? postData.index ?? post?.hash ?? postData.hash)
	});

	useEffect(() => {
		if (openSuccessModal) {
			setOpenSuccessModal(false);
		}
		if (aiSummary?.isSpam) {
			setShowSpamModal(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [aiSummary]);

	const isOffchainPost = ValidatorService.isValidOffChainProposalType(post?.proposalType ?? postData.proposalType);

	if (!post) {
		return <div className='text-center text-text_primary'>Post not found</div>;
	}

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
								/>
							</TabsContent>
							<TabsContent value={EPostDetailsTab.TIMELINE}>
								<Timeline
									proposalType={post.proposalType}
									timeline={post.onChainInfo?.timeline}
									createdAt={post.createdAt}
									linkedPost={post.linkedPost}
								/>
							</TabsContent>
							<TabsContent value={EPostDetailsTab.ONCHAIN_INFO}>
								<OnchainInfo
									proposalType={post.proposalType}
									index={index}
									onchainInfo={post.onChainInfo}
								/>
							</TabsContent>
						</div>
						<div className={classes.commentsBox}>
							<PostComments
								proposalType={post.proposalType}
								index={index}
								contentSummary={post.contentSummary}
								comments={post.comments}
							/>
						</div>
						{isModalOpen && !isOffchainPost && (
							<div className='sticky bottom-0 z-50 border-t border-border_grey bg-bg_modal p-4'>
								{canVote(post.onChainInfo?.status) && (
									<VoteReferendumButton
										iconClassName='hidden'
										index={index}
										track={post.onChainInfo?.origin}
										proposalType={post.proposalType}
									/>
								)}
							</div>
						)}
					</div>
					{!isModalOpen && !isOffchainPost && post.proposalType === EProposalType.REFERENDUM_V2 && (
						<div className={classes.rightWrapper}>
							{post.proposalType === EProposalType.REFERENDUM_V2 &&
								post.onChainInfo?.status &&
								post.onChainInfo?.status === EProposalStatus.Submitted &&
								post.index &&
								post.onChainInfo?.origin && (
									<PlaceDecisionDeposit
										postId={post.index}
										track={post.onChainInfo?.origin}
										status={post.onChainInfo?.status}
										onSuccess={() => {
											queryClient.setQueryData(['postDetails', index], (prev: IPost) => {
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
							{canVote(post.onChainInfo?.status) && (
								<VoteReferendumButton
									iconClassName='hidden'
									index={index}
									track={post.onChainInfo?.origin}
									proposalType={post.proposalType}
								/>
							)}
							<ClaimPayout beneficiaries={post.onChainInfo?.beneficiaries || []} />
							<ProposalPeriods
								confirmationPeriodEndsAt={post.onChainInfo?.confirmationPeriodEndsAt}
								decisionPeriodEndsAt={post.onChainInfo?.decisionPeriodEndsAt}
								preparePeriodEndsAt={post.onChainInfo?.preparePeriodEndsAt}
								status={post.onChainInfo?.status || EProposalStatus.Unknown}
								trackName={post.onChainInfo?.origin || EPostOrigin.ROOT}
							/>
							<VoteSummary
								proposalType={post.proposalType}
								index={index}
								voteMetrics={post.onChainInfo?.voteMetrics}
								approvalThreshold={thresholdValues.approvalThreshold}
							/>
							{post.onChainInfo?.origin && post.onChainInfo?.timeline?.some((s) => s.status === EProposalStatus.DecisionDepositPlaced) && (
								<VoteCurvesData
									proposalType={post.proposalType}
									index={index}
									createdAt={post.createdAt}
									trackName={post.onChainInfo?.origin}
									timeline={post.onChainInfo?.timeline}
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

					{post.proposalType === EProposalType.CHILD_BOUNTY && post?.onChainInfo?.parentBountyIndex && ValidatorService.isValidNumber(post?.onChainInfo?.parentBountyIndex) && (
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
