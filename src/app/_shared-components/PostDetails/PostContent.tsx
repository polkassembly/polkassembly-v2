// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IPostListing } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { Separator } from '../Separator';
import EditPostButton from './EditPost/EditPostButton';
import PostActions from './PostActions/PostActions';
import { MarkdownEditor } from '../MarkdownEditor/MarkdownEditor';

function PostContent({ postData, isModalOpen, onEditPostSuccess }: { postData: IPostListing; isModalOpen: boolean; onEditPostSuccess: (title: string, content: string) => void }) {
	const { content } = postData;

	return (
		<div>
			<MarkdownEditor
				markdown={content}
				readOnly
				className={cn(isModalOpen ? '' : 'max-h-full border-none')}
				contentEditableClassName='p-0'
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
