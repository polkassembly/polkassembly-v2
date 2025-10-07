// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EReaction, IReaction, ENotificationStatus, IPublicUser } from '@/_shared/types';
import { calculateUpdatedReactionUserArrays } from '@/_shared/_utils/reactionUtils';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useUser } from './useUser';
import { useToast as useToastLib } from './useToast';

interface IPostReactionState {
	isLiked: boolean;
	isDisliked: boolean;
	likesCount: number;
	dislikesCount: number;
	usersWhoLikedPost: IPublicUser[];
	usersWhoDislikedPost: IPublicUser[];
}

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

	const { isLiked, isDisliked, likesCount, dislikesCount, usersWhoLikedPost, usersWhoDislikedPost } = useMemo(() => {
		const postReactionsArray = postData?.reactions || [];

		const currentUserReactions = postReactionsArray.filter((reaction) => reaction.userId === user?.id);

		return {
			isLiked: currentUserReactions.some((reaction) => reaction.reaction === EReaction.like),
			isDisliked: currentUserReactions.some((reaction) => reaction.reaction === EReaction.dislike),
			likesCount: postReactionsArray.filter((reaction) => reaction.reaction === EReaction.like).length,
			dislikesCount: postReactionsArray.filter((reaction) => reaction.reaction === EReaction.dislike).length,
			usersWhoLikedPost: postReactionsArray
				.filter((reaction) => reaction.reaction === EReaction.like)
				.map((reaction) => reaction.publicUser)
				.filter(Boolean),
			usersWhoDislikedPost: postReactionsArray
				.filter((reaction) => reaction.reaction === EReaction.dislike)
				.map((reaction) => reaction.publicUser)
				.filter(Boolean)
		};
	}, [postData?.reactions, user?.id]);

	const subscriptionParams = useMemo(
		() => ({
			proposalType: postData.proposalType,
			postIndex: String(postData.indexOrHash)
		}),
		[postData.proposalType, postData.indexOrHash]
	);
	const [reactionState, setReactionState] = useState<IPostReactionState>({ isLiked, isDisliked, likesCount, dislikesCount, usersWhoLikedPost, usersWhoDislikedPost });

	const [currentReactionId, setCurrentReactionId] = useState<string | null>(
		useMemo(() => postData?.reactions?.find((reaction) => reaction.userId === user?.id)?.id || null, [postData?.reactions, user?.id])
	);

	useEffect(() => {
		setReactionState({ isLiked, isDisliked, likesCount, dislikesCount, usersWhoLikedPost, usersWhoDislikedPost });
	}, [isLiked, isDisliked, likesCount, dislikesCount, usersWhoLikedPost, usersWhoDislikedPost]);

	const handleReaction = useCallback(
		async (type: EReaction) => {
			if (!postData?.indexOrHash) {
				throw new ClientError('Index or hash is required');
			}
			const isLikeAction = type === EReaction.like;

			try {
				const isDeleteAction = Boolean(currentReactionId && ((isLikeAction && reactionState.isLiked) || (!isLikeAction && reactionState.isDisliked)));

				setReactionState((previousState) => {
					const updatedUserArrays = calculateUpdatedReactionUserArrays({
						currentUsersWhoLiked: previousState.usersWhoLikedPost,
						currentUsersWhoDisliked: previousState.usersWhoDislikedPost,
						isLikeAction,
						isDeleteAction,
						currentPublicUser: user?.publicUser,
						likedArrayKey: 'usersWhoLikedPost',
						dislikedArrayKey: 'usersWhoDislikedPost'
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
				// Revert optimistic update on error - restore to original state
				setReactionState({ isLiked, isDisliked, likesCount, dislikesCount, usersWhoLikedPost, usersWhoDislikedPost });
			}
		},
		[currentReactionId, reactionState, postData.proposalType, postData.indexOrHash, user, isLiked, isDisliked, likesCount, dislikesCount, usersWhoLikedPost, usersWhoDislikedPost]
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
		handleReaction,
		isSubscribed,
		handleSubscribe,
		subscriptionKey
	};
};
