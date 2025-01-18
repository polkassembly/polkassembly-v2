// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState } from 'react';
import { OutputData } from '@editorjs/editorjs';
import { IPostListing } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import BlockEditor from '../../BlockEditor/BlockEditor';
import classes from './PostContent.module.scss';

function PostContent({ postData, isModalOpen }: { postData: IPostListing; isModalOpen: boolean }) {
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
		<div className={classes.descBox}>
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
			) : (
				<span
					onClick={handleShowMore}
					className='cursor-pointer text-sm font-medium text-text_pink'
					aria-hidden='true'
				>
					{t('ActivityFeed.PostItem.showMore')}
				</span>
			)}
		</div>
	);
}

export default PostContent;
