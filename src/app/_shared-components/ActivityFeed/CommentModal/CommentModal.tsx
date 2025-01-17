// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import Image from 'next/image';
import userIcon from '@assets/profile/user-icon.svg';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { getSpanStyle } from '@ui/TopicTag/TopicTag';
import { EProposalType, IPostListing } from '@/_shared/types';
import Address from '@ui/Profile/Address/Address';
import dynamic from 'next/dynamic';
import { FaRegClock } from 'react-icons/fa';
import styles from './CommentModal.module.scss';

const AddComment = dynamic(() => import('@ui/PostComments/AddComment/AddComment'), { ssr: false });

function CommentModal({ isDialogOpen, setIsDialogOpen, postData }: { isDialogOpen: boolean; setIsDialogOpen: (open: boolean) => void; postData: IPostListing }) {
	return (
		<div>
			<Dialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
			>
				<DialogTitle>
					<DialogContent className='max-w-lg p-6 lg:max-w-2xl'>
						<DialogHeader>
							<div className='flex items-start gap-4 text-xs text-btn_secondary_text'>
								<div className='flex flex-col gap-3'>
									<Image
										src={userIcon}
										alt='User Icon'
										className='h-14 w-14 rounded-full'
										width={56}
										height={56}
									/>
									<hr className='w-full rotate-90 border-border_grey' />
								</div>

								<div className='flex flex-col pt-3'>
									<div className='flex items-center gap-2 text-xs text-btn_secondary_text'>
										<span className='font-medium'>
											<Address address={postData.onChainInfo?.proposer || ''} />
										</span>
										<span>in</span>
										<span className={`${getSpanStyle(postData.onChainInfo?.origin || '', 1)} ${styles.originStyle}`}>{postData.onChainInfo?.origin}</span>
										<span>|</span>
										<span className='flex items-center gap-2'>
											<FaRegClock className='text-sm' />
											{dayjs.utc(postData.onChainInfo?.createdAt).fromNow()}
										</span>
									</div>
									<span className='text-sm font-medium text-text_primary'>
										#{postData.index} {postData.title}
									</span>
									<span className='text-xs text-text_pink'>Commenting on proposal</span>
								</div>
							</div>
						</DialogHeader>
						<div className='w-full px-3'>
							<AddComment
								proposalType={postData.proposalType as EProposalType}
								proposalIndex={postData.index?.toString() || ''}
								editorId='new-comment'
							/>
						</div>
					</DialogContent>
				</DialogTitle>
			</Dialog>
		</div>
	);
}

export default CommentModal;
