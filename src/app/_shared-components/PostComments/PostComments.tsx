// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
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

async function PostComments({ proposalType, index }: { proposalType: EProposalType; index: string }) {
	const { data, error } = await CommentClientService.getCommentsOfPost({ proposalType, index });

	return (
		<div>
			{error && <p>{error.message}</p>}
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
