// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { RefObject, useRef, useState } from 'react';
import Image from 'next/image';
import { FaRegClock } from 'react-icons/fa6';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import VoteIcon from '@assets/activityfeed/vote.svg';
import { IActivityFeedPostListing } from '@/_shared/types';
import { groupBeneficiariesByAsset } from '@/app/_client-utils/beneficiaryUtils';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { calculateDecisionProgress } from '@/app/_client-utils/calculateDecisionProgress';
import { getTimeRemaining } from '@/app/_client-utils/getTimeRemaining';
import { calculatePercentage } from '@/app/_client-utils/calculatePercentage';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { BN } from '@polkadot/util';
import Address from '@ui/Profile/Address/Address';
import dynamic from 'next/dynamic';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import StatusTag from '@ui/StatusTag/StatusTag';
import { getSpanStyle } from '@ui/TopicTag/TopicTag';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { usePostReactions } from '@/hooks/usePostReactions';
import { canVote } from '@/_shared/_utils/canVote';
import VotingProgress from '../VotingProgress/VotingProgress';
import CommentInput from '../CommentInput/CommentInput';
import styles from './ActivityFeedPostItem.module.scss';
import CommentModal from '../CommentModal/CommentModal';
import ReactionHandler from '../ReactionHandler';
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle } from '../../Dialog/Dialog';
import VoteReferendum from '../../PostDetails/VoteReferendum/VoteReferendum';

const BlockEditor = dynamic(() => import('@ui/BlockEditor/BlockEditor'), { ssr: false });

function ActivityFeedPostItem({ postData }: { postData: IActivityFeedPostListing }) {
	const { user } = useUser();
	const router = useRouter();
	const t = useTranslations();
	const inputRef = useRef<HTMLInputElement>(null);
	const network = getCurrentNetwork();
	const [commentCount, setCommentCount] = useState(postData?.metrics?.comments || 0);

	const { reactionState, showLikeGif, showDislikeGif, handleReaction } = usePostReactions(postData);

	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const handleCommentClick = () => {
		if (!user?.id) {
			router.push('/login');
		} else {
			setIsDialogOpen(true);
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

	const formatOriginText = (text: string): string => {
		return text.replace(/([A-Z])/g, ' $1').trim();
	};

	const handleContainerClick = (e: React.MouseEvent) => {
		if (!(e.target instanceof Element)) return;

		const isExcludedSection =
			e.target.closest(`.${styles.castVoteButton}`) || e.target.closest('[data-reaction-handler="true"]') || e.target.closest('[data-comment-input="true"]');

		if (!isExcludedSection) {
			router.push(`/referenda/${postData.index}`);
		}
	};

	return (
		<div
			aria-hidden='true'
			onClick={handleContainerClick}
			className={styles.container}
		>
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
				{canVote(postData.onChainInfo?.status, postData.onChainInfo?.preparePeriodEndsAt) && (
					<div>
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
							<Link href='/login'>
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
					<span className='font-medium'>
						<Address address={postData.onChainInfo?.proposer || ''} />
					</span>
					<span>in</span>
					<span className={`${getSpanStyle(postData.onChainInfo?.origin || '', 1)} ${styles.originStyle}`}>{formatOriginText(postData.onChainInfo?.origin || '')}</span>
					<span>|</span>
					<span className='flex items-center gap-2'>
						<FaRegClock className='text-sm' />
						{dayjs.utc(postData.onChainInfo?.createdAt).fromNow()}
					</span>
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
			<div className='flex gap-2'>
				<h3 className='mb-2 text-sm font-medium text-btn_secondary_text'>#{postData.index}</h3>
				<h3 className='mb-2 text-sm font-medium text-btn_secondary_text'>{postData.title}</h3>
			</div>
			<div className='mb-4 text-sm text-btn_secondary_text'>
				<div className='flex max-h-40 w-96 overflow-hidden border-none lg:w-full'>
					<BlockEditor
						data={postData.content}
						readOnly
						id={`post-content-${postData.index}`}
					/>
				</div>
				<Link
					href={`/referenda/${postData.index}`}
					className='ml-1 cursor-pointer text-xs font-medium text-blue-600'
				>
					{t('ActivityFeed.PostItem.readMore')}
				</Link>
			</div>

			{/* Metrics Section */}
			{(reactionState.likesCount > 0 || reactionState.dislikesCount > 0 || commentCount > 0) && (
				<div className='flex items-center justify-end'>
					<div className='flex items-center gap-2 text-xs text-text_primary'>
						<span>
							{reactionState.likesCount} {t('ActivityFeed.PostItem.likes')}
						</span>
						<span>|</span>

						<span>
							{reactionState.dislikesCount} {t('ActivityFeed.PostItem.dislikes')}
						</span>
						<span>|</span>

						<span>
							{commentCount} {t('ActivityFeed.PostItem.comments')}
						</span>
					</div>
				</div>
			)}

			<hr className='my-4 border-[0.7px] border-primary_border' />

			{/* Reaction Buttons Section */}
			<div
				aria-hidden='true'
				onClick={(e) => e.stopPropagation()}
				data-comment-input='true'
			>
				<ReactionHandler
					postData={postData}
					setIsDialogOpen={setIsDialogOpen}
					reactionState={reactionState}
					showLikeGif={showLikeGif}
					showDislikeGif={showDislikeGif}
					handleReaction={handleReaction}
				/>

				<CommentInput
					inputRef={inputRef as RefObject<HTMLInputElement>}
					onClick={handleCommentClick}
				/>
			</div>

			<CommentModal
				isDialogOpen={isDialogOpen}
				setIsDialogOpen={setIsDialogOpen}
				postData={postData}
				onCommentAdded={() => setCommentCount((prev) => prev + 1)}
			/>
		</div>
	);
}

export default ActivityFeedPostItem;
