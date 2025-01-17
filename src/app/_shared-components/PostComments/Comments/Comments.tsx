// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalType, ICommentResponse } from '@/_shared/types';
import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { userAtom } from '@/app/_atoms/user/userAtom';
import Link from 'next/link';
import { HiOutlineArrowDownCircle } from 'react-icons/hi2';
import { useTranslations } from 'next-intl';
import SingleComment from '../SingleComment/SingleComment';
import AddComment from '../AddComment/AddComment';
import classes from './Comments.module.scss';

function Comments({ comments, proposalType, index }: { comments: ICommentResponse[]; proposalType: EProposalType; index: string }) {
	const t = useTranslations();
	const [allComments, setAllComments] = useState<ICommentResponse[]>(comments);
	const user = useAtomValue(userAtom);
	const [showMore, setShowMore] = useState(false);
	const commentsToShow = showMore ? allComments : allComments.slice(0, 2);

	const handleShowMore = () => {
		setShowMore(true);
	};

	const handleShowLess = () => {
		setShowMore(false);
	};

	return (
		<div className={classes.wrapper}>
			<div>
				{commentsToShow.map((item) => (
					<SingleComment
						proposalType={proposalType}
						index={index}
						key={item.id}
						commentData={item}
					/>
				))}
				{showMore && allComments?.length > 2 ? (
					<div className='flex justify-center'>
						<span
							onClick={handleShowLess}
							className={classes.loadMoreComments}
							aria-hidden='true'
						>
							{t('ActivityFeed.PostItem.showLessComments')} <HiOutlineArrowDownCircle className='text-lg' />
						</span>
					</div>
				) : (
					<div className='flex justify-center'>
						<span
							onClick={handleShowMore}
							className={classes.loadMoreComments}
							aria-hidden='true'
						>
							{t('ActivityFeed.PostItem.loadMoreComments')} <HiOutlineArrowDownCircle className='text-lg' />
						</span>
					</div>
				)}
			</div>

			{user ? (
				<AddComment
					proposalType={proposalType}
					proposalIndex={index}
					editorId='new-comment'
					onConfirm={(newComment, publicUser) => {
						setAllComments((prev) => [
							...prev,
							{
								...newComment,
								user: publicUser
							}
						]);
					}}
				/>
			) : (
				<div className={classes.loginToComment}>
					{t('PostDetails.please')}
					<Link
						className='text-text_pink'
						href='/login'
					>
						{t('PostDetails.login')}
					</Link>{' '}
					{t('PostDetails.toComment')}
				</div>
			)}
		</div>
	);
}

export default Comments;
