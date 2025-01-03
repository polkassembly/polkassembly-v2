// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalType, ICommentResponse } from '@/_shared/types';
import React, { useState } from 'react';
import Identicon from '@polkadot/react-identicon';
import ReplyIcon from '@assets/icons/Vote.svg';
import Image from 'next/image';
import BlockEditor from '@ui/BlockEditor/BlockEditor';
import { Button } from '@ui/Button';
import CreatedAtTime from '@ui/CreatedAtTime/CreatedAtTime';
import { Separator } from '@ui/Separator';
import AddComment from '../AddComment/AddComment';
import classes from './SingleComment.module.scss';

function SingleComment({ commentData, proposalType, index }: { commentData: ICommentResponse; proposalType: EProposalType; index: string }) {
	const [reply, setReply] = useState<boolean>(false);
	// const [replyContent, setReplyContent] = useState<OutputData | null>(null);

	const [comment, setComment] = useState<ICommentResponse>(commentData);
	const [showReplies, setShowReplies] = useState<boolean>(false);

	return (
		<div className={classes.wrapper}>
			<div>
				<Identicon
					size={30}
					value={comment.user.addresses[0]}
					theme='polkadot'
				/>
			</div>
			<div className={classes.innerWrapper}>
				<div className='flex gap-x-2'>
					<span className={classes.username}>{comment.user.username}</span>
					<Separator orientation='vertical' />
					<CreatedAtTime createdAt={comment.createdAt} />
				</div>
				<BlockEditor
					readOnly
					data={comment.content}
					className={classes.editor}
					id={`comment-${comment.id}`}
				/>

				<div className={classes.tools}>
					<Button
						variant='ghost'
						className={classes.replyButton}
						onClick={() => setReply(true)}
						size='sm'
						leftIcon={
							<Image
								src={ReplyIcon}
								alt='reply'
							/>
						}
					>
						Reply
					</Button>
				</div>

				{reply && (
					<AddComment
						proposalIndex={index}
						proposalType={proposalType}
						parentCommentId={comment.id}
						onCancel={() => setReply(false)}
						editorId={`new-comment-${comment.id}`}
						onConfirm={(newComment, user) => {
							setComment((prev) => ({
								...prev,
								children: [
									...(prev.children || []),
									{
										...newComment,
										user
									}
								]
							}));
							setReply(false);
							setShowReplies(true);
						}}
					/>
				)}

				{comment.children && comment.children.length > 0 && (
					<div className={classes.replies}>
						<div className={classes.viewReplies}>
							<Separator className='w-[20px]' />
							<Button
								onClick={() => setShowReplies((prev) => !prev)}
								className={classes.viewBtn}
								variant='ghost'
								size='sm'
							>
								{showReplies ? 'Hide Replies' : `View Replies (${comment.children.length})`}
							</Button>
						</div>
						{showReplies &&
							comment.children.map((item) => (
								<SingleComment
									key={item.id}
									proposalType={proposalType}
									index={index}
									commentData={item}
								/>
							))}
					</div>
				)}
			</div>
		</div>
	);
}

export default SingleComment;
