// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { RefObject, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { FaRegClock } from 'react-icons/fa6';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import VoteIcon from '@assets/activityfeed/vote.svg';
import { EActivityFeedTab, IPostListing } from '@/_shared/types';
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
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePostReactions, type SubscriptionResult } from '@/hooks/usePostReactions';
import { canVote } from '@/_shared/_utils/canVote';
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle } from '@ui/Dialog/Dialog';
import VoteReferendum from '@ui/PostDetails/VoteReferendum/VoteReferendum';
import { MarkdownEditor } from '@/app/_shared-components/MarkdownEditor/MarkdownEditor';
import { ClientError } from '@/app/_client-utils/clientError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
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
	const searchParams = useSearchParams();
	const isInSubscriptionTab = useMemo(() => {
		return searchParams?.get('tab') === EActivityFeedTab.SUBSCRIBED;
	}, [searchParams]);
	const t = useTranslations();
	const inputRef = useRef<HTMLInputElement>(null);
	const network = getCurrentNetwork();
	const [commentCount, setCommentCount] = useState(postData?.metrics?.comments);

	const { reactionState, showLikeGif, showDislikeGif, handleReaction, isSubscribed, handleSubscribe } = usePostReactions({
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

			const result = (await handleSubscribe()) as SubscriptionResult;

			if (isInSubscriptionTab && result.wasUnsubscribed && !result.error) {
				onUnsubscribe?.((postData?.index ?? postData?.hash)!);
			}
		} catch (error) {
			console.error('Error handling subscription:', error);
			// TODO: add toast instead of console.error
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
	const formatOriginText = (text: string): string => {
		return text.replace(/([A-Z])/g, ' $1').trim();
	};

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
					<span className='text-xl font-bold'>
						{postData.onChainInfo?.beneficiaries && Array.isArray(postData.onChainInfo.beneficiaries) && postData.onChainInfo.beneficiaries.length > 0 && (
							<div className={`${styles.beneficiaryContainer} mr-2 text-xl font-semibold text-wallet_btn_text`}>
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
				{voteButton && canVote(postData.onChainInfo?.status, postData.onChainInfo?.preparePeriodEndsAt) && (
					<div className='relative z-50'>
						{user?.id ? (
							<Dialog>
								<DialogTrigger asChild>
									<span className={`${styles.castVoteButton} cursor-pointer`}>
										<Image
											src={VoteIcon}
											alt=''
											width={20}
											height={20}
										/>
										<span>{t('PostDetails.castVote')}</span>
									</span>
								</DialogTrigger>
								<DialogTitle>
									<DialogContent className='max-w-xl p-6'>
										<DialogHeader className='text-xl font-semibold text-text_primary'>{t('PostDetails.castYourVote')}</DialogHeader>
										<VoteReferendum index={postData?.index?.toString() || ''} />
									</DialogContent>
								</DialogTitle>
							</Dialog>
						) : (
							<Link
								href='/login'
								className='relative z-50'
							>
								<span className={`${styles.castVoteButton} cursor-pointer`}>
									<Image
										src={VoteIcon}
										alt=''
										width={20}
										height={20}
									/>
									<span>{t('PostDetails.loginToVote')}</span>
								</span>
							</Link>
						)}
					</div>
				)}
			</div>

			{/* Post Info Section */}
			<div className='flex items-center justify-between gap-2'>
				<div className='mb-3 flex items-center gap-2 text-xs text-btn_secondary_text'>
					<span className='z-50 font-medium'>
						<Address address={postData.onChainInfo?.proposer || ''} />
					</span>
					<span>in</span>
					<span className={`${getSpanStyle(postData.onChainInfo?.origin || '', 1)} ${styles.originStyle}`}>{formatOriginText(postData.onChainInfo?.origin || '')}</span>
					{postData.onChainInfo?.createdAt && (
						<>
							<span>|</span>
							<span className='flex items-center gap-2'>
								<FaRegClock className='text-sm' />
								{dayjs(postData.onChainInfo?.createdAt).fromNow()}
							</span>
						</>
					)}
				</div>
				<VotingProgress
					timeRemaining={timeRemaining}
					decisionPeriodPercentage={decisionPeriodPercentage}
					formattedTime={formattedTime}
					ayePercent={ayePercent}
					nayPercent={nayPercent}
					postData={postData}
				/>
			</div>

			{/* Post Content Section */}
			<div>
				<h3 className='mb-2 text-sm font-medium text-btn_secondary_text'>{`#${postData.index} ${postData.title}`}</h3>
				<div className='mb-4 text-sm text-btn_secondary_text'>
					<div className='-ml-2.5 flex max-h-40 w-full overflow-hidden border-none'>
						<MarkdownEditor
							markdown={postData.content}
							readOnly
						/>
					</div>
					<Link
						href={`/referenda/${postData.index}`}
						className='relative z-50 ml-1 cursor-pointer text-xs font-medium text-blue-600'
					>
						{t('ActivityFeed.PostItem.readMore')}
					</Link>
				</div>
			</div>

			{/* Metrics Section */}
			{(likeCount || dislikeCount || commentCount !== null) && (
				<div className='flex items-center justify-end'>
					<div className='flex items-center gap-2 text-xs text-text_primary'>
						<span>
							{likeCount} {t('ActivityFeed.PostItem.likes')}
						</span>
						<span>|</span>

						<span>
							{dislikeCount} {t('ActivityFeed.PostItem.dislikes')}
						</span>
						<span>|</span>

						<span>
							{commentCount} {t('ActivityFeed.PostItem.comments')}
						</span>
					</div>
				</div>
			)}

			<hr className='mb-1 mt-3.5 border-[0.7px] border-primary_border' />

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
						setIsDialogOpen={setIsDialogOpen}
						isLiked={reactionState.isLiked}
						isDisliked={reactionState.isDisliked}
						showLikeGif={showLikeGif}
						showDislikeGif={showDislikeGif}
						handleReaction={handleReaction}
						isSubscribed={isSubscribed}
						handleSubscribe={handleSubscribeClick}
					/>

					<CommentInput
						inputRef={inputRef as RefObject<HTMLInputElement>}
						onClick={handleCommentClick}
					/>
				</div>
			)}

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
