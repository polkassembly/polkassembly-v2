// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EDataSource, ENotificationStatus, EProposalType, EReactQueryKeys, IComment, ICommentResponse, IVoteData } from '@/_shared/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { LocalStorageClientService } from '@/app/_client-services/local_storage_client_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { DEFAULT_PROFILE_DETAILS } from '@/_shared/_constants/defaultProfileDetails';
import { useUser } from './useUser';
import { useToast } from './useToast';

export const useComments = () => {
	const queryClient = useQueryClient();

	const network = getCurrentNetwork();

	const { user } = useUser();

	const { toast } = useToast();

	const { mutate: addCommentMutation, isPending } = useMutation({
		mutationFn: async ({
			proposalType,
			proposalIndex,
			parentCommentId,
			commentContent
		}: {
			proposalType: EProposalType;
			proposalIndex: string;
			commentContent: string;
			parentCommentId?: string;
			voteData?: IVoteData;
			onFailed?: (content: string) => void;
		}) => {
			const { data, error } = await CommentClientService.addCommentToPost({
				proposalType,
				index: proposalIndex,
				content: commentContent,
				parentCommentId
			});

			if (error || !data) {
				throw new Error(error?.message || 'Failed to add comment');
			}

			return data;
		},
		onMutate: async ({ proposalType, proposalIndex, parentCommentId, commentContent, voteData }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: [EReactQueryKeys.COMMENTS, proposalType, proposalIndex] });

			// Snapshot the previous value
			const previousComments = queryClient.getQueryData([EReactQueryKeys.COMMENTS, proposalType, proposalIndex]);

			// Create optimistic comment
			const now = new Date();
			const optimisticComment: IComment = {
				content: commentContent.trim(),
				createdAt: now,
				id: `temp-${Date.now()}`,
				updatedAt: now,
				userId: user?.id || 0,
				network,
				proposalType,
				indexOrHash: proposalIndex,
				parentCommentId: parentCommentId || null,
				isDeleted: false,
				dataSource: EDataSource.POLKASSEMBLY,
				disabled: true
			};

			const publicUser = {
				username: user?.username || '',
				id: user?.id || 0,
				addresses: user?.addresses || [],
				profileScore: user?.id || 0,
				profileDetails: user?.publicUser?.profileDetails || DEFAULT_PROFILE_DETAILS
			};

			// Helper function to recursively find and update parent comment
			const findAndUpdateParent = (comments: ICommentResponse[]): ICommentResponse[] => {
				return comments.map((comment) => {
					if (comment.id === parentCommentId) {
						// Found the parent - add reply to its children
						return {
							...comment,
							children: [
								...(comment.children || []),
								{
									...optimisticComment,
									publicUser,
									...(voteData && { voteData: [voteData] })
								}
							]
						};
					}
					if (comment.children && comment.children.length > 0) {
						// Check children recursively
						return {
							...comment,
							children: findAndUpdateParent(comment.children)
						};
					}
					return comment;
				});
			};

			// Optimistically update to the new value
			if (parentCommentId) {
				// This is a reply - find parent recursively and add to its children
				queryClient.setQueryData([EReactQueryKeys.COMMENTS, proposalType, proposalIndex], (old: ICommentResponse[] = []) => findAndUpdateParent(old));
			} else {
				// This is a top-level comment
				queryClient.setQueryData([EReactQueryKeys.COMMENTS, proposalType, proposalIndex], (old: ICommentResponse[] = []) => [
					...old,
					{ ...optimisticComment, publicUser, ...(voteData && { voteData: [voteData] }) }
				]);
			}

			return { previousComments };
		},
		onError: (err, { commentContent, proposalType, proposalIndex, onFailed }, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			toast({
				title: 'Failed to add comment',
				description: err.message || 'Please try again later',
				status: ENotificationStatus.ERROR
			});
			if (context?.previousComments) {
				queryClient.setQueryData([EReactQueryKeys.COMMENTS, proposalType, proposalIndex], context.previousComments);
			}
			console.error('Failed to add comment:', err);
			onFailed?.(commentContent);
		},
		onSuccess: (data, { proposalType, proposalIndex, parentCommentId, commentContent }) => {
			// Helper function to recursively find and update optimistic comment with real data
			const findAndReplaceOptimistic = (comments: ICommentResponse[]): ICommentResponse[] => {
				return comments.map((comment) => {
					if (comment.id === parentCommentId) {
						// Found the parent - replace optimistic reply in its children
						return {
							...comment,
							children: (comment.children || []).map((child) =>
								child.id.startsWith('temp-') && child.content === commentContent
									? { ...child, ...data, id: data.id, createdAt: data.createdAt, updatedAt: data.updatedAt, disabled: false }
									: child
							)
						};
					}
					if (comment.children && comment.children.length > 0) {
						// Check children recursively
						return {
							...comment,
							children: findAndReplaceOptimistic(comment.children)
						};
					}
					return comment;
				});
			};

			// Update with real data from server
			if (parentCommentId) {
				// This is a reply - find parent recursively and update optimistic reply
				queryClient.setQueryData([EReactQueryKeys.COMMENTS, proposalType, proposalIndex], (old: ICommentResponse[] = []) => findAndReplaceOptimistic(old));
			} else {
				// This is a top-level comment
				queryClient.setQueryData([EReactQueryKeys.COMMENTS, proposalType, proposalIndex], (old: ICommentResponse[] = []) =>
					old.map((comment) =>
						comment.id.startsWith('temp-') && comment.content === commentContent
							? { ...comment, ...data, id: data.id, createdAt: data.createdAt, updatedAt: data.updatedAt, disabled: false }
							: comment
					)
				);
			}
		},
		onSettled: (_, error, { proposalType, proposalIndex }) => {
			// Always refetch after error or success to ensure consistency
			queryClient.invalidateQueries({ queryKey: [EReactQueryKeys.COMMENTS, proposalType, proposalIndex] });
		}
	});

	const addComment = async ({
		proposalType,
		proposalIndex,
		parentCommentId,
		content,
		voteData,
		onFailed
	}: {
		proposalType: EProposalType;
		proposalIndex: string;
		parentCommentId?: string;
		content: string;
		voteData?: IVoteData;
		onFailed?: (content: string) => void;
	}) => {
		if (!content?.trim() || !user) return;
		LocalStorageClientService.deleteCommentData({ postId: proposalIndex, parentCommentId });

		// Trigger mutation
		addCommentMutation({ proposalType, proposalIndex, parentCommentId, commentContent: content.trim(), voteData, onFailed });
	};

	return { addComment, addingComment: isPending };
};
