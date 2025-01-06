// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, IPost } from '@/_shared/types';
import { Suspense } from 'react';
import PostHeader from './PostHeader/PostHeader';
import PostComments from '../PostComments/PostComments';
import classes from './PostDetails.module.scss';
// import BlockEditor from '../BlockEditor/BlockEditor';
import { Skeleton } from '../Skeleton';
import BlockEditor from '../BlockEditor/BlockEditor';

function PostDetails({ postData, index }: { postData: IPost; index: string }) {
	return (
		<div>
			<div className={classes.headerWrapper}>
				<PostHeader
					title={postData.title || ''}
					proposer={postData.onChainInfo?.proposer || ''}
					createdAt={postData.createdAt || new Date()}
					tags={postData.tags}
					status={postData.onChainInfo?.status || ''}
					requestedAssetData={postData.onChainInfo?.requestedAssetData}
				/>
			</div>
			<div className={classes.detailsWrapper}>
				<div className={classes.leftWrapper}>
					<div className={classes.descBox}>
						<BlockEditor
							data={postData.content}
							readOnly
							renderFromHtml
							className='max-h-full border-none'
							id='post-content'
						/>
					</div>
					<div className={classes.commentsBox}>
						<Suspense fallback={<Skeleton className='h-4' />}>
							<PostComments
								proposalType={EProposalType.REFERENDUM_V2}
								index={index}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PostDetails;
