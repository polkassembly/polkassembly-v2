// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useRef, useState } from 'react';
import { ENotificationStatus, EProposalType, EReactQueryKeys, IPost, IPostListing } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useUser } from '@/hooks/useUser';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { useTranslations } from 'next-intl';
import { LocalStorageClientService } from '@/app/_client-services/local_storage_client_service';
import { MarkdownEditor } from '@/app/_shared-components/MarkdownEditor/MarkdownEditor';
import { MDXEditorMethods } from '@mdxeditor/editor';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '../../Input';
import { Button } from '../../Button';

function EditPost({ postData, onClose }: { postData: IPostListing | IPost; onClose?: () => void }) {
	const t = useTranslations();
	const savedContent = postData.index && LocalStorageClientService.getEditPostData({ postId: postData.index.toString() });
	const [content, setContent] = useState<string | null>(savedContent || postData?.content || null);
	const [title, setTitle] = useState<string>(postData?.title || '');
	const [isLoading, setIsLoading] = useState(false);
	const markdownEditorRef = useRef<MDXEditorMethods | null>(null);
	const { user } = useUser();

	const { toast } = useToast();

	const queryClient = useQueryClient();

	const canEditOffChain = user && user.id === postData.userId;

	const proposerAddress = postData.onChainInfo?.proposer && getSubstrateAddress(postData.onChainInfo?.proposer);
	const canEditOnChain = user && proposerAddress && user.addresses.includes(proposerAddress);

	const canEdit = canEditOffChain || canEditOnChain;

	const editPost = async () => {
		if (!title.trim() || !content || !ValidatorService.isValidNumber(postData?.index) || !postData?.proposalType || !user || !canEdit) return;

		if (title === postData?.title && JSON.stringify(content) === JSON.stringify(postData?.content)) return;

		setIsLoading(true);

		const { data, error } = await NextApiClientService.editProposalDetails({
			proposalType: postData.proposalType,
			index: postData.proposalType === EProposalType.TIP ? postData.hash?.toString() || '' : postData.index!.toString(),
			data: { title, content }
		});

		if (error || !data) {
			toast({
				title: t('EditPost.error'),
				description: t('EditPost.errorDescription'),
				status: ENotificationStatus.ERROR
			});
			setIsLoading(false);
			return;
		}

		queryClient.setQueryData([EReactQueryKeys.POST_DETAILS, postData.index!.toString()], (prev: IPost) => ({
			...prev,
			title,
			content,
			isDefaultContent: false
		}));

		LocalStorageClientService.deleteEditPostData({ postId: postData.index!.toString() });
		onClose?.();
		toast({
			title: t('EditPost.success'),
			description: t('EditPost.successDescription'),
			status: ENotificationStatus.SUCCESS
		});
		setIsLoading(false);
	};

	return (
		<div className='flex flex-col gap-y-4'>
			<div className='flex max-h-[75vh] flex-col gap-y-4 overflow-y-auto'>
				<div>
					<p className='mb-1 text-sm font-medium text-text_primary'>{t('EditPost.title')}</p>
					<Input
						defaultValue={postData?.title}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder='Title'
					/>
				</div>

				<div className='w-full'>
					<p className='mb-1 text-sm font-medium text-text_primary'>{t('EditPost.content')}</p>
					<MarkdownEditor
						markdown={postData?.content}
						onChange={(data) => {
							setContent(data);
							if (postData.index) {
								LocalStorageClientService.setEditPostData({ postId: postData.index.toString(), data });
							}
						}}
						ref={markdownEditorRef}
					/>
				</div>
			</div>
			<div className='flex justify-end'>
				<Button
					disabled={!title.trim() || !content?.trim() || (title === postData?.title && content?.trim() === postData?.content?.trim())}
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
