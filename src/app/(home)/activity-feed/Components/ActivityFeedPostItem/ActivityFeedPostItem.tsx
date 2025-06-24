// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { RefObject, useMemo, useRef, useState } from 'react';
import { FaRegClock } from '@react-icons/all-files/fa/FaRegClock';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { EActivityFeedTab, ENotificationStatus, IPostListing } from '@/_shared/types';
import { groupBeneficiariesByAsset } from '@/app/_client-utils/beneficiaryUtils';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { calculateDecisionProgress } from '@/app/_client-utils/calculateDecisionProgress';
import { getTimeRemaining } from '@/app/_client-utils/getTimeRemaining';
import { calculatePercentage } from '@/app/_client-utils/calculatePercentage';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { BN } from '@polkadot/util';
import Address from '@ui/Profile/Address/Address';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import StatusTag from '@ui/StatusTag/StatusTag';
import { getSpanStyle } from '@ui/TopicTag/TopicTag';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePostReactions } from '@/hooks/usePostReactions';
import { canVote } from '@/_shared/_utils/canVote';
import { ClientError } from '@/app/_client-utils/clientError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { MarkdownViewer } from '@ui/MarkdownViewer/MarkdownViewer';
import { useToast } from '@/hooks/useToast';
import VoteReferendumButton from '@/app/_shared-components/PostDetails/VoteReferendumButton';
import VotingProgress from '../VotingProgress/VotingProgress';
import CommentInput from '../CommentInput/CommentInput';
import styles from './ActivityFeedPostItem.module.scss';
import CommentModal from '../CommentModal/CommentModal';
import ReactionBar from '../ReactionBar';

