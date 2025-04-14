// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { IoShareSocialOutline } from 'react-icons/io5';
import { BsThreeDots } from 'react-icons/bs';
import { RiBookmarkLine, RiBookmarkFill } from 'react-icons/ri';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/_shared-components/DropdownMenu';
import CommentIcon from '@assets/activityfeed/commentdark.svg';
import { EReaction, IPostListing } from '@/_shared/types';
import ReactionButton from './ReactionButton/ReactionButton';

function ActionButton({ icon: Icon, text, onClick, className }: { icon: React.ReactNode; text?: string; onClick: () => void; className?: string }) {
	return (
		<button
			type='button'
			className={`flex cursor-pointer items-center text-bg_pink transition-all duration-300 hover:scale-110 ${className || ''}`}
			onClick={onClick}
		>
			{Icon}
			{text && <span>{text}</span>}
		</button>
	);
}

function ReactionBar({
	postData,
	setIsDialogOpen,
	isLiked,
	isDisliked,
	showLikeGif,
	showDislikeGif,
	handleReaction,
	isSubscribed,
	handleSubscribe
}: {
	postData: IPostListing;
	setIsDialogOpen: (value: boolean) => void;

	isLiked: boolean;
	isDisliked: boolean;
	showLikeGif: boolean;
	showDislikeGif: boolean;
	handleReaction: (reaction: EReaction) => void;
	isSubscribed?: boolean;
	handleSubscribe?: () => void;
}) {
	const router = useRouter();
	const { user } = useUser();
	const t = useTranslations();

	const handleAuthenticatedAction = (action: () => void) => {
		if (!user?.id) {
			router.push('/login');
			return;
		}
		action();
	};

	const handleShare = () => {
		const titlePart = postData?.title ? `for "${postData.title}"` : '';
		const message = `The referendum ${titlePart} is now live for @Polkassembly \nCast your vote here: ${global?.window?.location?.href}`;
		const twitterParameters = [`text=${encodeURIComponent(message)}`, `via=${encodeURIComponent('polk_gov')}`];
		const url = `https://twitter.com/intent/tweet?${twitterParameters.join('&')}`;
		global?.window?.open(url);
	};

	const handleLike = () => handleAuthenticatedAction(() => handleReaction(EReaction.like));
	const handleDislike = () => handleAuthenticatedAction(() => handleReaction(EReaction.dislike));

	const handleCommentClick = () => {
		if (!user?.id) {
			router.push('/login');
		} else {
			setIsDialogOpen(true);
		}
	};
	const isCurrentlySubscribed = postData?.userSubscriptionId || isSubscribed;
	return (
		<div className='mb-1.5 flex items-center justify-between text-xs text-navbar_border'>
			<div className='flex space-x-3 md:space-x-5'>
				<ReactionButton
					type={EReaction.like}
					isActive={isLiked}
					showGif={showLikeGif}
					onClick={handleLike}
				/>
				<ReactionButton
					type={EReaction.dislike}
					isActive={isDisliked}
					showGif={showDislikeGif}
					onClick={handleDislike}
				/>

				<ActionButton
					icon={
						<Image
							src={CommentIcon}
							className='mr-2'
							alt='Comment'
							width={16}
							height={16}
						/>
					}
					text={t('ActivityFeed.PostItem.comment')}
					onClick={handleCommentClick}
				/>

				<DropdownMenu>
					<DropdownMenuTrigger
						asChild
						className='border-none'
						noArrow
					>
						<BsThreeDots className='text-lg text-bg_pink' />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align='start'
						className='w-40 bg-bg_modal'
					>
						{handleSubscribe && (
							<DropdownMenuItem
								className='cursor-pointer'
								onClick={() => handleAuthenticatedAction(handleSubscribe)}
							>
								{isCurrentlySubscribed ? <RiBookmarkFill className='mr-2 text-bg_pink' /> : <RiBookmarkLine className='mr-2 text-basic_text' />}
								<span className={`${isCurrentlySubscribed ? 'text-bg_pink' : 'text-basic_text'}`}>
									{isCurrentlySubscribed ? t('ActivityFeed.unsubscribe') : t('ActivityFeed.subscribe')}
								</span>
							</DropdownMenuItem>
						)}
						<DropdownMenuItem
							className='cursor-pointer'
							onClick={handleShare}
						>
							<IoShareSocialOutline className='mr-2 text-basic_text' />
							<span className='text-basic_text'>{t('ActivityFeed.share')}</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

export default ReactionBar;
