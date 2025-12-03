// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useMemo, useRef, useState } from 'react';
import { EAllowedCommentor, ENotificationStatus, EProposalType, EReactQueryKeys, IPost, IPostListing } from '@/_shared/types';
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
import { RadioGroup, RadioGroupItem } from '../../RadioGroup/RadioGroup';
import { Label } from '../../Label';

function EditPost({ postData, onClose }: { postData: IPostListing | IPost; onClose?: () => void }) {
	const t = useTranslations();
	const savedContent = postData.index && LocalStorageClientService.getEditPostData({ postId: postData.index.toString() });
	const [content, setContent] = useState<string | null>(savedContent || postData?.content || null);
	const [title, setTitle] = useState<string>(postData?.title || '');
	const [allowedCommentor, setAllowedCommentor] = useState<EAllowedCommentor>(postData?.allowedCommentor || EAllowedCommentor.ALL);
	const [isLoading, setIsLoading] = useState(false);
	const markdownEditorRef = useRef<MDXEditorMethods | null>(null);
	const { user } = useUser();

	const { toast } = useToast();

	const queryClient = useQueryClient();

	const allowedCommentorsOptions = [
		{
			label: t('Create.AllowedCommentors.all'),
			value: EAllowedCommentor.ALL
		},
		{
			label: t('Create.AllowedCommentors.onchainVerified'),
			value: EAllowedCommentor.ONCHAIN_VERIFIED
		},
		{
			label: t('Create.AllowedCommentors.none'),
			value: EAllowedCommentor.NONE
		}
	];

	const canEditOffChain = user && user.id === postData.userId;

	const proposerAddress = postData.onChainInfo?.proposer && getSubstrateAddress(postData.onChainInfo?.proposer);
	const canEditOnChain = user && proposerAddress && user.addresses.includes(proposerAddress);

	const canEditSignatories = useMemo(() => {
		return (
			proposerAddress &&
			user?.addressRelations?.some((relation) =>
				relation.multisigAddresses.some(
					(multisig) => getSubstrateAddress(multisig.address) === proposerAddress || multisig.pureProxies.some((proxy) => getSubstrateAddress(proxy.address) === proposerAddress)
				)
			)
		);
	}, [proposerAddress, user?.addressRelations]);

	const canEditProxy = useMemo(() => {
		return proposerAddress && user?.addressRelations?.some((relation) => relation.proxyAddresses.some((proxy) => getSubstrateAddress(proxy.address) === proposerAddress));
	}, [proposerAddress, user?.addressRelations]);

	const canEdit = canEditOffChain || canEditOnChain || canEditSignatories || canEditProxy;

	const editPost = async () => {
		if (!title.trim() || !content || !ValidatorService.isValidNumber(postData?.index) || !postData?.proposalType || !user || !canEdit) return;

		if (title === postData?.title && JSON.stringify(content) === JSON.stringify(postData?.content) && allowedCommentor === postData?.allowedCommentor) return;

		setIsLoading(true);

		const { data, error } = await NextApiClientService.editProposalDetails({
			proposalType: postData.proposalType,
			index: postData.proposalType === EProposalType.TIP ? postData.hash?.toString() || '' : postData.index!.toString(),
			data: { title, content, allowedCommentor }
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
			allowedCommentor,
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

				<div>
					<p className='mb-1 text-sm font-medium text-text_primary'>{t('EditPost.whoCanComment')}</p>
					<RadioGroup
						defaultValue={allowedCommentor}
						className='flex items-center gap-x-2'
						onValueChange={(e) => setAllowedCommentor(e as EAllowedCommentor)}
					>
						<div className='flex flex-row gap-2'>
							{allowedCommentorsOptions?.map((option) => {
								return (
									<div
										key={option.value}
										className='flex items-center space-x-2'
									>
										<RadioGroupItem
											value={option.value}
											id={option.value}
										/>
										<Label
											htmlFor={option.value}
											className='text-sm text-allowed_commentor_text'
										>
											{option.label}
										</Label>
									</div>
								);
							})}
						</div>
					</RadioGroup>
				</div>
			</div>
			<div className='flex justify-end'>
				<Button
					disabled={
						!title.trim() || !content?.trim() || (title === postData?.title && content?.trim() === postData?.content?.trim() && postData?.allowedCommentor === allowedCommentor)
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
