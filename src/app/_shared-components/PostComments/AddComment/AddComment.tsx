// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { ECommentActions, EDataSource, ENotificationStatus, EProposalType, IComment, IPublicUser } from '@/_shared/types';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { Button } from '@ui/Button';
import { useTranslations } from 'next-intl';
import { LocalStorageClientService } from '@/app/_client-services/local_storage_client_service';
import { DEFAULT_PROFILE_DETAILS } from '@/_shared/_constants/defaultProfileDetails';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { useIdentityService } from '@/hooks/useIdentityService';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { createId as createCuid } from '@paralleldrive/cuid2';
import { useToast } from '@/hooks/useToast';
import classes from './AddComment.module.scss';
import { MarkdownEditor } from '../../MarkdownEditor/MarkdownEditor';

function AddComment({
	proposalType,
	proposalIndex,
	parentCommentId,
	onConfirm,
	onCancel,
	isReply,
	replyTo
}: {
	proposalType: EProposalType;
	proposalIndex: string;
	parentCommentId?: string;
	onConfirm?: ({ newComment, publicUser, action }: { newComment: IComment; publicUser: Omit<IPublicUser, 'rank'>; action: ECommentActions }) => void;
	onCancel?: () => void;
	isReply?: boolean;
	replyTo?: Omit<IPublicUser, 'rank'>;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { toast } = useToast();
	const savedContent = LocalStorageClientService.getCommentData({ postId: proposalIndex, parentCommentId });
	const [content, setContent] = useState<string | null>(savedContent);
	const [loading, setLoading] = useState<boolean>(false);
	const { getOnChainIdentity } = useIdentityService();

	const user = useAtomValue(userAtom);

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

	const addComment = async () => {
		if (!content?.trim() || !user) return;

		const publicUser = {
			username: user.username,
			id: user.id,
			addresses: user.addresses,
			profileScore: user.id,
			profileDetails: user.publicUser?.profileDetails || DEFAULT_PROFILE_DETAILS
		};

		setLoading(true);

		const id = createCuid();
		const comment: IComment = {
			content,
			id,
			createdAt: new Date(),
			userId: user.id,
			network,
			proposalType,
			indexOrHash: proposalIndex,
			updatedAt: new Date(),
			parentCommentId: null,
			isDeleted: false,
			dataSource: EDataSource.POLKASSEMBLY
		};

		onConfirm?.({ newComment: comment, publicUser, action: ECommentActions.ADD });

		setContent(null);
		LocalStorageClientService.deleteCommentData({ postId: proposalIndex, parentCommentId });
		markdownEditorRef.current?.setMarkdown('');
		setLoading(false);

		try {
			const { data, error } = await CommentClientService.addCommentToPost({
				proposalType,
				index: proposalIndex,
				content,
				parentCommentId
			});

			if (error) {
				setLoading(false);
				onConfirm?.({ newComment: comment, publicUser, action: ECommentActions.DELETE });
				// show notification
				toast({
					status: ENotificationStatus.ERROR,
					title: t('PostDetails.commentNotSent'),
					description: t('PostDetails.commentNotSentDescription')
				});
				setContent(content);
				markdownEditorRef.current?.setMarkdown(content);

				return;
			}

			if (data) {
				setContent(null);
				LocalStorageClientService.deleteCommentData({ postId: proposalIndex, parentCommentId });
				markdownEditorRef.current?.setMarkdown('');
			}
		} catch {
			setLoading(false);
			// show notification
			toast({
				status: ENotificationStatus.ERROR,
				title: t('PostDetails.commentNotSent'),
				description: t('PostDetails.commentNotSentDescription')
			});
		}
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
						disabled={loading}
					>
						{t('PostDetails.cancel')}
					</Button>
				)}
				<Button
					className={classes.postBtn}
					onClick={addComment}
					disabled={!content?.trim()}
					isLoading={loading}
				>
					{t('PostDetails.post')}
				</Button>
			</div>
		</div>
	);
}

export default AddComment;
