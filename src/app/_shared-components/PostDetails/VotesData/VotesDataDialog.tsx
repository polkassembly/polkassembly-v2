// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Expand } from 'lucide-react';
import { EPostOrigin, EProposalType, IVoteCurve, IStatusHistoryItem, EAnalyticsType } from '@/_shared/types';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import { Button } from '../../Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../Select/Select';
import LoadingLayover from '../../LoadingLayover';
import VoteCurves from '../VoteCurvesData/VoteCurves';
import VoteCurvesDetails from '../VoteCurvesData/VoteCurvesDetails';
import classes from './VotesData.module.scss';
import VotesBubbleChart from '../VotesBubbleChart/VotesBubbleChart';

enum EProposalVoteType {
	Bubble = 'bubble',
	Graph = 'graph'
}

function VotesDataDialog({
	voteCurveData,
	trackName,
	timeline,
	createdAt,
	setThresholdValues,
	thresholdValues,
	latestApproval,
	latestSupport,
	isFetching,
	proposalType,
	index,
	enableGraph = false,
	selectedTab
}: {
	voteCurveData: IVoteCurve[];
	trackName: EPostOrigin;
	timeline: IStatusHistoryItem[];
	createdAt: Date;
	setThresholdValues: (thresholdValues: { approvalThreshold: number; supportThreshold: number }) => void;
	thresholdValues: { approvalThreshold: number; supportThreshold: number };
	latestApproval: number | null;
	latestSupport: number | null;
	isFetching: boolean;
	proposalType: EProposalType;
	index: string;
	enableGraph: boolean;
	selectedTab: EProposalVoteType;
}) {
	const t = useTranslations('PostDetails.VotesData');
	const [isExpanded, setIsExpanded] = useState(false);
	const [activeTab, setActiveTab] = useState(selectedTab || EProposalVoteType.Bubble);

	useEffect(() => {
		setActiveTab(selectedTab);
	}, [selectedTab]);

	return (
		<Dialog
			open={isExpanded}
			onOpenChange={setIsExpanded}
		>
			<DialogTrigger
				asChild
				className='mt-6'
			>
				<Button
					variant='ghost'
					className='mr-6 flex justify-between rounded-sm px-1.5 py-0.5 text-xs font-normal text-text_pink'
					onClick={() => setIsExpanded(true)}
				>
					<Expand className='h-2.5 w-2.5' />
				</Button>
			</DialogTrigger>
			<DialogContent className={classes.dialogContent}>
				<DialogHeader className={classes.dialogHeader}>
					<DialogTitle className={classes.dialogTitle}>
						{enableGraph ? (
							<div className='flex items-center justify-between'>
								<Select
									value={activeTab}
									onValueChange={(value: EProposalVoteType) => setActiveTab(value)}
								>
									<SelectTrigger className='flex items-center gap-2 border-none text-lg font-semibold text-text_primary shadow-none'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={EProposalVoteType.Bubble}>{t('voteBubble')}</SelectItem>
										<SelectItem value={EProposalVoteType.Graph}>{t('voteGraph')}</SelectItem>
									</SelectContent>
								</Select>
							</div>
						) : (
							<div className='flex items-center gap-2 border-none text-lg font-semibold text-text_primary shadow-none'>{t('voteBubble')}</div>
						)}
					</DialogTitle>
				</DialogHeader>
				<div className={classes.dialogTabsContent}>
					{isFetching && <LoadingLayover />}

					{/* Conditional Rendering based on Active Tab */}
					{activeTab === EProposalVoteType.Graph ? (
						<div className='mt-4 h-full'>
							<VoteCurves
								voteCurveData={voteCurveData || []}
								trackName={trackName}
								timeline={timeline}
								createdAt={createdAt}
								setThresholdValues={setThresholdValues}
							/>
							<div className='mt-6'>
								<VoteCurvesDetails
									latestApproval={latestApproval}
									latestSupport={latestSupport}
									thresholdValues={thresholdValues || null}
								/>
							</div>
						</div>
					) : (
						<div className='-mt-3 pb-6 text-center'>
							<VotesBubbleChart
								proposalType={proposalType}
								analyticsType={EAnalyticsType.CONVICTIONS}
								index={index}
								enableFilter
							/>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default VotesDataDialog;
