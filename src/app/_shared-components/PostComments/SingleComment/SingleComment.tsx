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
import { useAtomValue } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { useTranslations } from 'next-intl';
import { Ellipsis } from 'lucide-react';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import AddComment from '../AddComment/AddComment';
import classes from './SingleComment.module.scss';
import Address from '../../Profile/Address/Address';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';

function SingleComment({
	commentData,
	proposalType,
	index,
	setParentComment
}: {
	commentData: ICommentResponse;
	proposalType: EProposalType;
	index: string;
	setParentComment?: React.Dispatch<React.SetStateAction<ICommentResponse | null>>;
}) {
	const [reply, setReply] = useState<boolean>(false);
	const t = useTranslations();

	const [comment, setComment] = useState<ICommentResponse | null>(commentData);
	const [showReplies, setShowReplies] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

	const user = useAtomValue(userAtom);

	const handleDeleteComment = async () => {
		if (!user || !comment || user.id !== comment.user.id) {
			throw new ClientError('You are not the owner of this comment');
		}

		setLoading(true);
		const { data, error } = await CommentClientService.deleteCommentFromPost({
			id: comment.id,
			proposalType,
			index
		});

		if (error) {
			setLoading(false);
			throw new ClientError(error.message);
		}

		setLoading(false);

		if (data) {
			setOpenDeleteModal(false);
			if (comment.parentCommentId && setParentComment) {
				setParentComment((prev) => {
					if (!prev) return null;
					return {
						...prev,
						children: prev.children?.filter((child) => child.id !== comment.id)
					};
				});
			} else {
				setComment(null);
			}
		}
	};

	if (!comment) {
		return null;
	}

	return (
		<div className={classes.wrapper}>
			<Dialog
				open={openDeleteModal}
				onOpenChange={setOpenDeleteModal}
			>
				<DialogContent className='max-w-xl p-6'>
					<DialogHeader className='text-xl font-semibold text-text_primary'>
						<DialogTitle>{t('PostDetails.deleteComment')}</DialogTitle>
					</DialogHeader>
					<DialogDescription className='text-text_primary'>{t('PostDetails.deleteCommentConfirmation')}</DialogDescription>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setOpenDeleteModal(false)}
						>
							{t('PostDetails.cancel')}
						</Button>
						<Button
							isLoading={loading}
							onClick={handleDeleteComment}
						>
							{t('PostDetails.delete')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<div>
				<Identicon
					size={30}
					value={comment.user.addresses[0]}
					theme='polkadot'
				/>
			</div>
			<div className={classes.innerWrapper}>
				<div className='flex items-center gap-x-2'>
					<span className={classes.username}>
						<Address
							address={comment.user.addresses[0]}
							showIdenticon={false}
						/>
					</span>
					<Separator
						orientation='vertical'
						className='h-3'
					/>
					<CreatedAtTime createdAt={comment.createdAt} />
				</div>
				<BlockEditor
					readOnly
					data={comment.content}
					className={classes.editor}
					id={`comment-${comment.id}`}
				/>

				{user && (
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
							{t('PostDetails.reply')}
						</Button>
						{comment.userId === user.id && (
							<DropdownMenu>
								<DropdownMenuTrigger>
									<Ellipsis
										className='text-text_primary/[0.8]'
										size={14}
									/>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem>
										<Button
											variant='ghost'
											className='p-0 text-sm text-text_primary'
											disabled={comment.userId !== user.id}
											onClick={() => setOpenDeleteModal(true)}
											size='sm'
											isLoading={loading}
										>
											{t('PostDetails.delete')}
										</Button>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				)}

				{reply && (
					<AddComment
						proposalIndex={index}
						proposalType={proposalType}
						parentCommentId={comment.id}
						onCancel={() => setReply(false)}
						editorId={`new-comment-${comment.id}`}
						onConfirm={(newComment, publicUser) => {
							setComment((prev) => {
								if (!prev) return null;
								return {
									...prev,
									children: [
										...(prev.children || []),
										{
											...newComment,
											user: publicUser
										}
									]
								};
							});
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
								{showReplies ? t('PostDetails.hideReplies') : `${t('PostDetails.viewReplies')} (${comment.children.length})`}
							</Button>
						</div>
						{showReplies &&
							comment.children.map((item) => (
								<SingleComment
									key={item.id}
									proposalType={proposalType}
									index={index}
									commentData={item}
									setParentComment={setComment}
								/>
							))}
					</div>
				)}
			</div>
		</div>
	);
}

export default SingleComment;
