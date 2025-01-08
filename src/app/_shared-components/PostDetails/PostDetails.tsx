// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostDetailsTab, EProposalType, IPost } from '@/_shared/types';
import { Suspense } from 'react';
import PostHeader from './PostHeader/PostHeader';
import PostComments from '../PostComments/PostComments';
import classes from './PostDetails.module.scss';
import { Skeleton } from '../Skeleton';
import BlockEditor from '../BlockEditor/BlockEditor';
import { Tabs, TabsContent } from '../Tabs';
import Timeline from './Timeline/Timeline';
import { Button } from '../Button';
import ProposalPeriods from './ProposalPeriods/ProposalPeriods';
import VoteSummary from './VoteSummary/VoteSummary';

function PostDetails({ postData, index }: { postData: IPost; index: string }) {
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
			<div className={classes.detailsWrapper}>
				<div className={classes.leftWrapper}>
					<div className={classes.descBox}>
						<TabsContent value={EPostDetailsTab.DESCRIPTION}>
							<BlockEditor
								data={postData.content}
								readOnly
								renderFromHtml
								className='max-h-full border-none'
								id='post-content'
							/>
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
					<Button
						className='w-full'
						size='lg'
					>
						Cast Vote
					</Button>
					<ProposalPeriods
						confirmationPeriodEndsAt={postData.onChainInfo?.confirmationPeriodEndsAt}
						decisionPeriodEndsAt={postData.onChainInfo?.decisionPeriodEndsAt}
						preparePeriodEndsAt={postData.onChainInfo?.preparePeriodEndsAt}
						status={postData.onChainInfo?.status}
					/>
					<VoteSummary voteMetrics={postData.onChainInfo?.voteMetrics} />
					{/* <Suspense fallback={<Skeleton className='h-4' />}>
						<VoteDetails
							proposalType={EProposalType.REFERENDUM_V2}
							index={index}
						/>
					</Suspense> */}
				</div>
			</div>
		</Tabs>
	);
}

export default PostDetails;
