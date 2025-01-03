// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalType, ICommentResponse } from '@/_shared/types';
import { useState } from 'react';
import SingleComment from '../SingleComment/SingleComment';
import AddComment from '../AddComment/AddComment';
import classes from './Comments.module.scss';

function Comments({ comments, proposalType, index }: { comments: ICommentResponse[]; proposalType: EProposalType; index: string }) {
	const [allComments, setAllComments] = useState<ICommentResponse[]>(comments);

	return (
		<div className={classes.wrapper}>
			{allComments.map((item) => (
				<SingleComment
					key={item.id}
					proposalType={proposalType}
					index={index}
					commentData={item}
				/>
			))}

			<AddComment
				proposalType={proposalType}
				proposalIndex={index}
				editorId='new-comment'
				onConfirm={(newComment, user) => {
					setAllComments((prev) => [
						...prev,
						{
							...newComment,
							user
						}
					]);
				}}
			/>
		</div>
	);
}

export default Comments;
