// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EAllowedCommentor, EProposalType, EReactQueryKeys, ICommentResponse, IContentSummary } from '@/_shared/types';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { MIN_COMMENTS_FOR_SUMMARY } from '@/_shared/_constants/commentSummaryConstants';
import { useIdentityService } from '@/hooks/useIdentityService';
import Comments from './Comments/Comments';
import classes from './PostComments.module.scss';
import { Skeleton } from '../Skeleton';
import AISummaryCollapsible from '../AISummary/AISummaryCollapsible';

interface ICommentWithIdentityStatus extends ICommentResponse {
	isVerified?: boolean;
}

function PostComments({
	proposalType,
	index,
	contentSummary,
	comments,
	allowedCommentor,
	postUserId
}: {
	proposalType: EProposalType;
	index: string;
	contentSummary?: IContentSummary;
	comments?: ICommentResponse[];
	allowedCommentor: EAllowedCommentor;
	postUserId?: number;
}) {
	const t = useTranslations();
	const { getOnChainIdentity, identityService } = useIdentityService();

	const fetchComments = async () => {
		const { data, error } = await CommentClientService.getCommentsOfPost({ proposalType, index });

		if (error) {
			console.log(error?.message || 'Failed to fetch data');
			return comments;
		}

		const allComments = data && data.length ? data : comments || [];

		const commentsWithIdentities: ICommentWithIdentityStatus[] = await Promise.all(
			allComments.map(async (comment) => {
				const identity = await getOnChainIdentity(comment?.publicUser?.addresses?.[0]);
				const isVerified = identity?.isVerified;
				return { ...comment, isVerified };
			})
		);

		return commentsWithIdentities;
	};

	const { data, isLoading } = useQuery({
		queryKey: [EReactQueryKeys.COMMENTS, proposalType, index],
		queryFn: () => fetchComments(),
		placeholderData: (previousData) => previousData || comments,
		enabled: !!identityService,
		retry: true,
		refetchOnMount: true,
		refetchOnWindowFocus: false
	});

	return (
		<div>
			<div className='mb-4 flex flex-wrap items-center gap-4 px-6 pt-6'>
				<p className={classes.title}>
					{t('PostDetails.comments')} <span className='text-base font-normal'>{data ? `(${data?.length})` : ''}</span>
				</p>
			</div>

			{data && data?.length >= MIN_COMMENTS_FOR_SUMMARY && (
				<div className={classes.summaryComponent}>
					<AISummaryCollapsible
						indexOrHash={index}
						proposalType={proposalType}
						summaryType='allComments'
						initialData={contentSummary}
						className='mb-8'
					/>
				</div>
			)}

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
					allowedCommentor={allowedCommentor}
					postUserId={postUserId}
				/>
			)}
		</div>
	);
}

export default PostComments;
