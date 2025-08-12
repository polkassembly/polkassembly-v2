// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EReaction, IReaction, ENotificationStatus, IPublicUser } from '@/_shared/types';
import { calculateUpdatedReactionUserArrays } from '@/_shared/_utils/reactionUtils';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useUser } from './useUser';
import { useToast as useToastLib } from './useToast';

interface ICommentReactionState {
	isLiked: boolean;
	isDisliked: boolean;
	likesCount: number;
	dislikesCount: number;
	usersWhoLikedComment: IPublicUser[];
	usersWhoDislikedComment: IPublicUser[];
}

interface ICommentData {
	reactions?: IReaction[];
	proposalType: EProposalType;
	indexOrHash?: string;
	commentId: string;
}

export const useCommentReactions = (commentData: ICommentData) => {
	const { user } = useUser();
	const { toast } = useToastLib();

	const { isLiked, isDisliked, likesCount, dislikesCount, usersWhoLikedComment, usersWhoDislikedComment } = useMemo(() => {
		const commentReactionsArray = commentData?.reactions || [];

		const currentUserReactions = commentReactionsArray.filter((reaction) => reaction.userId === user?.id);

		return {
			isLiked: currentUserReactions.some((reaction) => reaction.reaction === EReaction.like),
			isDisliked: currentUserReactions.some((reaction) => reaction.reaction === EReaction.dislike),
			likesCount: commentReactionsArray.filter((reaction) => reaction.reaction === EReaction.like).length,
			dislikesCount: commentReactionsArray.filter((reaction) => reaction.reaction === EReaction.dislike).length,
			usersWhoLikedComment: commentReactionsArray
				.filter((reaction) => reaction.reaction === EReaction.like)
				.map((reaction) => reaction.publicUser)
				.filter(Boolean),
			usersWhoDislikedComment: commentReactionsArray
				.filter((reaction) => reaction.reaction === EReaction.dislike)
				.map((reaction) => reaction.publicUser)
				.filter(Boolean)
		};
	}, [commentData?.reactions, user?.id]);

	const [reactionState, setReactionState] = useState<ICommentReactionState>({ isLiked, isDisliked, likesCount, dislikesCount, usersWhoLikedComment, usersWhoDislikedComment });
	const [showLikeGif, setShowLikeGif] = useState(false);
	const [showDislikeGif, setShowDislikeGif] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const currentReactionIdFromData = useMemo(() => {
		return commentData?.reactions?.find((reaction) => reaction.userId === user?.id)?.id || null;
	}, [commentData?.reactions, user?.id]);

	const [currentReactionId, setCurrentReactionId] = useState<string | null>(currentReactionIdFromData);

	useEffect(() => {
		setCurrentReactionId(currentReactionIdFromData);
	}, [currentReactionIdFromData]);

	useEffect(() => {
		setReactionState({ isLiked, isDisliked, likesCount, dislikesCount, usersWhoLikedComment, usersWhoDislikedComment });
	}, [isLiked, isDisliked, likesCount, dislikesCount, usersWhoLikedComment, usersWhoDislikedComment]);

	const handleReaction = useCallback(
		async (type: EReaction) => {
			if (!commentData?.indexOrHash || !commentData?.commentId) {
				throw new Error('Index/hash and comment ID are required');
			}

			setIsLoading(true);
			const isLikeAction = type === EReaction.like;
			const showGifSetter = isLikeAction ? setShowLikeGif : setShowDislikeGif;

			try {
				const isDeleteAction = Boolean(currentReactionId && ((isLikeAction && reactionState.isLiked) || (!isLikeAction && reactionState.isDisliked)));
				if (!isDeleteAction) {
					showGifSetter(true);
					setTimeout(() => showGifSetter(false), 1500);
				}

				setReactionState((previousState) => {
					const updatedUserArrays = calculateUpdatedReactionUserArrays({
						currentUsersWhoLiked: previousState.usersWhoLikedComment,
						currentUsersWhoDisliked: previousState.usersWhoDislikedComment,
						isLikeAction,
						isDeleteAction,
						currentPublicUser: user?.publicUser,
						likedArrayKey: 'usersWhoLikedComment',
						dislikedArrayKey: 'usersWhoDislikedComment'
					});

					return {
						...previousState,
						isLiked: isLikeAction ? !previousState.isLiked : false,
						isDisliked: !isLikeAction ? !previousState.isDisliked : false,
						likesCount: previousState.likesCount + (isLikeAction ? (previousState.isLiked ? -1 : 1) : previousState.isLiked ? -1 : 0),
						dislikesCount: previousState.dislikesCount + (!isLikeAction ? (previousState.isDisliked ? -1 : 1) : previousState.isDisliked ? -1 : 0),
						...updatedUserArrays
					};
				});

				if (isDeleteAction) {
					if (currentReactionId) {
						await NextApiClientService.deleteCommentReaction(commentData.proposalType as EProposalType, commentData.indexOrHash, commentData.commentId, currentReactionId);
						setCurrentReactionId(null);
					}
				} else {
					const response = await NextApiClientService.addCommentReaction(commentData.proposalType as EProposalType, commentData.indexOrHash, commentData.commentId, type);
					setCurrentReactionId(response?.data?.reactionId || null);
				}
			} catch (error) {
				// Revert optimistic update on error - restore to original state
				setReactionState({ isLiked, isDisliked, likesCount, dislikesCount, usersWhoLikedComment, usersWhoDislikedComment });

				toast({
					title: 'Failed to update reaction',
					status: ENotificationStatus.ERROR
				});
				console.error('Failed to update comment reaction:', error);
			} finally {
				setIsLoading(false);
			}
		},
		[
			currentReactionId,
			reactionState,
			commentData.proposalType,
			commentData.indexOrHash,
			commentData.commentId,
			toast,
			user,
			isLiked,
			isDisliked,
			likesCount,
			dislikesCount,
			usersWhoLikedComment,
			usersWhoDislikedComment
		]
	);

	return {
		reactionState,
		showLikeGif,
		showDislikeGif,
		handleReaction,
		isLoading
	};
};
