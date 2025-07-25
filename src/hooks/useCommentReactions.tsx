// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EReaction, IReaction, ENotificationStatus } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ClientError } from '@/app/_client-utils/clientError';
import { useUser } from './useUser';
import { useToast as useToastLib } from './useToast';

interface ICommentData {
	reactions?: IReaction[];
	proposalType: EProposalType;
	indexOrHash?: string;
	commentId: string;
}

export const useCommentReactions = (commentData: ICommentData) => {
	const { user } = useUser();
	const { toast } = useToastLib();

	const { isLiked, isDisliked, likesCount, dislikesCount } = useMemo(() => {
		const reactionsArray = commentData?.reactions || [];

		const userReactions = reactionsArray.filter((reaction) => reaction.userId === user?.id);

		return {
			isLiked: userReactions.some((reaction) => reaction.reaction === EReaction.like),
			isDisliked: userReactions.some((reaction) => reaction.reaction === EReaction.dislike),
			likesCount: reactionsArray.filter((reaction) => reaction.reaction === EReaction.like).length,
			dislikesCount: reactionsArray.filter((reaction) => reaction.reaction === EReaction.dislike).length
		};
	}, [commentData?.reactions, user?.id]);

	const [reactionState, setReactionState] = useState({ isLiked, isDisliked, likesCount, dislikesCount });
	const [showLikeGif, setShowLikeGif] = useState(false);
	const [showDislikeGif, setShowDislikeGif] = useState(false);

	const [currentReactionId, setCurrentReactionId] = useState<string | null>(
		useMemo(() => commentData?.reactions?.find((reaction) => reaction.userId === user?.id)?.id || null, [commentData?.reactions, user?.id])
	);

	useEffect(() => {
		setReactionState({ isLiked, isDisliked, likesCount, dislikesCount });
	}, [isLiked, isDisliked, likesCount, dislikesCount]);

	const handleReaction = useCallback(
		async (type: EReaction) => {
			if (!commentData?.indexOrHash || !commentData?.commentId) {
				throw new ClientError('Index/hash and comment ID are required');
			}
			const isLikeAction = type === EReaction.like;
			const showGifSetter = isLikeAction ? setShowLikeGif : setShowDislikeGif;
			try {
				const isDeleteAction = currentReactionId && ((isLikeAction && reactionState.isLiked) || (!isLikeAction && reactionState.isDisliked));
				if (!isDeleteAction) {
					showGifSetter(true);
					setTimeout(() => showGifSetter(false), 1500);
				}

				setReactionState((prev) => ({
					...prev,
					isLiked: isLikeAction ? !prev.isLiked : false,
					isDisliked: !isLikeAction ? !prev.isDisliked : false,
					likesCount: prev.likesCount + (isLikeAction ? (prev.isLiked ? -1 : 1) : prev.isLiked ? -1 : 0),
					dislikesCount: prev.dislikesCount + (!isLikeAction ? (prev.isDisliked ? -1 : 1) : prev.isDisliked ? -1 : 0)
				}));

				if (isDeleteAction) {
					if (currentReactionId) {
						await NextApiClientService.deleteCommentReaction(commentData.proposalType as EProposalType, commentData.indexOrHash, commentData.commentId, currentReactionId);
						setCurrentReactionId(null);
					}
				} else {
					if (currentReactionId) {
						await NextApiClientService.deleteCommentReaction(commentData.proposalType as EProposalType, commentData.indexOrHash, commentData.commentId, currentReactionId);
						setCurrentReactionId(null);
					}
					const response = await NextApiClientService.addCommentReaction(commentData.proposalType as EProposalType, commentData.indexOrHash, commentData.commentId, type);
					setCurrentReactionId(response?.data?.reactionId || null);
				}
			} catch (error) {
				// Revert optimistic update on error
				setReactionState((prev) => ({
					...prev,
					isLiked: isLikeAction ? !prev.isLiked : prev.isLiked,
					isDisliked: !isLikeAction ? !prev.isDisliked : prev.isDisliked,
					likesCount: prev.likesCount - (isLikeAction ? (prev.isLiked ? 1 : -1) : prev.isLiked ? -1 : 0),
					dislikesCount: prev.dislikesCount - (!isLikeAction ? (prev.isDisliked ? 1 : -1) : prev.isDisliked ? -1 : 0)
				}));

				toast({
					title: 'Failed to update reaction',
					status: ENotificationStatus.ERROR
				});
				console.error('Failed to update comment reaction:', error);
			}
		},
		[currentReactionId, reactionState, commentData.proposalType, commentData.indexOrHash, commentData.commentId, toast]
	);

	return {
		reactionState,
		showLikeGif,
		showDislikeGif,
		handleReaction
	};
};
