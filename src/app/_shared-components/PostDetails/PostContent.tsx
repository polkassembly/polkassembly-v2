// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IPost } from '@/_shared/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import NoContextGIF from '@assets/gifs/no-context.gif';
import { useUser } from '@/hooks/useUser';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { Separator } from '../Separator';
import EditPostButton from './EditPost/EditPostButton';
import PostActions from './PostActions/PostActions';
import AISummaryCollapsible from '../AISummary/AISummaryCollapsible';
import { MarkdownViewer } from '../MarkdownViewer/MarkdownViewer';
import LinkPostButton from './LinkDiscussionPost/LinkPostButton';

function PostContent({ postData, isModalOpen }: { postData: IPost; isModalOpen: boolean }) {
	const { content } = postData;

	const { user } = useUser();

	return (
		<div>
			<AISummaryCollapsible
				indexOrHash={String(postData?.index ?? postData?.hash)}
				proposalType={postData.proposalType}
				summaryType='content'
				initialData={postData?.contentSummary}
			/>

			{user && user.addresses.includes(getSubstrateAddress(postData.onChainInfo?.proposer || '') || '') && postData.isDefaultContent ? (
				<div className='flex flex-col items-center justify-center gap-y-4'>
					<Image
						src={NoContextGIF}
						alt='no-context'
						width={150}
						height={150}
					/>
					<p className='text-base font-semibold text-text_primary'>No context provided!</p>
					<EditPostButton
						postData={postData}
						className='h-10 w-64 bg-bg_pink text-sm font-medium text-white'
					/>
					<LinkPostButton
						postData={postData}
						className='h-10 w-64 border border-navbar_border bg-bg_modal text-sm font-medium text-text_pink'
					/>
				</div>
			) : (
				<MarkdownViewer
					markdown={content}
					className={cn(isModalOpen ? '' : 'max-h-full border-none')}
					truncate
				/>
			)}

			<Separator className='my-4 bg-border_grey' />
			<div className='flex items-center gap-x-4'>
				<PostActions postData={postData} />
				{!postData.isDefaultContent && (
					<div className='flex items-center gap-x-4'>
						<EditPostButton postData={postData} />
						<LinkPostButton postData={postData} />
					</div>
				)}
			</div>
		</div>
	);
}

export default PostContent;
