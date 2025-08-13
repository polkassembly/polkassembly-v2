// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EReaction, ICommentResponse, IPublicUser } from '@/_shared/types';
import { useCommentReactions } from '@/hooks/useCommentReactions';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import ReactionButton from '@/app/(home)/activity-feed/Components/ReactionButton/ReactionButton';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/app/_shared-components/Tooltip';
import { useCallback, memo } from 'react';
import Link from 'next/link';
import styles from './CommentReactions.module.scss';
import Address from '../../Profile/Address/Address';

interface CommentReactionsProps {
	commentData: ICommentResponse;
	disabled?: boolean;
}

function CommentReactions({ commentData, disabled = false }: CommentReactionsProps) {
	const { user } = useUser();
	const router = useRouter();

	const { handleReaction, reactionState, showLikeGif, showDislikeGif, isLoading } = useCommentReactions({
		reactions: commentData?.reactions,
		proposalType: commentData?.proposalType,
		indexOrHash: commentData?.indexOrHash,
		commentId: commentData?.id
	});

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

	const handleLike = () => handleAuthenticatedAction(() => handleReaction(EReaction.like));
	const handleDislike = () => handleAuthenticatedAction(() => handleReaction(EReaction.dislike));

	return (
		<TooltipProvider>
			<div className={styles.comment_actions_wrapper}>
				<div className={cn(reactionState.isLiked ? styles.selected_text : 'text-basic_text', styles.comment_actions_container)}>
					<Tooltip delayDuration={300}>
						<TooltipTrigger asChild>
							<div>
								<ReactionButton
									type={EReaction.like}
									isActive={reactionState.isLiked}
									showGif={showLikeGif}
									showText={false}
									className='text-xs'
									count={reactionState.likesCount}
									onClick={handleLike}
									disabled={isLoading || disabled}
								/>
							</div>
						</TooltipTrigger>
						{reactionState.usersWhoLikedComment?.length > 0 && !disabled && (
							<TooltipContent
								side='top'
								className='flex max-h-40 max-w-xs flex-col gap-2 overflow-y-auto border-none bg-bg_code px-4 py-4 text-sm text-basic_text shadow-lg'
							>
								{reactionState.usersWhoLikedComment?.map((userWhoReacted: IPublicUser) => {
									return userWhoReacted?.addresses?.[0] ? (
										<Address
											key={userWhoReacted?.addresses?.[0]}
											address={userWhoReacted?.addresses?.[0]}
											redirectToProfile
											disableTooltip
										/>
									) : (
										<Link
											href={`/user/${userWhoReacted.username}`}
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
				<div className={cn(reactionState.isDisliked ? styles.selected_text : 'text-basic_text', styles.comment_actions_container)}>
					<Tooltip delayDuration={300}>
						<TooltipTrigger asChild>
							<div>
								<ReactionButton
									type={EReaction.dislike}
									isActive={reactionState.isDisliked}
									showGif={showDislikeGif}
									showText={false}
									className='text-xs'
									count={reactionState.dislikesCount}
									onClick={handleDislike}
									disabled={isLoading || disabled}
								/>
							</div>
						</TooltipTrigger>
						{reactionState.usersWhoDislikedComment?.length > 0 && !disabled && (
							<TooltipContent
								side='top'
								className='flex max-h-40 max-w-xs flex-col gap-2 overflow-y-auto border-none bg-bg_code px-4 py-4 text-sm text-basic_text shadow-lg'
							>
								{reactionState.usersWhoDislikedComment?.map((userWhoReacted: IPublicUser) => {
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
			</div>
		</TooltipProvider>
	);
}

export default memo(CommentReactions);
