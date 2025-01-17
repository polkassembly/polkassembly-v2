// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
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

async function fetchComments(proposalType: EProposalType, index: string) {
	const { data } = await CommentClientService.getCommentsOfPost({ proposalType, index });
	return data;
}

function PostComments({ proposalType, index }: { proposalType: EProposalType; index: string }) {
	const { data, error, isLoading } = useQuery({
		queryKey: ['comments', proposalType, index],
		queryFn: () => fetchComments(proposalType, index),
		staleTime: 300000,
		retry: 3
	});

	if (isLoading) {
		return <p>Loading comments...</p>;
	}

	if (error instanceof Error) {
		return <p>Error: {error.message}</p>;
	}

	return (
		<div>
			<CommentsTitle count={data?.length || 0} />
			<Comments
				proposalType={proposalType}
				index={index}
				comments={data || []}
			/>
		</div>
	);
}

export default PostComments;
