// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import Comments from './Comments/Comments';
import classes from './PostComments.module.scss';

async function PostComments({ proposalType, index }: { proposalType: EProposalType; index: string }) {
	const { data, error } = await CommentClientService.getCommentsOfPost({ proposalType, index });

	return (
		<div>
			{error && <p>{error.message}</p>}
			<p className={classes.title}>
				Comments <span className='text-base font-normal'>({data?.length || 0})</span>
			</p>
			<Comments
				proposalType={proposalType}
				index={index}
				comments={data || []}
			/>
		</div>
	);
}

export default PostComments;
