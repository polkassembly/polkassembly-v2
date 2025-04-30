// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { IoShareSocialOutline } from '@react-icons/all-files/io5/IoShareSocialOutline';
import { BsThreeDots } from '@react-icons/all-files/bs/BsThreeDots';
import { IoBookmark } from '@react-icons/all-files/io5/IoBookmark';
import { IoBookmarkOutline } from '@react-icons/all-files/io5/IoBookmarkOutline';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/_shared-components/DropdownMenu';
import { EReaction, IPostListing } from '@/_shared/types';
import ReactionButton from './ReactionButton/ReactionButton';

function ReactionBar({
	postData,
	isLiked,
	isDisliked,
	showLikeGif,
	showDislikeGif,
	handleReaction,
	isSubscribed,
	handleSubscribe
}: {
	postData: IPostListing;
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

	const isCurrentlySubscribed = useMemo(() => !!isSubscribed, [isSubscribed]);

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

	return (
		<div className='mb-1.5 flex items-center justify-between text-xs text-navbar_border'>
			<div className='flex space-x-3 md:space-x-7'>
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

				{handleSubscribe && (
					<button
						type='button'
						className='flex cursor-pointer items-center text-bg_pink transition-all duration-300 hover:scale-110'
						onClick={() => handleAuthenticatedAction(handleSubscribe)}
					>
						{isCurrentlySubscribed ? <IoBookmark className='mr-2 h-4 w-4 text-bg_pink' /> : <IoBookmarkOutline className='mr-2 h-4 w-4 text-text_pink' />}
						<span className='text-bg_pink'>{isCurrentlySubscribed ? t('ActivityFeed.unsubscribe') : t('ActivityFeed.subscribe')}</span>
					</button>
				)}

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
