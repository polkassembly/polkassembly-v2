// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalType } from '@/_shared/types';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { ValidatorService } from '@/_shared/_services/validator_service';
import Comments from './Comments/Comments';
import classes from './PostComments.module.scss';
import { Skeleton } from '../Skeleton';
import AISummaryCollapsible, { SummaryType } from '../AISummary/AISummaryCollapsible';

function PostComments({ proposalType, index }: { proposalType: EProposalType; index: string }) {
	const t = useTranslations();

	const fetchComments = async () => {
		const { data, error } = await CommentClientService.getCommentsOfPost({ proposalType, index });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};
	const { data, isFetching } = useQuery({
		queryKey: ['comments', proposalType, index],
		queryFn: () => fetchComments(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	return (
		<div>
			<p className={classes.title}>
				{t('PostDetails.comments')} <span className='text-base font-normal'>({data?.length})</span>
			</p>
			{ValidatorService.isValidIndexOrHash(index) && (
				<div className={classes.summaryComponent}>
					<AISummaryCollapsible
						indexOrHash={index}
						proposalType={proposalType}
						summaryType={SummaryType.CONTENT}
					/>
				</div>
			)}
			{isFetching ? (
				<Skeleton className='h-4' />
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
