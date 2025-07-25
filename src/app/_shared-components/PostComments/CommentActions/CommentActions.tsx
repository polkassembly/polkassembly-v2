// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EReaction, ICommentResponse } from '@/_shared/types';
import { useCommentReactions } from '@/hooks/useCommentReactions';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import ReactionButton from '@/app/(home)/activity-feed/Components/ReactionButton/ReactionButton';
import { useCallback, memo } from 'react';
import styles from './CommentActions.module.scss';

interface CommentActionsProps {
	commentData: ICommentResponse;
}

function CommentActions({ commentData }: CommentActionsProps) {
	const { user } = useUser();
	const router = useRouter();
	const pathname = usePathname();

	const { handleReaction, reactionState, showLikeGif, showDislikeGif } = useCommentReactions({
		reactions: commentData?.reactions,
		proposalType: commentData?.proposalType,
		indexOrHash: commentData?.indexOrHash,
		commentId: commentData?.id
	});

	const handleAuthenticatedAction = useCallback(
		(action: () => void) => {
			if (!user?.id) {
				router.push(`/login?nextUrl=${pathname}`);
				return;
			}
			action();
		},
		[user?.id, router, pathname]
	);

	const handleLike = () => handleAuthenticatedAction(() => handleReaction(EReaction.like));
	const handleDislike = () => handleAuthenticatedAction(() => handleReaction(EReaction.dislike));

	return (
		<div className={styles.comment_actions_wrapper}>
			<div className={cn(reactionState.isLiked ? styles.selected_text : 'text-basic_text', styles.comment_actions_container)}>
				<ReactionButton
					type={EReaction.like}
					isActive={reactionState.isLiked}
					showGif={showLikeGif}
					showText={false}
					className='text-xs'
					count={reactionState.likesCount}
					onClick={handleLike}
				/>
			</div>
			<div className={cn(reactionState.isDisliked ? styles.selected_text : 'text-basic_text', styles.comment_actions_container)}>
				<ReactionButton
					type={EReaction.dislike}
					isActive={reactionState.isDisliked}
					showGif={showDislikeGif}
					showText={false}
					className='text-xs'
					count={reactionState.dislikesCount}
					onClick={handleDislike}
				/>
			</div>
		</div>
	);
}

export default memo(CommentActions);
