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
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
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

	const fetchPostDetails = async () => {
		const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: postData.proposalType, indexOrHash: index, skipCache: true });

		if (error || !data) {
			throw new Error(error?.message || 'Failed to fetch post details');
		}

		return data;
	};

	const { data: post } = useQuery({
		queryKey: ['postDetails', index],
		queryFn: fetchPostDetails,
		enabled: !!index,
		staleTime: FIVE_MIN_IN_MILLI,
		placeholderData: (prev) => prev || postData,
		retry: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true
	});

	const onEditPostSuccess = (title: string, content: string) => {
		queryClient.setQueryData(['postDetails', index], (prev: IPost) => ({ ...prev, title, content }));
	};

	const { data: aiSummary } = useAISummary({
		initialData: post?.contentSummary,
		proposalType: post?.proposalType || postData.proposalType,
		indexOrHash: String(post?.index ?? postData.index ?? post?.hash ?? postData.hash)
	});

	useEffect(() => {
		if (aiSummary?.isSpam) {
			setShowSpamModal(true);
		}
	}, [aiSummary]);

	const isOffchainPost = ValidatorService.isValidOffChainProposalType(post?.proposalType ?? postData.proposalType);

	const canPlaceDecisionDeposit = useMemo(
		() =>
			(post?.proposalType === EProposalType.REFERENDUM_V2 && post?.onChainInfo?.status === EProposalStatus.Submitted) ||
			(postData.proposalType === EProposalType.REFERENDUM_V2 && postData.onChainInfo?.status === EProposalStatus.Submitted),
		[post?.proposalType, post?.onChainInfo?.status, postData.proposalType, postData.onChainInfo?.status]
	);

	const parentBountyIndex = useMemo(() => {
		return post?.onChainInfo?.parentBountyIndex ?? postData.onChainInfo?.parentBountyIndex;
	}, [post?.onChainInfo?.parentBountyIndex, postData.onChainInfo?.parentBountyIndex]);

	return (
		<>
			<SpamPostModal
				open={showSpamModal}
				setOpen={setShowSpamModal}
				proposalType={post?.proposalType ?? postData.proposalType}
			/>
			<Tabs defaultValue={EPostDetailsTab.DESCRIPTION}>
				<div className={classes.headerWrapper}>
					<PostHeader
						isModalOpen={isModalOpen ?? false}
						postData={post ?? postData}
					/>
				</div>
				<div className={cn(classes.detailsWrapper, isModalOpen ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-3', 'mx-auto max-w-7xl')}>
					<div className={classes.leftWrapper}>
						<div className={classes.descBox}>
							<TabsContent value={EPostDetailsTab.DESCRIPTION}>
								<PostContent
									postData={post ?? postData}
									isModalOpen={isModalOpen ?? false}
									onEditPostSuccess={onEditPostSuccess}
								/>
							</TabsContent>
							<TabsContent value={EPostDetailsTab.TIMELINE}>
								<Timeline
									proposalType={post?.proposalType ?? postData.proposalType}
									timeline={post?.onChainInfo?.timeline}
									createdAt={post?.createdAt}
								/>
							</TabsContent>
							<TabsContent value={EPostDetailsTab.ONCHAIN_INFO}>
								<OnchainInfo
									proposalType={post?.proposalType ?? postData.proposalType}
									index={index}
									onchainInfo={post?.onChainInfo}
								/>
							</TabsContent>
						</div>
						<div className={classes.commentsBox}>
							<PostComments
								proposalType={post?.proposalType ?? postData.proposalType}
								index={index}
								contentSummary={post?.contentSummary ?? postData.contentSummary}
								comments={post?.comments ?? postData.comments}
							/>
						</div>
						{isModalOpen && !isOffchainPost && (
							<div className='sticky bottom-0 z-50 border-t border-border_grey bg-bg_modal p-4'>
								{canVote(post?.onChainInfo?.status) && (
									<VoteReferendumButton
										iconClassName='hidden'
										index={index}
									/>
								)}
							</div>
						)}
					</div>
					{!isModalOpen && !isOffchainPost && (post?.proposalType === EProposalType.REFERENDUM_V2 || postData.proposalType === EProposalType.REFERENDUM_V2) && (
						<div className={classes.rightWrapper}>
							{canPlaceDecisionDeposit && post?.index && post?.onChainInfo?.origin && post?.onChainInfo?.status && (
								<PlaceDecisionDeposit
									postId={post?.index}
									track={post?.onChainInfo?.origin}
									status={post?.onChainInfo?.status}
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
							{canVote(post?.onChainInfo?.status) && (
								<VoteReferendumButton
									iconClassName='hidden'
									index={index}
								/>
							)}
							<ClaimPayout beneficiaries={post?.onChainInfo?.beneficiaries || []} />
							<ProposalPeriods
								confirmationPeriodEndsAt={post?.onChainInfo?.confirmationPeriodEndsAt}
								decisionPeriodEndsAt={post?.onChainInfo?.decisionPeriodEndsAt}
								preparePeriodEndsAt={post?.onChainInfo?.preparePeriodEndsAt}
								status={post?.onChainInfo?.status || EProposalStatus.Unknown}
								trackName={post?.onChainInfo?.origin || EPostOrigin.ROOT}
							/>
							<VoteSummary
								proposalType={post?.proposalType ?? postData.proposalType}
								index={index}
								voteMetrics={post?.onChainInfo?.voteMetrics}
								approvalThreshold={thresholdValues.approvalThreshold}
							/>
							{post?.onChainInfo?.origin && post?.onChainInfo?.timeline?.some((s) => s.status === EProposalStatus.DecisionDepositPlaced) && (
								<VoteCurvesData
									proposalType={post?.proposalType ?? postData.proposalType}
									index={index}
									createdAt={post?.createdAt}
									trackName={post?.onChainInfo?.origin}
									timeline={post?.onChainInfo?.timeline}
									setThresholdValues={setThresholdValues}
									thresholdValues={thresholdValues}
								/>
							)}
						</div>
					)}

					{(post?.proposalType === EProposalType.BOUNTY || postData.proposalType === EProposalType.BOUNTY) && (
						<div className={classes.rightWrapper}>
							<ChildBountiesCard parentIndex={index} />
						</div>
					)}

					{(post?.proposalType === EProposalType.CHILD_BOUNTY || postData.proposalType === EProposalType.CHILD_BOUNTY) &&
						parentBountyIndex &&
						ValidatorService.isValidNumber(parentBountyIndex) && (
							<div className={classes.rightWrapper}>
								<div className={classes.parentBountyCardWrapper}>
									<ParentBountyCard parentBountyIndex={parentBountyIndex} />
								</div>
							</div>
						)}
				</div>
			</Tabs>
		</>
	);
}

export default PostDetails;
