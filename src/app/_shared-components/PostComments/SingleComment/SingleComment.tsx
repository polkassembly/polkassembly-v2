// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ICommentResponse, ENotificationStatus, ICommentHistoryItem } from '@/_shared/types';
import { Dispatch, SetStateAction, useCallback, memo, useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Identicon from '@polkadot/react-identicon';
import Image from 'next/image';
import { Button } from '@ui/Button';
import Link from 'next/link';
import CreatedAtTime from '@ui/CreatedAtTime/CreatedAtTime';
import { Separator } from '@ui/Separator';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { useTranslations } from 'next-intl';
import { CornerUpLeft, Ellipsis } from 'lucide-react';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { getPostTypeUrl } from '@/app/_client-utils/getPostDetailsUrl';
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
import { Skeleton } from '../../Skeleton';
import CommentReactions from '../CommentReactions/CommentReactions';

const CommentHistory = dynamic(() => import('./CommentHistory/CommentHistory'), { ssr: false, loading: () => <Skeleton className='h-8 w-16' /> });

interface SingleCommentProps {
	commentData: ICommentResponse;
	setParentComment?: Dispatch<SetStateAction<ICommentResponse | null>>;
	setComments?: Dispatch<SetStateAction<ICommentResponse[]>>;
	parentCommentId?: string;
}

function SingleComment({ commentData, setParentComment, setComments, parentCommentId }: SingleCommentProps) {
	const { proposalType, indexOrHash: index } = commentData;

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
	const [history, setHistory] = useState<ICommentHistoryItem[]>(commentData?.history || []);

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
			setComments?.((prev) => {
				if (!prev) return [];
				const parentComment = prev.find((c) => c.id === parentCommentId);
				if (!parentComment) return prev;
				return [...prev.filter((c) => c.id !== parentCommentId), { ...parentComment, children: parentComment.children?.filter((c) => c.id !== comment.id) }];
			});
		} else {
			setComment(null);
		}
		setComments?.((prev) => prev?.filter((c) => c.id !== comment.id));
		toast({
			title: 'Success!',
			description: 'Comment deleted successfully',
			status: ENotificationStatus.SUCCESS
		});
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

		// create a new comment history item with the new content
		setHistory((prev) => [...prev, { content: originalContent || '', createdAt: new Date() }]);

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
			// remove the new history item from the comment history array
			setHistory((prev) => (prev && prev.length ? prev.slice(0, -1) : []));
			return;
		}
		toast({
			title: 'Success!',
			description: 'Comment edited successfully',
			status: ENotificationStatus.SUCCESS
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comment, content, index, proposalType, user]);

	const handleCloseDeleteModal = useCallback(() => setOpenDeleteModal(false), []);
	const handleOpenDeleteModal = useCallback(() => setOpenDeleteModal(true), []);
	const handleToggleReply = useCallback(() => setReply(true), []);
	const handleToggleShowReplies = useCallback(() => setShowReplies((prev) => !prev), []);

	const handleCancelReply = useCallback(() => setReply(false), []);

	useEffect(() => {
		setComment(commentData);
	}, [commentData]);

	const handleCopyCommentLink = useCallback(() => {
		const baseUrl = getPostTypeUrl({ proposalType, indexOrHash: index });

		// Check if baseUrl is already an absolute URL (starts with http/https)
		const isAbsoluteUrl = baseUrl.startsWith('http://') || baseUrl.startsWith('https://');
		const url = isAbsoluteUrl ? `${baseUrl}#comment-${comment?.id}` : `${window?.location?.origin}${baseUrl}#comment-${comment?.id}`;

		navigator.clipboard.writeText(url);
		toast({
			title: 'Success!',
			description: 'Comment link copied to clipboard',
			status: ENotificationStatus.SUCCESS
		});
	}, [comment, index, proposalType, toast]);

	if (!comment) {
		return null;
	}

	const network = getCurrentNetwork();
	const userAddresses = !EVM_NETWORKS.includes(network) ? comment?.publicUser?.addresses?.filter((address) => !address.startsWith('0x')) : comment?.publicUser?.addresses;

	const addressToDisplay = comment?.authorAddress || userAddresses?.[0] || comment?.publicUser?.addresses?.[0];
	const isHighlighted = typeof window !== 'undefined' && window?.location?.hash === `#comment-${comment.id}`;
	const wrapperClassName = isHighlighted ? `${classes.wrapper} ${classes.highlighted}` : classes.wrapper;

	return (
		<div
			id={`comment-${comment.id}`}
			className={wrapperClassName}
		>
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
					{history && history?.length > 0 && (
						<CommentHistory
							authorAddress={addressToDisplay}
							authorUsername={comment?.publicUser?.username}
							history={[...history, { content: comment.content, createdAt: comment.updatedAt || comment.createdAt }]}
						/>
					)}
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

				<div className={classes.tools}>
					<CommentReactions
						commentData={comment}
						disabled={comment.disabled}
					/>
					{user ? (
						<Button
							variant='ghost'
							className={classes.replyButton}
							onClick={handleToggleReply}
							size='sm'
							disabled={comment.disabled}
							leftIcon={
								<CornerUpLeft
									size={14}
									className={classes.replyButton}
								/>
							}
						>
							{t('PostDetails.reply')}
						</Button>
					) : (
						<Link
							href='/login'
							className='p-0'
						>
							<Button
								variant='ghost'
								size='sm'
								className={classes.replyButton}
								leftIcon={
									<CornerUpLeft
										size={14}
										className={classes.replyButton}
									/>
								}
							>
								{t('PostDetails.reply')}
							</Button>
						</Link>
					)}
					<div className='ml-auto'>
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
										onClick={handleCopyCommentLink}
										size='sm'
									>
										{t('PostDetails.copyLink')}
									</Button>
								</DropdownMenuItem>
								{user && comment.userId === user.id && (
									<>
										<DropdownMenuItem className='hover:bg-bg_pink/10'>
											<Button
												variant='ghost'
												className='h-auto p-0 text-sm text-text_primary'
												disabled={comment.userId !== user.id || comment.disabled}
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
												disabled={comment.userId !== user.id || comment.disabled}
												onClick={handleOpenDeleteModal}
												size='sm'
												isLoading={loading}
											>
												{t('PostDetails.delete')}
											</Button>
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{reply && (
					<AddComment
						proposalIndex={index}
						proposalType={proposalType}
						parentCommentId={comment.id}
						onCancel={handleCancelReply}
						onOptimisticUpdate={() => {
							setReply(false);
							setShowReplies(true);
						}}
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
									commentData={item}
									setParentComment={setComment}
									setComments={setComments}
									parentCommentId={parentCommentId || comment.id}
								/>
							))}
					</div>
				)}
			</div>
		</div>
	);
}

export default memo(SingleComment);
