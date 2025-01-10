// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { RefObject, useRef, useState } from 'react';
import Image from 'next/image';
import { FaRegClock } from 'react-icons/fa6';
import { IoShareSocialOutline } from 'react-icons/io5';
import CommentIcon from '@assets/activityfeed/commentdark.svg';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import VoteIcon from '@assets/activityfeed/vote.svg';
import { IPostListing } from '@/_shared/types';
import { groupBeneficiariesByAsset } from '@/app/_client-utils/beneficiaryUtils';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { calculateDecisionProgress } from '@/app/_client-utils/calculateDecisionProgress';
import { getTimeRemaining } from '@/app/_client-utils/getTimeRemaining';
import { calculatePercentage } from '@/app/_client-utils/calculatePercentage';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import Address from '@ui/Profile/Address/Address';
import StatusTag from '@ui/StatusTag/StatusTag';
import { getSpanStyle } from '@ui/TopicTag/TopicTag';
import ReactionButton from '../ReactionButton/ReactionButton';
import VotingProgress from '../VotingProgress/VotingProgress';
import CommentInput from '../CommentInput/CommentInput';
import styles from './ActivityFeedPostItem.module.scss';

function ActivityFeedPostItem({ postData }: { postData: IPostListing }) {
	const { user } = useUser();
	const inputRef = useRef<HTMLInputElement>(null);
	const [showLikeGif, setShowLikeGif] = useState(false);
	const [showDislikeGif, setShowDislikeGif] = useState(false);
	const [reactionState, setReactionState] = useState({
		isLiked: false,
		isDisliked: false,
		likesCount: postData?.metrics?.reactions?.like || 0,
		dislikesCount: postData?.metrics?.reactions?.dislike || 0
	});
	const ANIMATION_DURATION = 1500;

	const handleReaction = (type: 'like' | 'dislike') => {
		const isLikeAction = type === 'like';
		const showGifSetter = isLikeAction ? setShowLikeGif : setShowDislikeGif;
		const currentState = isLikeAction ? reactionState.isLiked : reactionState.isDisliked;

		if (!currentState) {
			showGifSetter(true);
			setTimeout(() => showGifSetter(false), ANIMATION_DURATION);

			setReactionState((prev) => ({
				isLiked: isLikeAction,
				isDisliked: !isLikeAction,
				likesCount: prev.likesCount + (isLikeAction ? 1 : prev.isLiked ? -1 : 0),
				dislikesCount: prev.dislikesCount + (!isLikeAction ? 1 : prev.isDisliked ? -1 : 0)
			}));
		} else {
			setReactionState((prev) => ({
				...prev,
				isLiked: isLikeAction ? false : prev.isLiked,
				isDisliked: !isLikeAction ? false : prev.isDisliked,
				likesCount: prev.likesCount + (isLikeAction ? -1 : 0),
				dislikesCount: prev.dislikesCount + (!isLikeAction ? -1 : 0)
			}));
		}
	};

	const totalValue = BigInt(postData.onChainInfo?.voteMetrics?.aye.value || '0') + BigInt(postData.onChainInfo?.voteMetrics?.nay.value || '0');
	const ayePercent = calculatePercentage(postData.onChainInfo?.voteMetrics?.aye.value || '0', totalValue);
	const nayPercent = calculatePercentage(postData.onChainInfo?.voteMetrics?.nay.value || '0', totalValue);
	const decisionPeriodPercentage = postData.onChainInfo?.decisionPeriodEndsAt ? calculateDecisionProgress(postData.onChainInfo?.decisionPeriodEndsAt) : 0;

	const timeRemaining = postData.onChainInfo?.decisionPeriodEndsAt ? getTimeRemaining(postData.onChainInfo?.decisionPeriodEndsAt) : null;
	const formattedTime = timeRemaining ? `Deciding ends in ${timeRemaining.days}d : ${timeRemaining.hours}hrs : ${timeRemaining.minutes}mins` : 'Decision period has ended.';

	return (
		<div className='rounded-xl border border-gray-200 bg-white p-5 shadow-md'>
			{/* Header Section */}
			<div className='mb-3 flex items-center justify-between'>
				<div className='flex items-center space-x-2 text-wallet_btn_text'>
					<span className='text-xl font-bold'>
						{postData.onChainInfo?.beneficiaries && postData.onChainInfo?.beneficiaries.length > 0 && (
							<div className={styles.beneficiaryContainer}>
								{Object.entries(groupBeneficiariesByAsset(postData.onChainInfo?.beneficiaries, postData.network)).map(([assetId, amount]) => (
									<div
										key={assetId}
										className={styles.requestedAmount}
									>
										<span>
											{formatUSDWithUnits(
												formatBnBalance(
													amount.toString(),
													{ withUnit: true, numberAfterComma: 2 },
													postData.network,
													assetId === NETWORKS_DETAILS[postData.network].tokenSymbol ? null : assetId
												)
											)}
										</span>
									</div>
								))}
							</div>
						)}
					</span>
					<StatusTag status={postData.onChainInfo?.status.toLowerCase().replace(/\s+/g, '_') || ''} />
				</div>
				<div>
					<span className='flex gap-1 rounded-md border-[1px] border-solid border-navbar_border px-3 py-1 text-sm font-medium text-navbar_border'>
						<Image
							src={VoteIcon}
							alt=''
							width={20}
							height={20}
						/>
						<Link href='/login'>
							<span>{user?.id ? 'Cast Vote' : 'Login to vote'}</span>
						</Link>
					</span>
				</div>
			</div>

			{/* Post Info Section */}
			<div className='flex items-center justify-between gap-2'>
				<div className='mb-3 flex items-center gap-2 text-xs text-btn_secondary_text'>
					<span className='font-medium'>
						<Address address={postData.onChainInfo?.proposer || ''} />
					</span>
					<span>in</span>
					<span className={`${getSpanStyle(postData.onChainInfo?.origin || '', 1)} ${styles.originStyle}`}>{postData.onChainInfo?.origin}</span>
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
			<p className='mb-4 text-sm text-btn_secondary_text'>
				{postData.content?.slice(0, 400)}
				<Link
					href={`/referenda/${postData.index}`}
					className='ml-1 cursor-pointer text-xs font-medium text-blue-600'
				>
					Read more
				</Link>
			</p>

			{/* Metrics Section */}
			<div className='flex items-center justify-end'>
				<div className='flex items-center gap-2 text-xs text-btn_secondary_text'>
					<span>{reactionState.likesCount} likes</span>
					<span>|</span>
					<span>{reactionState.dislikesCount} dislikes</span>
					<span>|</span>
					<span>{postData?.metrics?.comments} comments</span>
				</div>
			</div>

			<hr className='my-4 border-[0.7px] border-primary_border' />

			{/* Reaction Buttons Section */}
			<div className='mb-4 flex items-center justify-between text-sm text-navbar_border'>
				<div className='flex space-x-4'>
					<ReactionButton
						type='like'
						isActive={reactionState.isLiked}
						showGif={showLikeGif}
						onClick={() => handleReaction('like')}
					/>
					<ReactionButton
						type='dislike'
						isActive={reactionState.isDisliked}
						showGif={showDislikeGif}
						onClick={() => handleReaction('dislike')}
					/>
					<button
						type='button'
						className='flex cursor-pointer items-center'
					>
						<IoShareSocialOutline className={`${styles.activity_icons} mr-2 text-lg`} />
						<span>Share</span>
					</button>
					<button
						type='button'
						className='flex cursor-pointer items-center'
					>
						<Image
							src={CommentIcon}
							className='mr-2'
							alt='Comment'
							width={16}
							height={16}
						/>
						<span>Comment</span>
					</button>
				</div>
			</div>

			<CommentInput inputRef={inputRef as RefObject<HTMLInputElement>} />
		</div>
	);
}

export default ActivityFeedPostItem;
