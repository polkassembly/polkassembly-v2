// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalType, ICommentResponse, IComment, IPublicUser, ENotificationStatus } from '@/_shared/types';
import { Dispatch, SetStateAction, useCallback, memo, useState, useRef } from 'react';
import Identicon from '@polkadot/react-identicon';
import ReplyIcon from '@assets/icons/Vote.svg';
import Image from 'next/image';
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
import UserIcon from '@assets/profile/user-icon.svg';
import { MarkdownViewer } from '@ui/MarkdownViewer/MarkdownViewer';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EVM_NETWORKS } from '@/_shared/_constants/evmNetworks';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { useToast } from '@/hooks/useToast';
import AddComment from '../AddComment/AddComment';
import classes from './SingleComment.module.scss';
import Address from '../../Profile/Address/Address';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';
import VoteComments from '../VoteComments/VoteComments';
import { MarkdownEditor } from '../../MarkdownEditor/MarkdownEditor';

interface SingleCommentProps {
	commentData: ICommentResponse;
	proposalType: EProposalType;
	index: string;
	setParentComment?: Dispatch<SetStateAction<ICommentResponse | null>>;
}

function SingleComment({ commentData, proposalType, index, setParentComment }: SingleCommentProps) {
	const [reply, setReply] = useState<boolean>(false);
	const t = useTranslations();
	const [comment, setComment] = useState<ICommentResponse | null>(commentData);
	const [showReplies, setShowReplies] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

	const markdownEditorRef = useRef<MDXEditorMethods | null>(null);

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [content, setContent] = useState<string>(commentData.content);

	const user = useAtomValue(userAtom);

	const { toast } = useToast();

	const toggleEditComment = useCallback(() => {
		if (!user || !comment || user.id !== comment.userId) {
			return;
		}

		setIsEditing((prev) => !prev);
	}, [comment, user]);

	const handleDeleteComment = useCallback(async () => {
		if (!user || !comment || user.id !== comment.userId) {
			toast({
				title: 'Failed!',
				description: 'You are not the owner of this comment',
				status: ENotificationStatus.ERROR
			});
			return;
		}

		setLoading(true);
		const { data, error } = await CommentClientService.deleteCommentFromPost({
			id: comment.id,
			proposalType,
			index
		});

		if (error || !data) {
			setLoading(false);
			throw new ClientError(error?.message || 'Failed to delete comment');
		}

		setLoading(false);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comment, index, proposalType, setParentComment, user]);

	const handleEditComment = useCallback(async () => {
		if (!user || !comment || user.id !== comment.userId) {
			toast({
				title: 'Failed!',
				description: 'You are not the owner of this comment',
				status: ENotificationStatus.ERROR
			});
			return;
		}

		// Store original content for rollback if needed
		const originalContent = comment.content;
		const originalUpdatedAt = comment.updatedAt;

		// Optimistically update the comment content
		setComment((prev) => {
			if (!prev) return null;
			return {
				...prev,
				content,
				updatedAt: new Date()
			};
		});
		setIsEditing(false);

		setLoading(true);

		const { data, error } = await CommentClientService.editCommentFromPost({
			id: comment.id,
			proposalType,
			index,
			content
		});

		setLoading(false);

		if (error || !data) {
			// Revert to original content if the API call failed
			setComment((prev) => {
				if (!prev) return null;
				return {
					...prev,
					content: originalContent,
					updatedAt: originalUpdatedAt || comment.createdAt
				};
			});

			toast({
				title: 'Failed!',
				description: error?.message || 'Failed to edit comment',
				status: ENotificationStatus.ERROR
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comment, content, index, proposalType, user]);

	const handleCloseDeleteModal = useCallback(() => setOpenDeleteModal(false), []);
	const handleOpenDeleteModal = useCallback(() => setOpenDeleteModal(true), []);
	const handleToggleReply = useCallback(() => setReply(true), []);
	const handleToggleShowReplies = useCallback(() => setShowReplies((prev) => !prev), []);

	const handleCancelReply = useCallback(() => setReply(false), []);

	const handleConfirmReply = useCallback((newComment: IComment, publicUser: IPublicUser) => {
		setComment((prev) => {
			if (!prev) return null;
			return {
				...prev,
				children: [
					...(prev.children || []),
					{
						...newComment,
						publicUser
					}
				]
			};
		});
		setReply(false);
		setShowReplies(true);
	}, []);

	if (!comment) {
		return null;
	}

	const network = getCurrentNetwork();
	const userAddresses = !EVM_NETWORKS.includes(network) ? comment?.publicUser?.addresses?.filter((address) => !address.startsWith('0x')) : comment?.publicUser?.addresses;

	const addressToDisplay = userAddresses?.[0] || comment?.publicUser?.addresses?.[0];

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
							onClick={handleCloseDeleteModal}
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
				{addressToDisplay ? (
					<Identicon
						size={30}
						value={addressToDisplay}
						theme='polkadot'
					/>
				) : comment?.publicUser?.profileDetails?.image ? (
					<Image
						src={comment.publicUser.profileDetails.image}
						alt='profile'
						className='rounded-full'
						width={30}
						height={30}
					/>
				) : (
					<div>
						<Image
							src={UserIcon}
							alt='profile'
							className='h-[30px] w-[30px] rounded-full'
						/>
					</div>
				)}
			</div>
			<div className={classes.innerWrapper}>
				<div className='flex flex-wrap items-center gap-x-2 gap-y-2'>
					<span className={classes.username}>
						{addressToDisplay ? (
							<Address
								address={addressToDisplay}
								showIdenticon={false}
							/>
						) : (
							<span className='text-text_primary'>{comment?.publicUser?.username}</span>
						)}
					</span>
					<Separator
						orientation='vertical'
						className='h-3'
					/>
					<CreatedAtTime createdAt={comment.updatedAt || comment.createdAt} />
					{comment.voteData && comment.voteData.length > 0 && (
						<>
							<Separator
								orientation='vertical'
								className='h-3'
							/>
							<VoteComments voteInfo={comment.voteData[0]} />
						</>
					)}
				</div>
				{isEditing ? (
					<div>
						<div className='mb-2'>
							<MarkdownEditor
								markdown={comment.content}
								ref={markdownEditorRef}
								onChange={(newContent) => setContent(newContent)}
							/>
						</div>
						<div className='flex w-full items-center justify-end gap-x-2'>
							<Button
								variant='secondary'
								onClick={toggleEditComment}
								disabled={loading}
							>
								{t('PostDetails.cancel')}
							</Button>
							<Button
								className={classes.postBtn}
								onClick={handleEditComment}
								disabled={!content?.trim()}
								isLoading={loading}
							>
								{t('PostDetails.save')}
							</Button>
						</div>
					</div>
				) : (
					<MarkdownViewer
						markdown={comment.content}
						className={classes.editor}
					/>
				)}

				{user && (
					<div className={classes.tools}>
						<Button
							variant='ghost'
							className={classes.replyButton}
							onClick={handleToggleReply}
							size='sm'
							leftIcon={
								<Image
									src={ReplyIcon}
									alt='reply'
									className='darkIcon'
								/>
							}
						>
							{t('PostDetails.reply')}
						</Button>
						<div>
							{comment.userId === user.id && (
								<DropdownMenu>
									<DropdownMenuTrigger
										noArrow
										className='border-none'
									>
										<Ellipsis
											className='text-text_primary/[0.8]'
											size={14}
										/>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem className='hover:bg-bg_pink/10'>
											<Button
												variant='ghost'
												className='h-auto p-0 text-sm text-text_primary'
												disabled={comment.userId !== user.id}
												onClick={toggleEditComment}
												size='sm'
												isLoading={loading}
											>
												{t('PostDetails.edit')}
											</Button>
										</DropdownMenuItem>
										<DropdownMenuItem className='hover:bg-bg_pink/10'>
											<Button
												variant='ghost'
												className='h-auto p-0 text-sm text-text_primary'
												disabled={comment.userId !== user.id}
												onClick={handleOpenDeleteModal}
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
					</div>
				)}

				{reply && (
					<AddComment
						proposalIndex={index}
						proposalType={proposalType}
						parentCommentId={comment.id}
						onCancel={handleCancelReply}
						onConfirm={handleConfirmReply}
						isReply
						replyTo={comment?.publicUser}
					/>
				)}

				{comment.children && comment.children.length > 0 && (
					<div className={classes.replies}>
						<div className={classes.viewReplies}>
							<Separator className='w-[20px]' />
							<Button
								onClick={handleToggleShowReplies}
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

export default memo(SingleComment);
