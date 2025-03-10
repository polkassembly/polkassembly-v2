// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EReaction, IPostListing } from '@/_shared/types';
import { usePostReactions } from '@/hooks/usePostReactions';
import { useUser } from '@/hooks/useUser';
import { Share2 } from 'lucide-react';
import { RiBookmarkLine, RiBookmarkFill } from 'react-icons/ri';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import ReactionButton from '@/app/(home)/Components/ReactionButton/ReactionButton';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useState, useMemo, useEffect, useCallback } from 'react';

const SELECTED_TEXT_COLOR = 'text-bg_pink';

function PostActions({ postData }: { postData: IPostListing }) {
	const { user } = useUser();
	const router = useRouter();
	const { handleReaction, reactionState, showLikeGif, showDislikeGif } = usePostReactions(postData);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleAuthenticatedAction = useCallback(
		(action: () => void) => {
			if (!user?.id) {
				router.push('/login');
				return;
			}
			action();
		},
		[user?.id, router]
	);

	const { isLiked, isDisliked } = reactionState;

	const subscriptionParams = useMemo(
		() => ({
			proposalType: postData.proposalType,
			postIndex: String(postData.index)
		}),
		[postData.proposalType, postData.index]
	);

	const fetchSubscriptionStatus = useMemo(
		() => async () => {
			if (!user?.id) return;
			try {
				const status = await NextApiClientService.getPostSubscriptions(subscriptionParams.proposalType, subscriptionParams.postIndex);
				setIsSubscribed(status.data?.message === 'Subscription found');
			} catch (error) {
				console.error('Failed to fetch subscription status:', error);
			}
		},
		[user?.id, subscriptionParams]
	);

	const handleSubscribe = useMemo(
		() => async () => {
			handleAuthenticatedAction(async () => {
				try {
					setIsLoading(true);
					if (isSubscribed) {
						await NextApiClientService.deletePostSubscription(subscriptionParams.proposalType, subscriptionParams.postIndex);
					} else {
						await NextApiClientService.addPostSubscription(subscriptionParams.proposalType, subscriptionParams.postIndex);
					}
					setIsSubscribed(!isSubscribed);
				} catch (error) {
					console.error('Failed to update subscription:', error);
				} finally {
					setIsLoading(false);
				}
			});
		},
		[handleAuthenticatedAction, isSubscribed, subscriptionParams]
	);

	const subscribeButtonClasses = useMemo(
		() => cn('flex cursor-pointer items-center gap-1 rounded-md bg-grey_bg p-1.5', isSubscribed && SELECTED_TEXT_COLOR, isLoading && 'opacity-50'),
		[isSubscribed, isLoading]
	);

	const buttonText = useMemo(() => (isLoading ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'), [isLoading, isSubscribed]);

	useEffect(() => {
		fetchSubscriptionStatus();
	}, [fetchSubscriptionStatus]);

	const handleShare = () => {
		const titlePart = postData?.title ? ` for ${postData.title}` : '';
		const message = `The referendum${titlePart} is now live for @Polkassembly \nCast your vote here: ${global?.window?.location?.href}`;
		const twitterParameters = [`text=${encodeURIComponent(message)}`, `via=${encodeURIComponent('polk_gov')}`];
		const url = `https://twitter.com/intent/tweet?${twitterParameters.join('&')}`;
		global?.window?.open(url);
	};

	const handleLike = () => handleAuthenticatedAction(() => handleReaction(EReaction.like));
	const handleDislike = () => handleAuthenticatedAction(() => handleReaction(EReaction.dislike));

	return (
		<div>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<div
						role='button'
						aria-hidden
						onClick={handleLike}
						className='flex cursor-pointer items-center gap-1 rounded-md bg-grey_bg p-1.5'
					>
						<ReactionButton
							type={EReaction.like}
							isActive={isLiked}
							showGif={showLikeGif}
							showText={false}
							className={cn(isLiked ? SELECTED_TEXT_COLOR : 'text-basic_text', 'text-sm')}
						/>
					</div>
					<div
						role='button'
						aria-hidden
						onClick={handleDislike}
						className='flex cursor-pointer items-center gap-1 rounded-md bg-grey_bg p-1.5'
					>
						<ReactionButton
							type={EReaction.dislike}
							isActive={isDisliked}
							showGif={showDislikeGif}
							showText={false}
							className={cn(isDisliked ? SELECTED_TEXT_COLOR : 'text-basic_text', 'text-sm')}
						/>
					</div>
				</div>

				<div className='flex items-center gap-4 text-basic_text'>
					<button
						type='button'
						onClick={handleSubscribe}
						disabled={isLoading}
						className={subscribeButtonClasses}
					>
						{isSubscribed ? <RiBookmarkFill className='h-4 w-4' /> : <RiBookmarkLine className='h-4 w-4' />}
						<span className='text-xs font-medium'>{buttonText}</span>
					</button>
					<button
						type='button'
						onClick={handleShare}
						className='flex cursor-pointer items-center gap-1 rounded-md bg-grey_bg p-1.5'
					>
						<Share2 className='h-4 w-4' />
						<span className='text-xs font-medium'>Share</span>
					</button>
				</div>
			</div>
		</div>
	);
}

export default PostActions;
