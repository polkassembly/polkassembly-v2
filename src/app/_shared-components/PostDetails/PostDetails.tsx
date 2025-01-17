// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EPostDetailsTab, EProposalType, IPost } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { Suspense, useState } from 'react';
import { OutputData } from '@editorjs/editorjs';
import PostHeader from './PostHeader/PostHeader';
import PostComments from '../PostComments/PostComments';
import classes from './PostDetails.module.scss';
import { Skeleton } from '../Skeleton';
import BlockEditor from '../BlockEditor/BlockEditor';
import { Tabs, TabsContent } from '../Tabs';
import Timeline from './Timeline/Timeline';
import ProposalPeriods from './ProposalPeriods/ProposalPeriods';
import VoteSummary from './VoteSummary/VoteSummary';
import VoteReferendumButton from './VoteReferendumButton';

function PostDetails({ postData, index, isModalOpen }: { postData: IPost; index: string; isModalOpen?: boolean }) {
	const [showMore, setShowMore] = useState(false);

	const handleShowMore = () => {
		setShowMore(true);
	};

	const truncatedData = showMore
		? postData.content
		: postData.content && {
				...postData.content,
				blocks: postData.content.blocks?.slice(0, 4) || []
			};

	return (
		<Tabs defaultValue={EPostDetailsTab.DESCRIPTION}>
			<div className={classes.headerWrapper}>
				<PostHeader
					title={postData.title || ''}
					proposer={postData.onChainInfo?.proposer || ''}
					createdAt={postData.createdAt || new Date()}
					tags={postData.tags}
					status={postData.onChainInfo?.status || ''}
					beneficiaries={postData.onChainInfo?.beneficiaries}
				/>
			</div>
			<div className={cn(classes.detailsWrapper, isModalOpen ? 'grid grid-cols-1' : 'grid grid-cols-1 lg:grid-cols-3')}>
				<div className={classes.leftWrapper}>
					<div className={classes.descBox}>
						<TabsContent value={EPostDetailsTab.DESCRIPTION}>
							<BlockEditor
								data={truncatedData as OutputData}
								readOnly
								id='post-content'
								className={isModalOpen ? '' : 'max-h-full border-none'}
								onChange={() => {}}
							/>
							{!showMore && (
								<span
									onClick={handleShowMore}
									className='cursor-pointer text-sm font-medium text-text_pink'
									aria-hidden='true'
								>
									Show More
								</span>
							)}
						</TabsContent>
						<TabsContent value={EPostDetailsTab.TIMELINE}>
							<Timeline timeline={postData.onChainInfo?.timeline} />
						</TabsContent>
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
				<div className={classes.rightWrapper}>
					<VoteReferendumButton index={index} />
					<ProposalPeriods
						confirmationPeriodEndsAt={postData.onChainInfo?.confirmationPeriodEndsAt}
						decisionPeriodEndsAt={postData.onChainInfo?.decisionPeriodEndsAt}
						preparePeriodEndsAt={postData.onChainInfo?.preparePeriodEndsAt}
						status={postData.onChainInfo?.status}
					/>
					<VoteSummary
						proposalType={EProposalType.REFERENDUM_V2}
						index={index}
						voteMetrics={postData.onChainInfo?.voteMetrics}
					/>
				</div>
			</div>
		</Tabs>
	);
}

export default PostDetails;
