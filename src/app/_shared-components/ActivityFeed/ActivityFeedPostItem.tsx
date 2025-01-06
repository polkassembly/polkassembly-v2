// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useRef, useState } from 'react';
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
import relativeTime from 'dayjs/plugin/relativeTime';
import styles from './ActivityFeedPostItem.module.scss';
import Address from '../Profile/Address/Address';

dayjs.extend(utc);
dayjs.extend(relativeTime);

interface PostData {
	id: number;
	amount: number;
	equivalentUSD: number;
	status: string;
	proposer: string;
	category: string;
	date: string;
	title: string;
	description: string;
	likes: number;
	dislikes: number;
	comments: number;
	shares: number;
	approvalRating: number;
	reactions?: {
		userAddress: string;
		reaction: 'like' | 'dislike';
	}[];
}

interface ReactionState {
	isLiked: boolean;
	isDisliked: boolean;
	likesCount: number;
	dislikesCount: number;
}

const COMMENT_PLACEHOLDER = 'Type your comment here';
const POST_LABEL = 'Post';
const ANIMATION_DURATION = 1500;

function ActivityFeedPostItem({ postData }: { postData: PostData }) {
	const { user } = useUser();
	const inputRef = useRef<HTMLInputElement>(null);
	const [showLikeGif, setShowLikeGif] = useState(false);
	const [showDislikeGif, setShowDislikeGif] = useState(false);

	const [reactionState, setReactionState] = useState<ReactionState>({
		isLiked: false,
		isDisliked: false,
		likesCount: postData.likes,
		dislikesCount: postData.dislikes
	});

	const formatDate = (date: string) => {
		return dayjs.utc(date).fromNow();
	};

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

	return (
		<div className='rounded-xl border border-gray-200 bg-white p-5 shadow-md'>
			<div className='mb-3 flex items-center justify-between'>
				<div className='flex items-center space-x-2 text-wallet_btn_text'>
					<span className='text-xl font-bold'>{postData.amount}DOT</span>
					<span className='rounded-md bg-[#F3F4F6] p-2 py-1.5 text-xs'>~ ${postData.equivalentUSD}</span>
					{postData.status.toLowerCase() === 'active' && <span className='rounded-full bg-[#2ED47A] px-3 py-1 text-xs font-medium text-white'>{postData.status}</span>}
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

			<div className='mb-3 flex items-center gap-2 text-xs text-btn_secondary_text'>
				<span className='font-medium'>
					<Address address={postData.proposer} />
				</span>
				<span>in</span>
				<span className='rounded-md bg-red-100 px-2 py-1 text-[10px] font-medium text-red-600'>{postData.category}</span>
				<span>|</span>
				<span className='flex items-center gap-2'>
					<FaRegClock className='text-sm' />
					{formatDate(postData.date)}
				</span>
			</div>

			<h3 className='mb-2 text-sm font-medium text-btn_secondary_text'>{postData.title}</h3>
			<p className='mb-4 text-sm text-btn_secondary_text'>
				{postData.description}
				<span className='ml-1 cursor-pointer text-xs font-medium text-blue-600'>Read more</span>
			</p>

			<hr className='mb-3 border-[0.7px] border-primary_border' />

			<div className='mb-4 flex items-center justify-between text-sm text-navbar_border'>
				<div className='flex space-x-4'>
					<button
						className='relative flex cursor-pointer items-center'
						onClick={() => handleReaction('like')}
						type='button'
					>
						<div className='relative mr-1 w-[24px]'>
							{showLikeGif ? (
								<div className={styles.likeGifContainer}>
									<Image
										src={LikeGif}
										alt='Like Animation'
										width={24}
										className='h-10 w-10'
										height={24}
									/>
								</div>
							) : (
								<span>
									{reactionState.isLiked ? (
										<AiFillLike className={`${styles.activity_icons} text-lg text-text_pink`} />
									) : (
										<AiOutlineLike className={`${styles.activity_icons} text-lg`} />
									)}
								</span>
							)}
						</div>
						<span className={reactionState.isLiked ? 'text-text_pink' : ''}>{reactionState.isLiked ? 'Liked' : 'Like'}</span>
					</button>

					<button
						className='relative flex cursor-pointer items-center'
						onClick={() => handleReaction('dislike')}
						type='button'
					>
						<div className='relative mr-1 w-[24px]'>
							{' '}
							{showDislikeGif ? (
								<div className={styles.dislikeGifContainer}>
									<Image
										src={LikeGif}
										alt='Dislike Animation'
										className='h-10 w-10'
										width={24}
										height={24}
										style={{ transform: 'scaleY(-1)' }}
									/>
								</div>
							) : (
								<span>
									{reactionState.isDisliked ? (
										<AiFillDislike className={`${styles.activity_icons} text-lg text-text_pink`} />
									) : (
										<AiOutlineDislike className={`${styles.activity_icons} text-lg`} />
									)}
								</span>
							)}
						</div>
						<span className={reactionState.isDisliked ? 'text-text_pink' : ''}>{reactionState.isDisliked ? 'Disliked' : 'Dislike'}</span>
					</button>

					<button
						type='button'
						className='flex cursor-pointer items-center'
					>
						<IoShareSocialOutline className={`${styles.activity_icons} mr-2 text-lg`} />
						<span>Share </span>
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
				<span className='text-gray-600'>{postData.approvalRating}%</span>
			</div>

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
					<span className='px-2 text-sm text-[#576D8B] text-opacity-[80%]'>{COMMENT_PLACEHOLDER}</span>
				</div>
				<button
					type='button'
					className='h-9 w-28 cursor-pointer rounded-r-md border border-solid border-[#D2D8E0] bg-[#485F7D] bg-opacity-[5%] text-[#243A57] dark:border dark:border-solid dark:border-[#4B4B4B] dark:bg-[#262627] dark:text-white'
				>
					<span className='px-2 text-sm text-btn_secondary_text'>{POST_LABEL}</span>
				</button>
			</div>
		</div>
	);
}

export default ActivityFeedPostItem;
