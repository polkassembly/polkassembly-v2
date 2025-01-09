// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { RefObject, useRef, useState } from 'react';
import Image from 'next/image';
import userIcon from '@assets/profile/user-icon.svg';
import { FaRegClock } from 'react-icons/fa6';
import { AiOutlineLike, AiOutlineDislike, AiFillLike, AiFillDislike } from 'react-icons/ai';
import { IoShareSocialOutline } from 'react-icons/io5';
import CommentIcon from '@assets/activityfeed/commentdark.svg';
import { useUser } from '@/hooks/useUser';
import LikeGif from '@assets/reactions/Liked-Colored.gif';
import Link from 'next/link';
import VoteIcon from '@assets/activityfeed/vote.svg';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { IPostListing } from '@/_shared/types';
import relativeTime from 'dayjs/plugin/relativeTime';
import { groupBeneficiariesByAsset } from '@/app/_client-utils/beneficiaryUtils';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { calculateDecisionProgress } from '@/app/_client-utils/calculateDecisionProgress';
import { getTimeRemaining } from '@/app/_client-utils/getTimeRemaining';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import styles from './ActivityFeedPostItem.module.scss';
import Address from '../../Profile/Address/Address';
import StatusTag from '../../StatusTag/StatusTag';
import { getSpanStyle } from '../../TopicTag/TopicTag';
import { Progress } from '../../progress';
import VotingBar from '../../ListingComponent/VotingBar/VotingBar';

dayjs.extend(utc);
dayjs.extend(relativeTime);

const CONSTANTS = {
	COMMENT_PLACEHOLDER: 'Type your comment here',
	POST_LABEL: 'Post',
	ANIMATION_DURATION: 1500
};

// Utility functions
const formatDate = (date?: Date | string) => {
	if (!date) return '';
	return dayjs.utc(date).fromNow();
};

const calculatePercentage = (value: string | number, totalValue: bigint | number) => {
	if (typeof totalValue === 'bigint') {
		if (totalValue === BigInt(0)) return 0;
		const valueBI = BigInt(value);
		return Number((valueBI * BigInt(100) * BigInt(100)) / totalValue) / 100;
	}
	if (totalValue === 0) return 0;
	return (Number(value) * 100) / totalValue;
};

// Subcomponents
function ReactionButton({ type, isActive, showGif, onClick }: { type: 'like' | 'dislike'; isActive: boolean; showGif: boolean; onClick: () => void }) {
	const Icon = type === 'like' ? (isActive ? AiFillLike : AiOutlineLike) : isActive ? AiFillDislike : AiOutlineDislike;

	return (
		<button
			className='relative flex cursor-pointer items-center'
			onClick={onClick}
			type='button'
		>
			<div className='relative mr-1 w-[24px]'>
				{showGif ? (
					<div className={type === 'like' ? styles.likeGifContainer : styles.dislikeGifContainer}>
						<Image
							src={LikeGif}
							alt={`${type} Animation`}
							width={24}
							className='h-10 w-10'
							height={24}
							style={type === 'dislike' ? { transform: 'scaleY(-1)' } : undefined}
						/>
					</div>
				) : (
					<Icon className={`${styles.activity_icons} text-lg ${isActive ? 'text-text_pink' : ''}`} />
				)}
			</div>
			<span className={isActive ? 'text-text_pink' : ''}>{isActive ? `${type}d` : type}</span>
		</button>
	);
}

interface VotingMetricsProps {
	postData: IPostListing;
	ayePercent: number;
	nayPercent: number;
}

function VotingMetrics({ postData, ayePercent, nayPercent }: VotingMetricsProps) {
	return (
		<>
			<span>|</span>
			<Tooltip>
				<TooltipTrigger asChild>
					<div>
						<VotingBar
							ayePercent={ayePercent}
							nayPercent={nayPercent}
						/>
					</div>
				</TooltipTrigger>
				<TooltipContent
					side='top'
					align='center'
				>
					<div className={styles.progressBarContainer}>
						<p>
							Aye ={' '}
							{formatUSDWithUnits(
								formatBnBalance(postData.onChainInfo?.voteMetrics?.aye.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, postData.network)
							)}{' '}
							({ayePercent.toFixed(2)}%)
						</p>
						<p>
							Nay ={' '}
							{formatUSDWithUnits(
								formatBnBalance(postData.onChainInfo?.voteMetrics?.nay.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, postData.network)
							)}{' '}
							({nayPercent.toFixed(2)}%)
						</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</>
	);
}

interface VotingProgressProps {
	timeRemaining: { days: number; hours: number; minutes: number } | null;
	decisionPeriodPercentage: number;
	formattedTime: string;
	ayePercent: number;
	nayPercent: number;
	postData: IPostListing;
}

function VotingProgress({ timeRemaining, decisionPeriodPercentage, formattedTime, ayePercent, nayPercent, postData }: VotingProgressProps) {
	return (
		<div className='flex items-center gap-2'>
			{timeRemaining && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className='flex items-center gap-1'>
							<div className='w-8'>
								<Progress
									value={decisionPeriodPercentage}
									className='h-1.5 bg-decision_bar_bg'
								/>
							</div>
						</div>
					</TooltipTrigger>
					<TooltipContent
						side='top'
						align='center'
					>
						<div className={styles.timeBarContainer}>
							<p>{formattedTime}</p>
						</div>
					</TooltipContent>
				</Tooltip>
			)}
			{ayePercent > 0 && nayPercent > 0 && (
				<VotingMetrics
					postData={postData}
					ayePercent={ayePercent}
					nayPercent={nayPercent}
				/>
			)}
		</div>
	);
}

function CommentInput({ inputRef }: { inputRef: React.RefObject<HTMLInputElement> }) {
	return (
		<div className='flex items-center'>
			<Image
				src={userIcon}
				alt='User Icon'
				className='h-7 w-7 rounded-full'
				width={32}
				height={32}
			/>
			<div
				ref={inputRef}
				className='flex h-9 w-full flex-col justify-center rounded-l-md border-y border-l border-r-0 border-solid border-[#D2D8E0] outline-none dark:border dark:border-solid dark:border-[#4B4B4B] lg:ml-4 xl:ml-3'
			>
				<span className='px-2 text-sm text-[#576D8B] text-opacity-[80%]'>{CONSTANTS.COMMENT_PLACEHOLDER}</span>
			</div>
			<button
				type='button'
				className='h-9 w-28 cursor-pointer rounded-r-md border border-solid border-[#D2D8E0] bg-[#485F7D] bg-opacity-[5%] text-[#243A57] dark:border dark:border-solid dark:border-[#4B4B4B] dark:bg-[#262627] dark:text-white'
			>
				<span className='px-2 text-sm text-btn_secondary_text'>{CONSTANTS.POST_LABEL}</span>
			</button>
		</div>
	);
}

function ActivityFeedPostItem({ postData, totalCount }: { postData: IPostListing; totalCount: number }) {
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

	console.log('totalCount', totalCount);
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
						{formatDate(postData.onChainInfo?.createdAt)}
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
