// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostDetailsTab, EProposalType, IPost } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
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

function PostDetails({ postData, index, isModalOpen }: { postData: IPost; index: string; isModalOpen?: boolean }) {
	const t = useTranslations();
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
			<div className={cn(classes.detailsWrapper, isModalOpen ? 'xl:grid-cols-1' : 'xl:grid-cols-3')}>
				<div className={classes.leftWrapper}>
					<div className={classes.descBox}>
						<TabsContent
							className={isModalOpen ? 'flex max-h-40 w-96 overflow-hidden border-none lg:w-full' : ''}
							value={EPostDetailsTab.DESCRIPTION}
						>
							<BlockEditor
								data={postData.content}
								readOnly
								className={isModalOpen ? '' : 'max-h-full border-none'}
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
						{t('PostDetails.castVote')}
					</Button>
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
