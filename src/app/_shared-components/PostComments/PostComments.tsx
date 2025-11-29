// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useMemo } from 'react';
import { EAllowedCommentor, ECommentFilterCondition, ECommentSortBy, EProposalType, EReactQueryKeys, ICommentResponse, IContentSummary } from '@/_shared/types';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { MIN_COMMENTS_FOR_SUMMARY } from '@/_shared/_constants/commentSummaryConstants';
import { useIdentityService } from '@/hooks/useIdentityService';
import { AlertCircle } from 'lucide-react';
import Comments from './Comments/Comments';
import classes from './PostComments.module.scss';
import { Skeleton } from '../Skeleton';
import AISummaryCollapsible from '../AISummary/AISummaryCollapsible';
import { Alert, AlertDescription } from '../Alert';
import CommentsFilter from './CommentsFilter/CommentsFilter';

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

	// Comments controls
	const [sortBy, setSortBy] = useState<ECommentSortBy>(ECommentSortBy.newest);
	const [activeFilters, setActiveFilters] = useState<ECommentFilterCondition[]>([]);
	const [filteredCommentsCount, setFilteredCommentsCount] = useState<number>(0);

	const fetchComments = async () => {
		const { data, error } = await CommentClientService.getCommentsOfPost({ proposalType, index });

		if (error) {
			// eslint-disable-next-line no-console
			console.log(error?.message || 'Failed to fetch data');
			return comments;
		}

		const allComments = data?.length ? data : comments || [];

		const commentsWithIdentities: ICommentWithIdentityStatus[] = await Promise.all(
			allComments.map(async (comment) => {
				const identity = await getOnChainIdentity(comment?.publicUser?.addresses?.[0]);
				const isVerified = identity?.isVerified;
				return { ...comment, isVerified };
			})
		);

		return allowedCommentor === EAllowedCommentor.ONCHAIN_VERIFIED ? commentsWithIdentities.filter((comment) => comment.isVerified) : commentsWithIdentities;
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

	// Helper function to determine if comments filter should be shown
	const shouldShowCommentsFilter = useMemo(() => {
		return [EProposalType.REFERENDUM, EProposalType.REFERENDUM_V2, EProposalType.DEMOCRACY_PROPOSAL, EProposalType.TREASURY_PROPOSAL, EProposalType.FELLOWSHIP_REFERENDUM].includes(
			proposalType
		);
	}, [proposalType]);

	return (
		<div>
			<div className='mb-4 flex flex-wrap items-center gap-4 px-6 pt-6'>
				<p className={classes.title}>
					{t('PostDetails.comments')} <span className='text-base font-normal'>{activeFilters.length > 0 ? `(${filteredCommentsCount})` : data ? `(${data?.length})` : ''}</span>
				</p>
				<div className='ml-auto flex items-center gap-3'>
					{shouldShowCommentsFilter && (
						<CommentsFilter
							sortBy={sortBy}
							setSortBy={setSortBy}
							activeFilters={activeFilters}
							setActiveFilters={setActiveFilters}
						/>
					)}
				</div>
				{allowedCommentor === EAllowedCommentor.ONCHAIN_VERIFIED && (
					<Alert
						variant='info'
						className='flex items-center gap-x-3 px-2 py-1.5'
					>
						<AlertCircle className='h-4 w-4' />
						<AlertDescription className='flex w-full items-center justify-between'>
							<p className='text-sm font-medium'>{t('PostDetails.onlyVerifiedCommentsVisible')}</p>
						</AlertDescription>
					</Alert>
				)}
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
					sortBy={sortBy}
					activeFilters={shouldShowCommentsFilter ? activeFilters : []}
					onFilteredCommentsChange={shouldShowCommentsFilter ? setFilteredCommentsCount : undefined}
				/>
			)}
		</div>
	);
}

export default PostComments;