function ActivityFeedPostItem({
	postData,
	voteButton = true,
	commentBox = true,
	preventClick,
	onUnsubscribe
}: {
	postData: IPostListing;
	voteButton?: boolean;
	commentBox?: boolean;
	preventClick?: boolean;
	onUnsubscribe?: (postId: string | number) => void;
}) {
	const { user } = useUser();
	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();
	const isInSubscriptionTab = useMemo(() => {
		return searchParams?.get('tab') === EActivityFeedTab.SUBSCRIBED;
	}, [searchParams]);
	const t = useTranslations();
	const inputRef = useRef<HTMLInputElement>(null);
	const network = getCurrentNetwork();
	const [commentCount, setCommentCount] = useState(postData?.metrics?.comments);

	const { reactionState, showLikeGif, showDislikeGif, handleReaction, isSubscribed, handleSubscribe, subscriptionKey } = usePostReactions({
		reactions: postData?.reactions,
		proposalType: postData?.proposalType,
		indexOrHash: postData?.index?.toString() || postData?.hash,
		isSubscribed: !!postData?.userSubscriptionId || isInSubscriptionTab
	});

	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleCommentClick = () => {
		if (!user?.id) {
			router.push('/login');
		} else {
			setIsDialogOpen(true);
		}
	};

	const handleSubscribeClick = async () => {
		try {
			if (!ValidatorService.isValidNumber(postData?.index) && !postData?.hash) {
				throw new ClientError(ERROR_CODES.INVALID_PARAMS_ERROR, 'Post index or hash is undefined');
			}

			const result = await handleSubscribe();

			if (isInSubscriptionTab && result.wasUnsubscribed && !result.error && onUnsubscribe) {
				onUnsubscribe((postData?.index ?? postData?.hash)!);
			}
		} catch (error) {
			console.error('Error handling subscription:', error);
			toast({
				title: 'Failed to update subscription',
				status: ENotificationStatus.ERROR
			});
		}
	};

	const ayeValue = new BN(postData.onChainInfo?.voteMetrics?.aye.value || '0');
	const nayValue = new BN(postData.onChainInfo?.voteMetrics?.nay.value || '0');
	const totalValue = ayeValue.add(nayValue);
	const ayePercent = calculatePercentage(postData.onChainInfo?.voteMetrics?.aye.value || '0', totalValue);
	const nayPercent = calculatePercentage(postData.onChainInfo?.voteMetrics?.nay.value || '0', totalValue);
	const decisionPeriodPercentage = postData.onChainInfo?.decisionPeriodEndsAt ? calculateDecisionProgress(postData.onChainInfo?.decisionPeriodEndsAt) : 0;

	const timeRemaining = postData.onChainInfo?.decisionPeriodEndsAt ? getTimeRemaining(postData.onChainInfo?.decisionPeriodEndsAt) : null;
	const formattedTime = timeRemaining ? `Deciding ends in ${timeRemaining.days}d : ${timeRemaining.hours}hrs : ${timeRemaining.minutes}mins` : 'Decision period has ended.';
	const likeCount = reactionState.isLiked !== undefined || null ? reactionState.likesCount : 0;
	const dislikeCount = reactionState.isDisliked !== undefined || null ? reactionState.dislikesCount : 0;

	return (
		<div className={styles.container}>
			{!preventClick && (
				<Link
					href={`/referenda/${postData.index}`}
					className='absolute left-0 top-0 z-20 h-full w-full rounded-xl'
				/>
			)}
			{/* Header Section */}
			<div className='mb-3 flex items-center justify-between'>
				<div className='flex items-center text-wallet_btn_text'>
					<span className='text-xl font-semibold'>
						{postData.onChainInfo?.beneficiaries && Array.isArray(postData.onChainInfo.beneficiaries) && postData.onChainInfo.beneficiaries.length > 0 && (
							<div className={`${styles.beneficiaryContainer} mr-2`}>
								{Object.entries(groupBeneficiariesByAsset(postData.onChainInfo.beneficiaries, postData.network))
									.map(([assetId, amount]) =>
										formatBnBalance(
											amount.toString(),
											{ withUnit: true, numberAfterComma: 2, compactNotation: true },
											network,
											assetId === NETWORKS_DETAILS[`${network}`].tokenSymbol ? null : assetId
										)
									)
									.join(', ')}
							</div>
						)}
					</span>
					<StatusTag status={postData.onChainInfo?.status} />
				</div>
				<div className='hidden lg:block'>
					{voteButton && canVote(postData.onChainInfo?.status) && (
						<div className='relative z-50'>
							<VoteReferendumButton
								index={postData?.index?.toString() || ''}
								btnClassName='bg-transparent border border-navbar_border text-text_pink hover:bg-transparent hover:text-text_pink font-semibold'
								size='sm'
								track={postData.onChainInfo?.origin}
								proposalType={postData.proposalType}
							/>
						</div>
					)}
				</div>
			</div>

			{/* Post Info Section */}
			<div className='flex items-center justify-between gap-2'>
				<div className='mb-3 flex flex-wrap items-center gap-2 text-xs text-btn_secondary_text'>
					<span className='z-50 font-medium'>
						<Address address={postData.onChainInfo?.proposer || ''} />
					</span>
					<span>in</span>
					<span className={`${getSpanStyle(postData.onChainInfo?.origin || '', 1)} ${styles.originStyle}`}>{convertCamelCaseToTitleCase(postData.onChainInfo?.origin || '')}</span>
					{postData.onChainInfo?.createdAt && (
						<>
							<span>|</span>
							<span className='flex items-center gap-2 whitespace-nowrap text-[10px] lg:text-xs'>
								<FaRegClock className='text-sm' />
								{dayjs(postData.onChainInfo?.createdAt).fromNow()}
							</span>
						</>
					)}
				</div>
				<div className='relative z-50 cursor-pointer'>
					<VotingProgress
						timeRemaining={timeRemaining}
						decisionPeriodPercentage={decisionPeriodPercentage}
						formattedTime={formattedTime}
						ayePercent={ayePercent}
						nayPercent={nayPercent}
						postData={postData}
					/>
				</div>
			</div>

			{/* Post Content Section */}
			<div>
				<h3 className={styles.proposalTitle}>{`#${postData.index} ${postData.title}`}</h3>
				<div className='mb-4 text-sm text-btn_secondary_text'>
					<div className='flex w-full overflow-hidden border-none'>
						<MarkdownViewer
							markdown={postData.content}
							truncate
						/>
					</div>
				</div>
			</div>

			{/* Metrics Section */}
			<div className={styles.metricsContainer}>
				<div className='flex items-center gap-2'>
					<span>
						{likeCount} {t('ActivityFeed.PostItem.likes')}
					</span>
					<span>|</span>

					<span>
						{dislikeCount} {t('ActivityFeed.PostItem.dislikes')}
					</span>
					{commentCount !== null && (
						<>
							<span>|</span>
							<span>
								{commentCount} {t('ActivityFeed.PostItem.comments')}
							</span>
						</>
					)}
				</div>
			</div>

			<hr className='mb-[0.6px] mt-3.5 border-[0.6px] border-primary_border' />

			{/* Reaction Buttons Section */}
			{commentBox && (
				<div
					aria-hidden='true'
					onClick={(e) => e.stopPropagation()}
					data-comment-input='true'
					className='relative z-50'
				>
					<ReactionBar
						postData={postData}
						isLiked={reactionState.isLiked}
						isDisliked={reactionState.isDisliked}
						showLikeGif={showLikeGif}
						showDislikeGif={showDislikeGif}
						handleReaction={handleReaction}
						isSubscribed={isSubscribed}
						handleSubscribe={handleSubscribeClick}
						key={`reaction-bar-${subscriptionKey}`}
					/>

					<CommentInput
						inputRef={inputRef as RefObject<HTMLInputElement>}
						onClick={handleCommentClick}
					/>
				</div>
			)}

			<div className='block lg:hidden'>
				{voteButton && canVote(postData.onChainInfo?.status) && (
					<div className='relative z-50 pt-5'>
						<VoteReferendumButton
							index={postData?.index?.toString() || ''}
							btnClassName='bg-transparent border border-navbar_border text-text_pink hover:bg-transparent hover:text-text_pink font-semibold'
							size='sm'
							track={postData.onChainInfo?.origin}
							proposalType={postData.proposalType}
						/>
					</div>
				)}
			</div>

			<CommentModal
				isDialogOpen={isDialogOpen}
				setIsDialogOpen={setIsDialogOpen}
				postData={postData}
				onCommentAdded={() => setCommentCount((prev) => (prev ? prev + 1 : 1))}
			/>
		</div>
	);
}

export default ActivityFeedPostItem;
