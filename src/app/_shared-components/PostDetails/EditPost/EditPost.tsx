// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { EProposalType, IPostListing } from '@/_shared/types';
import { OutputData } from '@editorjs/editorjs';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useUser } from '@/hooks/useUser';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { useTranslations } from 'next-intl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { LocalStorageClientService } from '@/app/_client-services/local_storage_client_service';
import BlockEditor from '../../BlockEditor/BlockEditor';
import { Input } from '../../Input';
import { Button } from '../../Button';

function EditPost({ postData, onEditPostSuccess, onClose }: { postData: IPostListing; onEditPostSuccess?: (title: string, content: OutputData) => void; onClose?: () => void }) {
	const t = useTranslations();
	const savedContent = postData.index && LocalStorageClientService.getEditPostData({ postId: postData.index.toString() });
	const [content, setContent] = useState<OutputData | null>(savedContent || postData?.content || null);
	const [title, setTitle] = useState<string>(postData?.title || '');
	const [isLoading, setIsLoading] = useState(false);

	const { user } = useUser();

	const editPost = async () => {
		if (
			!title.trim() ||
			!content ||
			!ValidatorService.isValidBlockContent(content) ||
			!postData?.index ||
			!postData?.proposalType ||
			!user ||
			!user.addresses.includes(getSubstrateAddress(postData.onChainInfo?.proposer || '') || '')
		)
			return;

		if (title === postData?.title && JSON.stringify(content) === JSON.stringify(postData?.content)) return;

		setIsLoading(true);

		const { data, error } = await NextApiClientService.editProposalDetails({
			proposalType: postData.proposalType,
			index: postData.proposalType === EProposalType.TIP ? postData.hash?.toString() || '' : postData.index.toString(),
			data: { title, content }
		});

		if (!error && data) {
			onEditPostSuccess?.(title, content);
			LocalStorageClientService.deleteEditPostData({ postId: postData.index.toString() });
			onClose?.();
		}
		setIsLoading(false);
	};

	return (
		<div className='flex w-full flex-col gap-y-4'>
			<div>
				<p className='mb-1 text-sm font-medium text-text_primary'>{t('EditPost.title')}</p>
				<Input
					defaultValue={postData?.title}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder='Title'
				/>
			</div>

			<div>
				<p className='mb-1 text-sm font-medium text-text_primary'>{t('EditPost.content')}</p>
				<BlockEditor
					data={postData?.content}
					id='post-content-edit'
					onChange={(data) => {
						setContent(data);
						if (postData.index) {
							LocalStorageClientService.setEditPostData({ postId: postData.index.toString(), data });
						}
					}}
				/>
			</div>
			<div className='flex justify-end'>
				<Button
					disabled={
						!title.trim() ||
						!content ||
						!ValidatorService.isValidBlockContent(content) ||
						(title === postData?.title && JSON.stringify(content) === JSON.stringify(postData?.content))
					}
					onClick={editPost}
					isLoading={isLoading}
				>
					{t('EditPost.save')}
				</Button>
			</div>
		</div>
	);
}

export default EditPost;
