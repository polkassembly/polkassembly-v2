// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EReaction, IReaction, ENotificationStatus } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ClientError } from '@/app/_client-utils/clientError';
import { useUser } from './useUser';
import { useToast as useToastLib } from './useToast';

interface IPostData {
	reactions?: IReaction[];
	proposalType: EProposalType;
	indexOrHash?: string;
	isSubscribed?: boolean;
}

export interface SubscriptionResult {
	isSubscribed: boolean;
	wasUnsubscribed: boolean;
	error?: boolean;
}

export const usePostReactions = (postData: IPostData) => {
	const { user } = useUser();
	const { toast } = useToastLib();

	const [isSubscribed, setIsSubscribed] = useState(!!postData?.isSubscribed);
	const [subscriptionKey, setSubscriptionKey] = useState(0);

	useEffect(() => {
		setIsSubscribed(!!postData?.isSubscribed);
	}, [postData?.isSubscribed]);

	const { isLiked, isDisliked, likesCount, dislikesCount } = useMemo(() => {
		const reactionsArray = postData?.reactions || [];

		const userReactions = reactionsArray.filter((reaction) => reaction.userId === user?.id);

		return {
			isLiked: userReactions.some((reaction) => reaction.reaction === EReaction.like),
			isDisliked: userReactions.some((reaction) => reaction.reaction === EReaction.dislike),
			likesCount: reactionsArray.filter((reaction) => reaction.reaction === EReaction.like).length,
			dislikesCount: reactionsArray.filter((reaction) => reaction.reaction === EReaction.dislike).length
		};
	}, [postData?.reactions, user?.id]);

	const subscriptionParams = useMemo(
		() => ({
			proposalType: postData.proposalType,
			postIndex: String(postData.indexOrHash)
		}),
		[postData.proposalType, postData.indexOrHash]
	);
	const [reactionState, setReactionState] = useState({ isLiked, isDisliked, likesCount, dislikesCount });
	const [showLikeGif, setShowLikeGif] = useState(false);
	const [showDislikeGif, setShowDislikeGif] = useState(false);

	const [currentReactionId, setCurrentReactionId] = useState<string | null>(
		useMemo(() => postData?.reactions?.find((reaction) => reaction.userId === user?.id)?.id || null, [postData?.reactions, user?.id])
	);

	useEffect(() => {
		setReactionState({ isLiked, isDisliked, likesCount, dislikesCount });
	}, [isLiked, isDisliked, likesCount, dislikesCount]);

	const handleReaction = useCallback(
		async (type: EReaction) => {
			if (!postData?.indexOrHash) {
				throw new ClientError('Index or hash is required');
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
						await NextApiClientService.deletePostReaction(postData.proposalType as EProposalType, postData?.indexOrHash, currentReactionId);
						setCurrentReactionId(null);
					}
				} else {
					if (currentReactionId) {
						await NextApiClientService.deletePostReaction(postData.proposalType as EProposalType, postData?.indexOrHash, currentReactionId);
						setCurrentReactionId(null);
					}
					const response = await NextApiClientService.addPostReaction(postData.proposalType as EProposalType, postData?.indexOrHash, type);
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
		[currentReactionId, reactionState, postData.proposalType, postData.indexOrHash]
	);

	const handleSubscribe = async (): Promise<SubscriptionResult> => {
		if (!postData?.indexOrHash) {
			throw new ClientError('Index or hash is required');
		}

		try {
			const newSubscriptionState = !isSubscribed;

			setIsSubscribed(newSubscriptionState);
			setSubscriptionKey((prev) => prev + 1);

			if (newSubscriptionState) {
				toast({
					title: 'Subscribed to the post',
					status: ENotificationStatus.SUCCESS
				});
				await NextApiClientService.addPostSubscription(subscriptionParams.proposalType, subscriptionParams.postIndex);
			} else {
				toast({
					title: 'Unsubscribed from the post',
					status: ENotificationStatus.INFO
				});
				await NextApiClientService.deletePostSubscription(subscriptionParams.proposalType, subscriptionParams.postIndex);
			}

			return {
				isSubscribed: newSubscriptionState,
				wasUnsubscribed: !newSubscriptionState
			};
		} catch (error) {
			setIsSubscribed(!isSubscribed);
			setSubscriptionKey((prev) => prev + 1);

			toast({
				title: 'Failed to update subscription',
				status: ENotificationStatus.ERROR
			});
			console.error('Failed to update subscription:', error);

			return {
				isSubscribed: !isSubscribed,
				wasUnsubscribed: isSubscribed,
				error: true
			};
		}
	};

	return {
		reactionState,
		showLikeGif,
		showDislikeGif,
		handleReaction,
		isSubscribed,
		handleSubscribe,
		subscriptionKey
	};
};
