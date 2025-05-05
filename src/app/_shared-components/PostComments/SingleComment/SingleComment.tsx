// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalType, ICommentResponse, IComment, IPublicUser } from '@/_shared/types';
import { Dispatch, SetStateAction, useCallback, memo, useState } from 'react';
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
import AddComment from '../AddComment/AddComment';
import classes from './SingleComment.module.scss';
import Address from '../../Profile/Address/Address';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../DropdownMenu';
import VoteComments from '../VoteComments/VoteComments';

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

	const user = useAtomValue(userAtom);

	const handleDeleteComment = useCallback(async () => {
		if (!user || !comment || user.id !== comment.user.id) {
			throw new ClientError('You are not the owner of this comment');
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
	}, [comment, index, proposalType, setParentComment, user]);

	const handleCloseDeleteModal = useCallback(() => setOpenDeleteModal(false), []);
	const handleOpenDeleteModal = useCallback(() => setOpenDeleteModal(true), []);
	const handleToggleReply = useCallback(() => setReply(true), []);
	const handleToggleShowReplies = useCallback(() => setShowReplies((prev) => !prev), []);

	const handleCancelReply = useCallback(() => setReply(false), []);

	const handleConfirmReply = useCallback((newComment: IComment, publicUser: Omit<IPublicUser, 'rank'>) => {
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
	}, []);

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
				{comment.user.addresses[0] ? (
					<Identicon
						size={30}
						value={comment.user.addresses[0]}
						theme='polkadot'
					/>
				) : comment.user.profileDetails?.image ? (
					<Image
						src={comment.user.profileDetails.image}
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
				<div className='flex items-center gap-x-2'>
					<span className={classes.username}>
						{comment.user.addresses[0] ? (
							<Address
								address={comment.user.addresses[0]}
								showIdenticon={false}
							/>
						) : (
							<span className='text-text_primary'>{comment.user.username}</span>
						)}
					</span>
					<Separator
						orientation='vertical'
						className='h-3'
					/>
					<CreatedAtTime createdAt={comment.createdAt} />
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
				<MarkdownViewer
					markdown={comment.content}
					className={classes.editor}
				/>

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
										<DropdownMenuItem>
											<Button
												variant='ghost'
												className='p-0 text-sm text-text_primary'
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
						replyTo={comment?.user}
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
