// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { EReaction, IActivityFeedPostListing } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { IoShareSocialOutline } from 'react-icons/io5';
import CommentIcon from '@assets/activityfeed/commentdark.svg';
import Image from 'next/image';
import ReactionButton from './ReactionButton/ReactionButton';

function ActionButton({ icon: Icon, text, onClick }: { icon: React.ReactNode; text: string; onClick: () => void }) {
	return (
		<button
			type='button'
			className='flex cursor-pointer items-center'
			onClick={onClick}
		>
			{Icon}
			<span>{text}</span>
		</button>
	);
}

function ReactionHandler({
	postData,
	setIsDialogOpen,
	reactionState,
	showLikeGif,
	showDislikeGif,
	handleReaction
}: {
	postData: IActivityFeedPostListing;
	setIsDialogOpen: (value: boolean) => void;
	reactionState: {
		isLiked: boolean;
		isDisliked: boolean;
		likesCount: number;
		dislikesCount: number;
	};
	showLikeGif: boolean;
	showDislikeGif: boolean;
	handleReaction: (reaction: EReaction) => void;
}) {
	const router = useRouter();
	const { user } = useUser();
	const t = useTranslations();

	const UserReaction = postData?.userReaction?.userId === user?.id ? postData?.userReaction?.reaction : null;

	const currentReactionState = {
		...reactionState,
		isLiked: UserReaction === EReaction.like,
		isDisliked: UserReaction === EReaction.dislike
	};

	const handleAuthenticatedAction = (action: () => void) => {
		if (!user?.id) {
			router.push('/login');
			return;
		}
		action();
	};

	const handleShare = () => {
		const titlePart = postData?.title ? ` for ${postData.title}` : '';
		const message = `The referendum${titlePart} is now live for @Polkassembly \nCast your vote here: ${global?.window?.location?.href}`;
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
	return (
		<div className='mb-4 flex items-center justify-between text-sm text-navbar_border'>
			<div className='flex space-x-4'>
				<ReactionButton
					type={EReaction.like}
					isActive={currentReactionState.isLiked}
					showGif={showLikeGif}
					onClick={handleLike}
				/>
				<ReactionButton
					type={EReaction.dislike}
					isActive={currentReactionState.isDisliked}
					showGif={showDislikeGif}
					onClick={handleDislike}
				/>
				<ActionButton
					icon={<IoShareSocialOutline className='mr-2 text-lg' />}
					text={t('ActivityFeed.PostItem.share')}
					onClick={handleShare}
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
			</div>
		</div>
	);
}

export default ReactionHandler;
