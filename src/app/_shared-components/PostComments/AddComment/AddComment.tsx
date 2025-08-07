// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EDataSource, ENotificationStatus, EProposalType, EReactQueryKeys, IComment, ICommentResponse, IPublicUser, IVoteData } from '@/_shared/types';
import { Button } from '@ui/Button';
import { useTranslations } from 'next-intl';
import { LocalStorageClientService } from '@/app/_client-services/local_storage_client_service';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { useIdentityService } from '@/hooks/useIdentityService';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUser } from '@/hooks/useUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { DEFAULT_PROFILE_DETAILS } from '@/_shared/_constants/defaultProfileDetails';
import { useToast } from '@/hooks/useToast';
import { MarkdownEditor } from '../../MarkdownEditor/MarkdownEditor';
import classes from './AddComment.module.scss';

function AddComment({
	proposalType,
	proposalIndex,
	parentCommentId,
	onSuccess,
	onOptimisticUpdate,
	onCancel,
	isReply,
	replyTo,
	voteData
}: {
	proposalType: EProposalType;
	proposalIndex: string;
	parentCommentId?: string;
	onSuccess?: (newComment: IComment) => void;
	onOptimisticUpdate?: (newComment: IComment, publicUser: IPublicUser) => void;
	onCancel?: () => void;
	isReply?: boolean;
	replyTo?: Omit<IPublicUser, 'rank'>;
	voteData?: IVoteData;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const savedContent = LocalStorageClientService.getCommentData({ postId: proposalIndex, parentCommentId });
	const [content, setContent] = useState<string | null>(savedContent);
	const { getOnChainIdentity } = useIdentityService();

	const queryClient = useQueryClient();

	const { toast } = useToast();

	const { user } = useUser();

	const markdownEditorRef = useRef<MDXEditorMethods | null>(null);

	const handleReplyMention = useCallback(async () => {
		if (!isReply || !replyTo) return;

		const proposer = replyTo?.addresses?.[0];
		const encodedProposer = getEncodedAddress(proposer, network);
		let mentionContent = '';

		if (proposer) {
			const onChainInfo = await getOnChainIdentity(encodedProposer || '');
			const displayName = onChainInfo?.display || onChainInfo?.nickname || onChainInfo?.legal || onChainInfo?.email || onChainInfo?.displayParent;

			const userLink = `${global.window.location.origin}/user/address/${encodedProposer}`;
			mentionContent = displayName ? `[@${displayName}](${userLink})` : `[@${encodedProposer}](${userLink})`;
		} else {
			mentionContent = `[@${replyTo.username}](${global.window.location.origin}/user/${replyTo.username})`;
		}

		markdownEditorRef.current?.setMarkdown(`${mentionContent}&nbsp;`);
	}, [isReply, replyTo, network, getOnChainIdentity]);

	useEffect(() => {
		if (!isReply || !replyTo) return;
		handleReplyMention();
	}, [isReply, handleReplyMention, replyTo]);

	const onCommentFailed = (originalContent: string) => {
		setContent(originalContent);
		LocalStorageClientService.setCommentData({ postId: proposalIndex, parentCommentId, data: originalContent });
	};

	const { mutate: addCommentMutation } = useMutation({
		mutationFn: async (commentContent: string) => {
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
		onMutate: async (commentContent) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: [EReactQueryKeys.COMMENTS, proposalType, proposalIndex] });

			// Snapshot the previous value
			const previousComments = queryClient.getQueryData([EReactQueryKeys.COMMENTS, proposalType, proposalIndex]);

			if (!user) return { previousComments };

			// Create optimistic comment
			const now = new Date();
			const optimisticComment: IComment = {
				content: commentContent.trim(),
				createdAt: now,
				id: `temp-${Date.now()}`,
				updatedAt: now,
				userId: user.id,
				network,
				proposalType,
				indexOrHash: proposalIndex,
				parentCommentId: parentCommentId || null,
				isDeleted: false,
				dataSource: EDataSource.POLKASSEMBLY,
				disabled: true
			};

			const publicUser = {
				username: user.username,
				id: user.id,
				addresses: user.addresses,
				profileScore: user.publicUser?.profileScore || 0,
				profileDetails: user.publicUser?.profileDetails || DEFAULT_PROFILE_DETAILS
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

			// Clear form immediately
			setContent(null);
			markdownEditorRef.current?.setMarkdown('');
			LocalStorageClientService.deleteCommentData({ postId: proposalIndex, parentCommentId });

			onOptimisticUpdate?.(optimisticComment, publicUser);

			return { previousComments };
		},
		onError: (err, commentContent, context) => {
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
			onCommentFailed(commentContent);
		},
		onSuccess: (data, commentContent) => {
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

			onSuccess?.(data);
		}
	});

	const addCommentToPost = async () => {
		if (!content?.trim() || !user) return;

		// Trigger mutation
		addCommentMutation(content.trim());
	};

	return (
		<div>
			<div className='mb-2'>
				<MarkdownEditor
					markdown={content || ''}
					onChange={(data) => {
						setContent(data);
						LocalStorageClientService.setCommentData({ postId: proposalIndex, parentCommentId, data });
					}}
					ref={markdownEditorRef}
				/>
			</div>

			<div className={classes.btnWrapper}>
				{onCancel && (
					<Button
						variant='secondary'
						onClick={onCancel}
					>
						{t('PostDetails.cancel')}
					</Button>
				)}
				<Button
					className={classes.postBtn}
					onClick={addCommentToPost}
					disabled={!content?.trim()}
				>
					{t('PostDetails.post')}
				</Button>
			</div>
		</div>
	);
}

export default AddComment;
