// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ENotificationStatus, EProposalType, EReactQueryKeys, IOffChainPost, IPost, IPostListing } from '@/_shared/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useUser } from '@/hooks/useUser';
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import NoContextGIF from '@assets/gifs/no-context.gif';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { Input } from '../../Input';
import { Skeleton } from '../../Skeleton';
import { Separator } from '../../Separator';
import { Button } from '../../Button';

function LinkDiscussionPost({ postData, onClose }: { postData: IPostListing | IPost; onClose?: () => void }) {
	const t = useTranslations();

	const { user } = useUser();
	const { value: urlOrIndex, debouncedValue: debouncedUrlOrIndex, setValue: setUrlOrIndex } = useDebounce<string>('', 800);

	const [isLoading, setIsLoading] = useState(false);
	const [selectedDiscussionPost, setSelectedDiscussionPost] = useState<IOffChainPost>();

	const queryClient = useQueryClient();

	const { toast } = useToast();

	const fetchAllPostsByUser = async () => {
		if (!user || !user.id) return null;

		const { data, error } = await NextApiClientService.fetchListingData({ proposalType: EProposalType.DISCUSSION, page: 1, limit: 20, userId: user.id });
		if (error || !data) {
			throw new Error(t('LinkDiscussionPost.noDiscussionsFound'));
		}

		return data.items;
	};

	const { data: userDiscussionPosts, isLoading: isFetchingUserDiscussionPosts } = useQuery({
		queryKey: ['userDiscussionPosts', user?.id],
		queryFn: fetchAllPostsByUser,
		enabled: !!user?.id,
		placeholderData: (previousData) => previousData,
		retry: true,
		retryOnMount: true,
		refetchOnWindowFocus: true
	});

	const fetchDiscussionPost = async () => {
		let postId = Number.isNaN(Number(urlOrIndex)) ? null : Number(urlOrIndex);

		if (!postId) {
			const regex = /^https:\/\/\w+\.polkassembly\.io\/post\/\d+$/;
			if (!regex.test(urlOrIndex)) {
				throw new Error('Invalid URL');
			}

			postId = Number(urlOrIndex.split('post/')[1]);

			if (Number.isNaN(postId)) {
				throw new Error('Invalid post id');
			}
		}

		if (userDiscussionPosts && userDiscussionPosts.length > 0 && userDiscussionPosts.some((post) => post.index === postId)) {
			setSelectedDiscussionPost(userDiscussionPosts.find((post) => post.index === postId));
			return null;
		}

		const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: EProposalType.DISCUSSION, indexOrHash: postId.toString() });

		if (error || !data) {
			throw new Error(t('LinkDiscussionPost.noPostFound'));
		}

		if (data.userId !== user?.id) {
			throw new Error(t('LinkDiscussionPost.notAuthorized'));
		}

		setSelectedDiscussionPost(data);
		return data;
	};

	const {
		data: discussionPost,
		isFetching,
		error: discussionPostError
	} = useQuery({
		queryKey: ['discussionPost', debouncedUrlOrIndex],
		queryFn: fetchDiscussionPost,
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!debouncedUrlOrIndex,
		retry: false,
		retryOnMount: false,
		refetchOnWindowFocus: false
	});

	const handleLinkDiscussion = async () => {
		if (
			!selectedDiscussionPost ||
			!ValidatorService.isValidNumber(selectedDiscussionPost.index) ||
			!user ||
			user.id !== selectedDiscussionPost.userId ||
			!selectedDiscussionPost.title ||
			!selectedDiscussionPost.content ||
			!ValidatorService.isValidNumber(postData.index)
		)
			return;

		setIsLoading(true);
		const { data, error } = await NextApiClientService.editProposalDetails({
			proposalType: postData.proposalType,
			index: postData.proposalType === EProposalType.TIP ? postData.hash?.toString() || '' : postData.index!.toString(),
			data: {
				title: selectedDiscussionPost.title,
				content: selectedDiscussionPost.content,
				linkedPost: {
					proposalType: EProposalType.DISCUSSION,
					indexOrHash: selectedDiscussionPost.index!.toString()
				}
			}
		});

		if (error || !data) {
			console.error(error);
			setIsLoading(false);
			toast({
				title: t('LinkDiscussionPost.errorLinkingDiscussionPost'),
				description: t('LinkDiscussionPost.pleaseTryAgain'),
				status: ENotificationStatus.ERROR
			});
			return;
		}

		setIsLoading(false);
		toast({
			title: t('LinkDiscussionPost.discussionPostLinkedSuccessfully'),
			description: t('LinkDiscussionPost.theDiscussionPostHasBeenLinkedToTheProposal'),
			status: ENotificationStatus.SUCCESS
		});

		queryClient.setQueryData([EReactQueryKeys.POST_DETAILS, postData.index!.toString()], (prev: IPost) => ({
			...prev,
			title: selectedDiscussionPost.title,
			content: selectedDiscussionPost.content,
			isDefaultContent: false,
			linkedPost: { ...(postData.linkedPost || prev.linkedPost), proposalType: EProposalType.DISCUSSION, indexOrHash: selectedDiscussionPost?.index?.toString() }
		}));

		onClose?.();
	};

	return (
		<div className='flex flex-col gap-y-4'>
			<div className='flex flex-col gap-y-1'>
				<p className='text-sm text-wallet_btn_text'>{t('LinkDiscussionPost.pasteURLorEnterPostID')}</p>
				<Input
					placeholder='Type Here'
					className='w-full'
					value={urlOrIndex}
					onChange={(e) => setUrlOrIndex(e.target.value)}
				/>
			</div>
			{isFetching && <Skeleton className='h-6 w-full' />}
			{discussionPostError ? (
				<p className='text-sm text-failure'>{discussionPostError.message}</p>
			) : discussionPost ? (
				<Button
					variant='outline'
					className={cn('justify-start gap-x-2 truncate border-text_pink text-sm font-medium text-text_primary')}
				>
					<span>#{discussionPost.index}</span>
					<span>{discussionPost.title}</span>
				</Button>
			) : null}

			{/* user discussions */}
			<div className='flex flex-col gap-y-1'>
				<p className='text-sm text-wallet_btn_text'>{t('LinkDiscussionPost.yourDiscussions')}</p>
				{isFetchingUserDiscussionPosts ? (
					<div className='flex flex-col gap-y-2'>
						<Skeleton className='h-6 w-full' />
						<Skeleton className='h-6 w-full' />
						<Skeleton className='h-6 w-full' />
					</div>
				) : userDiscussionPosts && userDiscussionPosts?.length > 0 ? (
					<div className='flex max-h-40 flex-col gap-y-2 overflow-y-auto'>
						<div className='flex flex-col gap-y-2'>
							{userDiscussionPosts?.map((post) => (
								<Button
									key={post.index}
									variant='outline'
									className={cn(
										'justify-start gap-x-2 truncate text-sm font-medium text-text_primary',
										selectedDiscussionPost && selectedDiscussionPost.index === post.index && 'border-text_pink'
									)}
									onClick={() => setSelectedDiscussionPost(post)}
								>
									<span>#{post.index}</span>
									<span>{post.title}</span>
								</Button>
							))}
						</div>
					</div>
				) : (
					<div className='flex items-center gap-x-4'>
						<Image
							src={NoContextGIF}
							alt='no-context'
							width={100}
							height={100}
						/>
						<p className='text-sm font-semibold text-text_primary'>{t('LinkDiscussionPost.noDiscussionsFound')}</p>
					</div>
				)}
			</div>
			<Separator />

			<div className='flex items-center justify-end'>
				<Button
					onClick={handleLinkDiscussion}
					isLoading={isLoading}
					disabled={!selectedDiscussionPost || !user || user.id !== selectedDiscussionPost.userId}
				>
					{t('LinkDiscussionPost.confirm')}
				</Button>
			</div>
		</div>
	);
}

export default LinkDiscussionPost;
