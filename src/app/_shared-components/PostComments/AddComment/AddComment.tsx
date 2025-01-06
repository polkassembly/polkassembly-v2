// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useRef, useState } from 'react';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { EProposalType, IComment, IPublicUser } from '@/_shared/types';
import { OutputData } from '@editorjs/editorjs';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import BlockEditor from '@ui/BlockEditor/BlockEditor';
import { Button } from '@ui/Button';
import Identicon from '@polkadot/react-identicon';
import classes from './AddComment.module.scss';

function AddComment({
	proposalType,
	proposalIndex,
	parentCommentId,
	onConfirm,
	onCancel,
	editorId
}: {
	proposalType: EProposalType;
	proposalIndex: string;
	parentCommentId?: string;
	onConfirm?: (newComment: IComment, user: IPublicUser) => void;
	onCancel?: () => void;
	editorId: string;
}) {
	const [content, setContent] = useState<OutputData | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const user = useAtomValue(userAtom);

	const blockEditorActionsRef = useRef<{ clearEditor: () => void } | null>(null);

	const addComment = async () => {
		if (!content || !content.blocks || (content as unknown as OutputData).blocks.length === 0 || !user) return;
		try {
			setLoading(true);
			const { data, error } = await CommentClientService.addCommentToPost({
				proposalType,
				index: proposalIndex,
				content,
				parentCommentId
			});

			if (error) {
				setLoading(false);
				console.log(error.message);
				return;
			}

			if (data) {
				const publicUser: IPublicUser = {
					username: user.username,
					id: user.id,
					addresses: user.addresses,
					profileScore: user.id
				};

				onConfirm?.({ ...data, content: content as unknown as Record<string, unknown> }, publicUser);

				setContent(null);
				blockEditorActionsRef.current?.clearEditor?.();
			}
			setLoading(false);
		} catch (err) {
			setLoading(false);
			console.log(err);
		}
	};

	return (
		<div className={classes.wrapper}>
			<Identicon
				value={user?.addresses[0]}
				theme='polkadot'
				size={30}
			/>
			<div className={classes.editorWrapper}>
				<div className='flex-1'>
					<BlockEditor
						onChange={(data) => {
							setContent(data);
						}}
						id={editorId}
						ref={blockEditorActionsRef}
					/>
				</div>
				<div className={classes.btnWrapper}>
					{onCancel && (
						<Button
							variant='secondary'
							onClick={onCancel}
							disabled={loading}
						>
							Cancel
						</Button>
					)}
					<Button
						className={classes.postBtn}
						onClick={addComment}
						disabled={!content || !content.blocks || (content as unknown as OutputData).blocks.length === 0}
						isLoading={loading}
					>
						Post
					</Button>
				</div>
			</div>
		</div>
	);
}

export default AddComment;
