// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EReaction, IPost } from '@/_shared/types';
import { usePostReactions } from '@/hooks/usePostReactions';
import { useUser } from '@/hooks/useUser';
import { Share2 } from 'lucide-react';
import { IoBookmark } from '@react-icons/all-files/io5/IoBookmark';
import { IoBookmarkOutline } from '@react-icons/all-files/io5/IoBookmarkOutline';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import ReactionButton from '@/app/(home)/activity-feed/Components/ReactionButton/ReactionButton';
import { useMemo, useCallback } from 'react';
import { ValidatorService } from '@/_shared/_services/validator_service';
import styles from './PostActions.module.scss';
import { Button } from '../../Button';

function PostActions({ postData }: { postData: IPost }) {
	const { user } = useUser();
	const router = useRouter();
	const pathname = usePathname();
	// usememo
	const { handleReaction, reactionState, showLikeGif, showDislikeGif, isSubscribed, handleSubscribe, subscriptionKey } = usePostReactions({
		reactions: postData?.reactions,
		proposalType: postData?.proposalType,
		indexOrHash: ValidatorService.isValidNumber(postData?.index) ? postData?.index?.toString() : postData?.hash,
		isSubscribed: !!postData.userSubscriptionId
	});

	const handleAuthenticatedAction = useCallback(
		(action: () => void) => {
			if (!user?.id) {
				router.push(`/login?nextUrl=${pathname}`);
				return;
			}
			action();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[user?.id]
	);

	const subscribeButtonClasses = useMemo(() => cn(styles.post_actions_container, isSubscribed && styles.selected_text), [isSubscribed, subscriptionKey]);

	// const buttonText = useMemo(() => (isSubscribed ? t('unsubscribe') : t('subscribe')), [isSubscribed, subscriptionKey, t]);

	const handleShare = () => {
		const titlePart = postData?.title ? `for "${postData.title}"` : '';
		const message = `The referendum ${titlePart} is now live for @Polkassembly.\nCast your vote here: ${global?.window?.location?.href}`;
		const twitterParameters = [`text=${encodeURIComponent(message)}`, `via=${encodeURIComponent('polk_gov')}`];
		const url = `https://twitter.com/intent/tweet?${twitterParameters.join('&')}`;
		global?.window?.open(url);
	};

	const handleLike = () => handleAuthenticatedAction(() => handleReaction(EReaction.like));
	const handleDislike = () => handleAuthenticatedAction(() => handleReaction(EReaction.dislike));

	return (
		<div className='flex w-full items-center justify-between'>
			<div className='flex items-center gap-4'>
				<div className={cn(reactionState.isLiked ? styles.selected_text : 'text-basic_text', styles.post_actions_container)}>
					<ReactionButton
						type={EReaction.like}
						isActive={reactionState.isLiked}
						showGif={showLikeGif}
						showText={false}
						className='text-sm'
						count={reactionState.likesCount}
						onClick={handleLike}
					/>
				</div>
				<div className={cn(reactionState.isDisliked ? styles.selected_text : 'text-basic_text', styles.post_actions_container)}>
					<ReactionButton
						type={EReaction.dislike}
						isActive={reactionState.isDisliked}
						showGif={showDislikeGif}
						showText={false}
						className='text-sm'
						count={reactionState.dislikesCount}
						onClick={handleDislike}
					/>
				</div>
			</div>

			<div className='flex items-center gap-4 text-basic_text'>
				<Button
					variant='ghost'
					size='sm'
					onClick={() => handleAuthenticatedAction(() => handleSubscribe())}
					className={subscribeButtonClasses}
				>
					{isSubscribed ? <IoBookmark className='h-4 w-4' /> : <IoBookmarkOutline className='h-4 w-4' />}
				</Button>
				<Button
					variant='ghost'
					size='sm'
					onClick={handleShare}
					className={styles.post_actions_container}
				>
					<Share2 className='h-4 w-4' />
				</Button>
			</div>
		</div>
	);
}

export default PostActions;
