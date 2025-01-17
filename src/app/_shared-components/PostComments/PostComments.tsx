// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalType, ICommentResponse } from '@/_shared/types';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Comments from './Comments/Comments';
import classes from './PostComments.module.scss';

function CommentsTitle({ count }: { count: number }) {
	'use client';

	const t = useTranslations();
	return (
		<p className={classes.title}>
			{t('PostDetails.comments')} <span className='text-base font-normal'>({count})</span>
		</p>
	);
}

function PostComments({ proposalType, index }: { proposalType: EProposalType; index: string }) {
	const [showAllComments, setShowAllComments] = useState(false);
	const [comments, setComments] = useState<ICommentResponse[]>([]);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchComments = async () => {
			const { data, error } = await CommentClientService.getCommentsOfPost({ proposalType, index });
			if (error) {
				setError(error);
			}
			setComments(data || []);
		};
		fetchComments();
	}, [proposalType, index]);

	const displayedComments = showAllComments ? comments : comments.slice(0, 2);

	return (
		<div>
			{error && <p>{error.message}</p>}
			<CommentsTitle count={comments.length} />
			<Comments
				proposalType={proposalType}
				index={index}
				comments={displayedComments}
			/>
			{comments.length > 2 && !showAllComments && (
				<button
					onClick={() => setShowAllComments(true)}
					className='text-pink_primary hover:text-pink_secondary mt-4'
					type='button'
				>
					Load More
				</button>
			)}
		</div>
	);
}

export default PostComments;
