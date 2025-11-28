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
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/app/_shared-components/Tooltip';
import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ValidatorService } from '@/_shared/_services/validator_service';
import styles from './PostActions.module.scss';
import { Button } from '../../Button';
import Address from '../../Profile/Address/Address';

function PostActions({ postData }: { postData: IPost }) {
	const { user } = useUser();
	const router = useRouter();
	const pathname = usePathname();
	// usememo
	const { handleReaction, reactionState, isSubscribed, handleSubscribe, subscriptionKey } = usePostReactions({
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
		<TooltipProvider>
			<div className='flex w-full items-center justify-between'>
				<div className='flex items-center gap-4'>
					<div className={cn(reactionState.isLiked ? styles.selected_text : 'text-basic_text', styles.post_actions_container)}>
						<Tooltip delayDuration={300}>
							<TooltipTrigger asChild>
								<div>
									<ReactionButton
										type={EReaction.like}
										isActive={reactionState.isLiked}
										showText={false}
										className='text-sm'
										count={reactionState.likesCount}
										onClick={handleLike}
									/>
								</div>
							</TooltipTrigger>
							{reactionState.usersWhoLikedPost?.length > 0 && (
								<TooltipContent
									side='bottom'
									className='flex max-h-40 max-w-xs flex-col gap-2 overflow-y-auto border-none bg-bg_code px-4 py-4 text-sm text-basic_text shadow-lg'
								>
									{reactionState.usersWhoLikedPost?.map((userWhoReacted) => {
										return userWhoReacted?.addresses?.[0] ? (
											<Address
												key={userWhoReacted?.addresses?.[0]}
												address={userWhoReacted?.addresses?.[0]}
												redirectToProfile
												disableTooltip
											/>
										) : (
											<Link
												href={`/user/${userWhoReacted?.username}`}
												className='text-xs font-medium hover:underline'
												key={userWhoReacted?.username}
												target='_blank'
												rel='noopener noreferrer'
											>
												{userWhoReacted.username}
											</Link>
										);
									})}
								</TooltipContent>
							)}
						</Tooltip>
					</div>
					<div className={cn(reactionState.isDisliked ? styles.selected_text : 'text-basic_text', styles.post_actions_container)}>
						<Tooltip delayDuration={300}>
							<TooltipTrigger asChild>
								<div>
									<ReactionButton
										type={EReaction.dislike}
										isActive={reactionState.isDisliked}
										showText={false}
										className='text-sm'
										count={reactionState.dislikesCount}
										onClick={handleDislike}
									/>
								</div>
							</TooltipTrigger>
							{reactionState.usersWhoDislikedPost?.length > 0 && (
								<TooltipContent
									side='bottom'
									className='flex max-h-40 max-w-xs flex-col gap-2 overflow-y-auto border-none bg-bg_code px-4 py-4 text-sm text-basic_text shadow-lg'
								>
									{reactionState.usersWhoDislikedPost?.map((userWhoReacted) => {
										return userWhoReacted?.addresses?.[0] ? (
											<Address
												key={userWhoReacted.addresses?.[0]}
												address={userWhoReacted.addresses?.[0]}
												redirectToProfile
												disableTooltip
											/>
										) : (
											<Link
												href={`/user/${userWhoReacted.username}`}
												className='text-xs font-medium hover:underline'
												key={userWhoReacted.username}
												target='_blank'
												rel='noopener noreferrer'
											>
												{userWhoReacted.username}
											</Link>
										);
									})}
								</TooltipContent>
							)}
						</Tooltip>
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
		</TooltipProvider>
	);
}

export default PostActions;
