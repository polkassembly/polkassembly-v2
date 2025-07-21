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
import { POST_ANALYTICS_ENABLED_PROPOSAL_TYPE } from '@/_shared/_constants/postAnalyticsConstants';
import dynamic from 'next/dynamic';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import PostHeader from './PostHeader/PostHeader';
import PostComments from '../PostComments/PostComments';
import classes from './PostDetails.module.scss';
import { Tabs, TabsContent } from '../Tabs';
import ProposalPeriods from './ProposalPeriods/ProposalPeriods';
import VoteSummary from './VoteSummary/VoteSummary';
import PostContent from './PostContent';
import SpamPostModal from '../SpamPostModal/SpamPostModal';
import ChildBountiesCard from './ChildBountiesCard/ChildBountiesCard';
import ParentBountyCard from './ParentBountyCard/ParentBountyCard';
import { Skeleton } from '../Skeleton';
import Poll from './Poll/Poll';

const OnchainInfo = dynamic(() => import('./OnchainInfo/OnchainInfo'), {
	ssr: false,
	loading: () => (
		<div className='flex flex-col gap-4'>
			<Skeleton className='h-8 w-48' />
			<div className='flex flex-col gap-6'>
				<Skeleton className='h-10 w-full' />
				<Skeleton className='h-10 w-full' />
				<Skeleton className='h-10 w-full' />
				<Skeleton className='h-10 w-full' />
			</div>
		</div>
	)
});
const PostAnalytics = dynamic(() => import('./Analytics/PostAnalytics'), {
	ssr: false,
	loading: () => (
		<div className='flex flex-col gap-4'>
			<Skeleton className='h-10 w-[150px] rounded-lg' />
			<Skeleton className='h-[50px] w-full rounded-lg' />
			<div className='flex gap-4 max-lg:flex-col'>
				<Skeleton className='h-44 w-full rounded-lg' />
				<Skeleton className='h-44 w-full rounded-lg' />
				<Skeleton className='h-44 w-full rounded-lg' />
			</div>
			<Skeleton className='h-[250px] w-full rounded-lg' />
			<Skeleton className='h-[500px] w-full rounded-lg' />
			<div className='flex gap-4 max-lg:flex-col'>
				<Skeleton className='h-[250px] w-full rounded-lg' />
				<Skeleton className='h-[250px] w-full rounded-lg' />
			</div>
		</div>
	)
});

const VotesData = dynamic(() => import('./VotesData/VotesData'), {
	ssr: false,
	loading: () => (
		<div className='flex flex-col gap-4 rounded-lg bg-bg_modal p-4'>
			<Skeleton className='h-8 w-20' />
			<Skeleton className='h-10 w-full rounded-md' />
			<Skeleton className='mt-2 h-36 w-full rounded-md' />
		</div>
	)
});

const VoteReferendumButton = dynamic(() => import('./VoteReferendumButton'), {
	ssr: false,
	loading: () => <Skeleton className='h-12 w-full rounded-lg' />
});

const Timeline = dynamic(() => import('./Timeline/Timeline'), {
	ssr: false,
	loading: () => (
		<div className='flex flex-col gap-4'>
			<Skeleton className='h-8 w-48' />
			<div className='flex flex-col gap-3'>
				<Skeleton className='h-6 w-full' />
				<Skeleton className='h-6 w-full' />
				<Skeleton className='h-6 w-full' />
				<Skeleton className='h-6 w-3/4' />
			</div>
		</div>
	)
});

const PlaceDecisionDeposit = dynamic(() => import('./PlaceDecisionDeposit/PlaceDecisionDeposit'), {
	ssr: false,
	loading: () => (
		<div className='rounded-lg border border-border_grey bg-bg_modal p-4'>
			<Skeleton className='mb-4 h-6 w-40' />
			<Skeleton className='mb-2 h-4 w-full' />
			<Skeleton className='mb-4 h-4 w-3/4' />
			<Skeleton className='h-10 w-full rounded-md' />
		</div>
	)
});

const ClaimPayout = dynamic(() => import('./ClaimPayout/ClaimPayout'), {
	ssr: false,
	loading: () => (
		<div className='rounded-lg border border-border_grey bg-bg_modal p-4'>
			<Skeleton className='mb-4 h-6 w-32' />
			<Skeleton className='mb-2 h-4 w-full' />
			<Skeleton className='h-10 w-full rounded-md' />
		</div>
	)
});

function PostDetails({ index, isModalOpen, postData }: { index: string; isModalOpen?: boolean; postData: IPost }) {
	const network = getCurrentNetwork();
	const [showSpamModal, setShowSpamModal] = useState(postData.contentSummary?.isSpam ?? false);

	const [thresholdValues, setThresholdValues] = useState({ approvalThreshold: 0, supportThreshold: 0 });

	const queryClient = useQueryClient();

	const { setOpenSuccessModal, open: openSuccessModal } = useSuccessModal();

	const fetchPostDetails = async () => {
		const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: postData.proposalType, indexOrHash: index, skipCache: true });

		if (error || !data || !data.id) {
			console.log(error?.message || 'Failed to fetch post details');
			return postData;
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
							{POST_ANALYTICS_ENABLED_PROPOSAL_TYPE.includes(post.proposalType) && (
								<TabsContent value={EPostDetailsTab.POST_ANALYTICS}>
									<PostAnalytics
										proposalType={post.proposalType}
										index={index}
									/>
								</TabsContent>
							)}
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
						<div className={cn(classes.commentsBox, 'max-xl:hidden')}>
							<PostComments
								proposalType={post.proposalType}
								index={index}
								contentSummary={post.contentSummary}
								comments={post.comments}
								allowedCommentor={post.allowedCommentor}
								postUserId={post.userId}
							/>
						</div>
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
								index={index}
								voteMetrics={post.onChainInfo?.voteMetrics}
								approvalThreshold={thresholdValues.approvalThreshold}
							/>

							<VotesData
								proposalType={post.proposalType}
								index={index}
								trackName={post.onChainInfo?.origin || EPostOrigin.ROOT}
								createdAt={post.createdAt}
								timeline={post.onChainInfo?.timeline}
								setThresholdValues={setThresholdValues}
								thresholdValues={thresholdValues}
							/>
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

					{/* Poll */}
					{isOffchainPost && post?.poll && network === 'paseo' && (
						<div className={classes.rightWrapper}>
							<Poll poll={post.poll} />
						</div>
					)}

					<div className={cn(classes.leftWrapper, 'xl:hidden')}>
						<div className={classes.commentsBox}>
							<PostComments
								proposalType={post.proposalType}
								index={index}
								contentSummary={post.contentSummary}
								comments={post.comments}
								allowedCommentor={post.allowedCommentor}
								postUserId={post.userId}
							/>
						</div>
					</div>
				</div>
			</Tabs>
		</>
	);
}

export default PostDetails;
