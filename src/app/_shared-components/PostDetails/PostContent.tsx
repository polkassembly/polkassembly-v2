// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { OutputData } from '@editorjs/editorjs';
import { IPost, IPostListing } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import BlockEditor from '../BlockEditor/BlockEditor';
import { Separator } from '../Separator';
import EditPostButton from './EditPost/EditPostButton';
import PostActions from './PostActions/PostActions';

function PostContent({
	postData,
	isModalOpen,
	onEditPostSuccess
}: {
	postData: IPostListing;
	isModalOpen: boolean;
	onEditPostSuccess: (title: string, content: OutputData) => void;
}) {
	const [showMore, setShowMore] = useState(false);

	const t = useTranslations();

	const handleShowMore = () => {
		setShowMore(true);
	};

	const handleShowLess = () => {
		setShowMore(false);
	};

	const truncatedData = showMore
		? postData?.content
		: postData?.content && {
				...postData?.content,
				blocks: postData?.content.blocks?.slice(0, 4) || []
			};

	return (
		<div>
			<BlockEditor
				data={truncatedData as OutputData}
				readOnly
				id='post-content'
				className={isModalOpen ? '' : 'max-h-full border-none'}
				onChange={() => {}}
			/>

			{showMore ? (
				<span
					onClick={handleShowLess}
					className='cursor-pointer text-sm font-medium text-text_pink'
					aria-hidden='true'
				>
					{t('ActivityFeed.PostItem.showLess')}
				</span>
			) : !showMore && postData?.content?.blocks?.length && postData?.content?.blocks?.length > 4 ? (
				<span
					onClick={handleShowMore}
					className='cursor-pointer text-sm font-medium text-text_pink'
					aria-hidden='true'
				>
					{t('ActivityFeed.PostItem.showMore')}
				</span>
			) : null}
			<Separator className='my-4 bg-border_grey' />
			<PostActions postData={postData as IPost} />
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
