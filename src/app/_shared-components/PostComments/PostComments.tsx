// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalType, EReactQueryKeys, ICommentResponse, IContentSummary } from '@/_shared/types';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import Comments from './Comments/Comments';
import classes from './PostComments.module.scss';
import { Skeleton } from '../Skeleton';
import AISummaryCollapsible from '../AISummary/AISummaryCollapsible';

function PostComments({
	proposalType,
	index,
	contentSummary,
	comments
}: {
	proposalType: EProposalType;
	index: string;
	contentSummary?: IContentSummary;
	comments?: ICommentResponse[];
}) {
	const t = useTranslations();

	const fetchComments = async () => {
		const { data, error } = await CommentClientService.getCommentsOfPost({ proposalType, index });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data, isLoading } = useQuery({
		queryKey: [EReactQueryKeys.COMMENTS, proposalType, index],
		queryFn: () => fetchComments(),
		placeholderData: (previousData) => previousData || comments,
		retry: true,
		refetchOnMount: true,
		refetchOnWindowFocus: true
	});

	return (
		<div>
			<p className={classes.title}>
				{t('PostDetails.comments')} <span className='text-base font-normal'>{data ? `(${data?.length})` : ''}</span>
			</p>

			<div className={classes.summaryComponent}>
				<AISummaryCollapsible
					indexOrHash={index}
					proposalType={proposalType}
					summaryType='allComments'
					initialData={contentSummary}
					className='mb-8'
				/>
			</div>

			{isLoading ? (
				<div className='flex flex-col gap-2 px-8'>
					<Skeleton className='h-8' />
					<Skeleton className='h-8' />
					<Skeleton className='h-8' />
				</div>
			) : (
				<Comments
					proposalType={proposalType}
					index={index}
					comments={data || []}
				/>
			)}
		</div>
	);
}

export default PostComments;
