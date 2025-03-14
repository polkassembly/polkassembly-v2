// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EActivityFeedTab, EProposalType, EReaction, IReaction, NotificationType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useState, useMemo, useCallback } from 'react';
import { ClientError } from '@/app/_client-utils/clientError';
import { useSearchParams } from 'next/navigation';
import { useUser } from './useUser';
import { useToast as useToastLib } from './useToast';

interface IPostData {
	reactions?: IReaction[];
	proposalType: EProposalType;
	indexOrHash?: string;
	userSubscriptionId?: string;
}

export const usePostReactions = (postData: IPostData) => {
	const { user } = useUser();
	const { toast } = useToastLib();
	const searchParams = useSearchParams();

	const isInSubscriptionTab = useMemo(() => {
		return searchParams.get('tab') === EActivityFeedTab.SUBSCRIBED;
	}, [searchParams]);

	const [isSubscribed, setIsSubscribed] = useState(!!postData?.userSubscriptionId || isInSubscriptionTab);
	const [isLoading, setIsLoading] = useState(false);

	const reactionsArray = useMemo(() => {
		return Array.isArray(postData?.reactions) ? postData.reactions : postData.reactions ? [postData.reactions] : [];
	}, [postData?.reactions]);

	const userReactions = useMemo(() => {
		return reactionsArray.filter((reaction) => reaction.userId === user?.id);
	}, [reactionsArray, user?.id]);

	const currentReaction = useMemo(() => {
		return userReactions.find((reaction) => reaction.userId === user?.id);
	}, [userReactions, user?.id]);

	const isLiked = useMemo(() => userReactions.some((reaction) => reaction.reaction === EReaction.like), [userReactions]);
	const isDisliked = useMemo(() => userReactions.some((reaction) => reaction.reaction === EReaction.dislike), [userReactions]);
	const likesCount = useMemo(() => reactionsArray.filter((reaction) => reaction.reaction === EReaction.like).length, [reactionsArray]);
	const dislikesCount = useMemo(() => reactionsArray.filter((reaction) => reaction.reaction === EReaction.dislike).length, [reactionsArray]);

	const subscriptionParams = useMemo(
		() => ({
			proposalType: postData.proposalType,
			postIndex: String(postData.indexOrHash)
		}),
		[postData.proposalType, postData.indexOrHash]
	);

	const [showLikeGif, setShowLikeGif] = useState(false);
	const [showDislikeGif, setShowDislikeGif] = useState(false);

	const [currentReactionId, setCurrentReactionId] = useState<string | null>(currentReaction?.id || null);

	const handleReaction = useCallback(
		async (type: EReaction) => {
			if (!postData?.indexOrHash) {
				throw new ClientError('Index or hash is required');
			}
			const isLikeAction = type === EReaction.like;
			const showGifSetter = isLikeAction ? setShowLikeGif : setShowDislikeGif;
			try {
				const isDeleteAction = currentReactionId && ((isLikeAction && isLiked) || (!isLikeAction && isDisliked));
				showGifSetter(true);
				setTimeout(() => showGifSetter(false), 1500);

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
			} catch (error) {
				console.error('Failed to update reaction:', error);
			}
		},
		[currentReactionId, isLiked, isDisliked, postData.proposalType, postData.indexOrHash]
	);
	const handleSubscribe = useCallback(async () => {
		try {
			setIsLoading(true);
			if (isSubscribed) {
				await NextApiClientService.deletePostSubscription(subscriptionParams.proposalType, subscriptionParams.postIndex);
				toast({
					title: 'Unsubscribed from the post',
					status: NotificationType.INFO
				});
			} else {
				await NextApiClientService.addPostSubscription(subscriptionParams.proposalType, subscriptionParams.postIndex);
				toast({
					title: 'Subscribed to the post',
					status: NotificationType.SUCCESS
				});
			}
			setIsSubscribed(!isSubscribed);
		} catch (error) {
			console.error('Failed to update subscription:', error);
		} finally {
			setIsLoading(false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSubscribed, subscriptionParams]);

	return {
		likesCount,
		dislikesCount,
		isLiked,
		isDisliked,
		showLikeGif,
		showDislikeGif,
		handleReaction,
		isSubscribed,
		isSubscribing: isLoading,
		handleSubscribe
	};
};
