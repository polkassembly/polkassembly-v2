// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EReaction, IPost } from '@/_shared/types';
import { usePostReactions } from '@/hooks/usePostReactions';
import { useUser } from '@/hooks/useUser';
import { Share2 } from 'lucide-react';
import { RiBookmarkLine, RiBookmarkFill } from 'react-icons/ri';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ReactionButton from '@/app/(home)/Components/ReactionButton/ReactionButton';
import { useMemo, useCallback } from 'react';
import styles from './PostActions.module.scss';

function PostActions({ postData }: { postData: IPost }) {
	const { user } = useUser();
	const router = useRouter();
	const t = useTranslations();
	const { handleReaction, reactionState, showLikeGif, showDislikeGif, isSubscribed, isSubscribing, handleSubscribe } = usePostReactions(postData);
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

	const { likesCount, dislikesCount, isLiked, isDisliked } = reactionState;

	const subscribeButtonClasses = useMemo(
		() => cn(styles.post_actions_container, isSubscribed && styles.selected_text, isSubscribing && styles.loading),
		[isSubscribed, isSubscribing]
	);

	const buttonText = useMemo(() => (isSubscribing ? t('loading') : isSubscribed ? t('unsubscribe') : t('subscribe')), [isSubscribing, isSubscribed]);

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
						className={cn(isLiked ? styles.selected_text : 'text-basic_text', styles.post_actions_container)}
					>
						<ReactionButton
							type={EReaction.like}
							isActive={isLiked || false}
							showGif={showLikeGif}
							showText={false}
							className='text-sm'
						/>
						<span className='text-xs font-medium'>{likesCount}</span>
					</div>
					<div
						role='button'
						aria-hidden
						onClick={handleDislike}
						className={cn(isDisliked ? styles.selected_text : 'text-basic_text', styles.post_actions_container)}
					>
						<ReactionButton
							type={EReaction.dislike}
							isActive={isDisliked || false}
							showGif={showDislikeGif}
							showText={false}
							className='text-sm'
						/>
						<span className='text-xs font-medium'>{dislikesCount}</span>
					</div>
				</div>

				<div className='flex items-center gap-4 text-basic_text'>
					<button
						type='button'
						onClick={() => handleAuthenticatedAction(() => handleSubscribe())}
						disabled={isSubscribing}
						className={subscribeButtonClasses}
					>
						{isSubscribed ? <RiBookmarkFill className='h-4 w-4' /> : <RiBookmarkLine className='h-4 w-4' />}
						<span className='text-xs font-medium'>{buttonText}</span>
					</button>
					<button
						type='button'
						onClick={handleShare}
						className={styles.post_actions_container}
					>
						<Share2 className='h-4 w-4' />
						<span className='text-xs font-medium'>{t('share')}</span>
					</button>
				</div>
			</div>
		</div>
	);
}

export default PostActions;
