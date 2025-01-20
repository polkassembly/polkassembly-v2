// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EReaction, IActivityFeedPostListing } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useState } from 'react';
import { useUser } from './useUser';

export const usePostReactions = (postData: IActivityFeedPostListing) => {
	const { user } = useUser();
	const [reactionState, setReactionState] = useState({
		isLiked: postData?.userReaction?.userId === user?.id && postData?.userReaction?.reaction === EReaction.like,
		isDisliked: postData?.userReaction?.userId === user?.id && postData?.userReaction?.reaction === EReaction.dislike,
		likesCount: postData?.metrics?.reactions?.like || 0,
		dislikesCount: postData?.metrics?.reactions?.dislike || 0
	});

	const [currentReactionId, setCurrentReactionId] = useState<string | null>(postData?.userReaction?.userId === user?.id ? postData?.userReaction?.id || null : null);
	const [showLikeGif, setShowLikeGif] = useState(false);
	const [showDislikeGif, setShowDislikeGif] = useState(false);

	const handleReaction = async (type: EReaction) => {
		const isLikeAction = type === EReaction.like;
		const showGifSetter = isLikeAction ? setShowLikeGif : setShowDislikeGif;

		try {
			// Determine if the action is to delete the reaction
			const isDeleteAction = currentReactionId && ((isLikeAction && reactionState.isLiked) || (!isLikeAction && reactionState.isDisliked));

			if (isDeleteAction) {
				// Optimistic update: Remove reaction
				setReactionState((prev) => ({
					...prev,
					isLiked: false,
					isDisliked: false,
					likesCount: isLikeAction ? prev.likesCount - 1 : prev.likesCount,
					dislikesCount: !isLikeAction ? prev.dislikesCount - 1 : prev.dislikesCount
				}));
				await NextApiClientService.deletePostReactionApi(postData.proposalType as EProposalType, postData?.index?.toString() || '', currentReactionId);
				setCurrentReactionId(null);
			} else {
				// Optimistic update: Add or switch reaction
				setReactionState((prev) => ({
					...prev,
					isLiked: isLikeAction,
					isDisliked: !isLikeAction,
					likesCount: prev.likesCount + (isLikeAction ? (prev.isLiked ? 0 : 1) : prev.isLiked ? -1 : 0),
					dislikesCount: prev.dislikesCount + (!isLikeAction ? (prev.isDisliked ? 0 : 1) : prev.isDisliked ? -1 : 0)
				}));

				showGifSetter(true);
				setTimeout(() => showGifSetter(false), 1500);

				const response = await NextApiClientService.postReactionsApi(postData.proposalType as EProposalType, postData?.index?.toString() || '', type);
				setCurrentReactionId(response?.data?.reactionId || null);
			}
		} catch (error) {
			console.error('Error updating reaction:', error);
			// Revert on error
			setReactionState((prev) => ({
				...prev,
				isLiked: isLikeAction ? !prev.isLiked : prev.isLiked,
				isDisliked: !isLikeAction ? !prev.isDisliked : prev.isDisliked,
				likesCount: prev.likesCount - (isLikeAction ? 1 : 0),
				dislikesCount: prev.dislikesCount - (!isLikeAction ? 1 : 0)
			}));
		}
	};

	return { reactionState, showLikeGif, showDislikeGif, handleReaction };
};
