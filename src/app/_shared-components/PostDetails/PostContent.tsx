// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { IPost } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { Separator } from '../Separator';
import EditPostButton from './EditPost/EditPostButton';
import PostActions from './PostActions/PostActions';
import AISummaryCollapsible from '../AISummary/AISummaryCollapsible';
import { MarkdownViewer } from '../MarkdownViewer/MarkdownViewer';

function PostContent({ postData, isModalOpen, onEditPostSuccess }: { postData: IPost; isModalOpen: boolean; onEditPostSuccess: (title: string, content: string) => void }) {
	const { content } = postData;

	return (
		<div>
			<AISummaryCollapsible
				indexOrHash={String(postData?.index ?? postData?.hash)}
				proposalType={postData.proposalType}
				summaryType='content'
				initialData={(postData as IPost)?.contentSummary}
			/>

			<MarkdownViewer
				markdown={content}
				className={cn(isModalOpen ? '' : 'max-h-full border-none')}
				truncate
			/>

			<Separator className='my-4 bg-border_grey' />
			<PostActions postData={postData} />
			<div className='flex items-center justify-between'>
				<div />
				<div>
					<EditPostButton
						postData={postData}
						onEditPostSuccess={onEditPostSuccess}
					/>
				</div>
			</div>
		</div>
	);
}

export default PostContent;
