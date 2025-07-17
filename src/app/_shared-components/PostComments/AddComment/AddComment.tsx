// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EProposalType, IPublicUser, IVoteData } from '@/_shared/types';
import { Button } from '@ui/Button';
import { useTranslations } from 'next-intl';
import { LocalStorageClientService } from '@/app/_client-services/local_storage_client_service';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { useIdentityService } from '@/hooks/useIdentityService';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUser } from '@/hooks/useUser';
import { useComments } from '@/hooks/useComments';
import classes from './AddComment.module.scss';
import { MarkdownEditor } from '../../MarkdownEditor/MarkdownEditor';

function AddComment({
	proposalType,
	proposalIndex,
	parentCommentId,
	onConfirm,
	onCancel,
	isReply,
	replyTo,
	voteData
}: {
	proposalType: EProposalType;
	proposalIndex: string;
	parentCommentId?: string;
	onConfirm?: () => void;
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

	const { user } = useUser();

	const { addComment } = useComments();

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

	const addCommentToPost = async () => {
		if (!content?.trim() || !user) return;

		// Clear form immediately
		setContent(null);
		markdownEditorRef.current?.setMarkdown('');
		onConfirm?.();

		// Trigger mutation
		addComment({ proposalType, proposalIndex, parentCommentId, content: content.trim(), voteData, onFailed: onCommentFailed });
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
