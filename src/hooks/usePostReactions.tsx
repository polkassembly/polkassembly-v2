// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EReaction, IPost } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useUser } from './useUser';

export const usePostReactions = (postData: IPost) => {
	const { user } = useUser();

	const { isLiked, isDisliked, likesCount, dislikesCount } = useMemo(() => {
		const userReactions = postData.reactions?.filter((reaction) => reaction.userId === user?.id) || [];
		const allReactions = postData.reactions || [];

		return {
			isLiked: userReactions.some((reaction) => reaction.reaction === EReaction.like),
			isDisliked: userReactions.some((reaction) => reaction.reaction === EReaction.dislike),
			likesCount: allReactions.filter((reaction) => reaction.reaction === EReaction.like).length,
			dislikesCount: allReactions.filter((reaction) => reaction.reaction === EReaction.dislike).length
		};
	}, [postData.reactions, user?.id]);

	const [reactionState, setReactionState] = useState({ isLiked, isDisliked, likesCount, dislikesCount });
	const [showLikeGif, setShowLikeGif] = useState(false);
	const [showDislikeGif, setShowDislikeGif] = useState(false);
	const [currentReactionId, setCurrentReactionId] = useState<string | null>(
		useMemo(() => (postData?.userReaction?.userId === user?.id ? postData?.userReaction?.id || null : null), [postData?.userReaction, user?.id])
	);

	// Update reaction state when reactions change
	useEffect(() => {
		setReactionState({ isLiked, isDisliked, likesCount, dislikesCount });
	}, [isLiked, isDisliked, likesCount, dislikesCount]);

	const handleReaction = useCallback(
		async (type: EReaction) => {
			const isLikeAction = type === EReaction.like;
			const showGifSetter = isLikeAction ? setShowLikeGif : setShowDislikeGif;

			try {
				const isDeleteAction = currentReactionId && ((isLikeAction && reactionState.isLiked) || (!isLikeAction && reactionState.isDisliked));

				if (isDeleteAction) {
					setReactionState((prev) => ({
						...prev,
						isLiked: false,
						isDisliked: false,
						likesCount: isLikeAction ? prev.likesCount - 1 : prev.likesCount,
						dislikesCount: !isLikeAction ? prev.dislikesCount - 1 : prev.dislikesCount
					}));
					await NextApiClientService.deletePostReaction(postData.proposalType as EProposalType, postData?.index?.toString() || '', currentReactionId);
					setCurrentReactionId(null);
				} else {
					setReactionState((prev) => ({
						...prev,
						isLiked: isLikeAction,
						isDisliked: !isLikeAction,
						likesCount: prev.likesCount + (isLikeAction ? (prev.isLiked ? 0 : 1) : prev.isLiked ? -1 : 0),
						dislikesCount: prev.dislikesCount + (!isLikeAction ? (prev.isDisliked ? 0 : 1) : prev.isDisliked ? -1 : 0)
					}));

					showGifSetter(true);
					setTimeout(() => showGifSetter(false), 1500);

					const response = await NextApiClientService.addPostReaction(postData.proposalType as EProposalType, postData?.index?.toString() || '', type);
					setCurrentReactionId(response?.data?.reactionId || null);
				}
			} catch {
				setReactionState((prev) => ({
					...prev,
					isLiked: isLikeAction ? !prev.isLiked : prev.isLiked,
					isDisliked: !isLikeAction ? !prev.isDisliked : prev.isDisliked,
					likesCount: prev.likesCount - (isLikeAction ? 1 : 0),
					dislikesCount: prev.dislikesCount - (!isLikeAction ? 1 : 0)
				}));
			}
		},
		[currentReactionId, reactionState, postData.proposalType, postData.index]
	);

	return {
		reactionState,
		showLikeGif,
		showDislikeGif,
		handleReaction
	};
};
