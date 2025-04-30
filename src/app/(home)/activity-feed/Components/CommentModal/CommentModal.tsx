// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import Image from 'next/image';
import userIcon from '@assets/profile/user-icon.svg';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { getSpanStyle } from '@ui/TopicTag/TopicTag';
import { EProposalType, IPostListing } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import Address from '@ui/Profile/Address/Address';
import { FaRegClock } from '@react-icons/all-files/fa/FaRegClock';
import { Button } from '@ui/Button';
import { CommentClientService } from '@/app/_client-services/comment_client_service';
import { MarkdownEditor } from '@/app/_shared-components/MarkdownEditor/MarkdownEditor';
import { MDXEditorMethods } from '@mdxeditor/editor';
import styles from './CommentModal.module.scss';

function CommentModal({
	isDialogOpen,
	setIsDialogOpen,
	postData,
	onCommentAdded
}: {
	isDialogOpen: boolean;
	setIsDialogOpen: (open: boolean) => void;
	postData: IPostListing;
	onCommentAdded: () => void;
}) {
	const formatOriginText = (text: string): string => {
		return text.replace(/([A-Z])/g, ' $1').trim();
	};
	const markdownEditorRef = useRef<MDXEditorMethods | null>(null);
	const [content, setContent] = useState<string | null>(null);
	const t = useTranslations();

	const handleCommentClick = async () => {
		if (!content?.trim()) return;

		try {
			const { data, error } = await CommentClientService.addCommentToPost({
				proposalType: postData.proposalType as EProposalType,
				index: postData.index?.toString() || '',
				content,
				parentCommentId: undefined
			});

			if (error) {
				// TODO: show notification
				return;
			}

			if (data) {
				setContent(null);
				setIsDialogOpen(false);
				markdownEditorRef.current?.setMarkdown('');
				onCommentAdded();
			}
		} catch {
			// TODO: show notification
		}
	};

	return (
		<div>
			<Dialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			>
				<DialogTitle>
					<DialogContent className='max-w-max pb-4 pt-3'>
						<DialogHeader className='px-4'>
							<div className='flex items-start gap-4 text-xs text-btn_secondary_text'>
								<div className='flex w-10 flex-col gap-5'>
									<Image
										src={userIcon}
										alt='User Icon'
										className='h-14 w-14 rounded-full'
										width={56}
										height={56}
									/>
									<hr className='w-full rotate-90 border-border_grey' />
									<Image
										src={userIcon}
										alt='User Icon'
										className='h-14 w-14 rounded-full'
										width={10}
										height={10}
									/>
								</div>

								<div className='flex flex-1 flex-col pt-3'>
									<div className='flex items-center gap-2 text-xs text-btn_secondary_text'>
										<span className='font-medium'>
											<Address address={postData.onChainInfo?.proposer || ''} />
										</span>
										<span>in</span>
										<span className={`${getSpanStyle(postData.onChainInfo?.origin || '', 1)} ${styles.originStyle}`}>{formatOriginText(postData.onChainInfo?.origin || '')}</span>

										<span>|</span>
										<span className='flex items-center gap-2'>
											<FaRegClock className='text-sm' />
											{dayjs.utc(postData.onChainInfo?.createdAt).fromNow()}
										</span>
									</div>
									<span className='text-sm font-medium text-text_primary'>
										#{postData.index} <span className='font-semibold'>{postData.title?.slice(0, 80).concat('...')}</span>
									</span>
									<span className='text-xs text-text_pink'>{t('ActivityFeed.PostItem.commentingOnProposal')}</span>
									<div className='max-w-lg pt-5 lg:max-w-xl'>
										<MarkdownEditor
											markdown={content || ''}
											onChange={(data) => {
												setContent(data);
											}}
											ref={markdownEditorRef}
										/>
									</div>
								</div>
							</div>
						</DialogHeader>
						<div className='flex justify-end px-3'>
							<Button
								className='w-24'
								onClick={handleCommentClick}
							>
								{t('PostDetails.post')}
							</Button>
						</div>
					</DialogContent>
				</DialogTitle>
			</Dialog>
		</div>
	);
}

export default CommentModal;
