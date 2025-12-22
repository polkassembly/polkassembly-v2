// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EAnalyticsType, EVoteBubbleTabs, IVoteMetrics } from '@/_shared/types';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../Select/Select';
import LoadingLayover from '../../LoadingLayover';
import VoteCurves from '../VoteCurvesData/VoteCurves';
import VoteCurvesDetails from '../VoteCurvesData/VoteCurvesDetails';
import classes from './VotesData.module.scss';
import VotesBubbleChart from '../VotesBubbleChart/VotesBubbleChart';
import VoteSummary from '../VoteSummary/VoteSummary';

function VotesDataDialog({
	chartLabels,
	approvalData,
	supportData,
	approvalThresholdData,
	supportThresholdData,
	thresholdValues,
	latestApproval,
	latestSupport,
	isFetching,
	proposalType,
	index,
	enableGraph = false,
	selectedTab,
	isExpanded,
	setIsExpanded,
	voteMetrics,
	approvalThreshold
}: {
	chartLabels: number[];
	approvalData: { x: number; y: number }[];
	supportData: { x: number; y: number }[];
	approvalThresholdData: { x: number; y: number }[];
	supportThresholdData: { x: number; y: number }[];
	thresholdValues: { approvalThreshold: number; supportThreshold: number };
	latestApproval?: number;
	latestSupport?: number;
	isFetching: boolean;
	proposalType: EProposalType;
	index: string;
	enableGraph: boolean;
	selectedTab: EVoteBubbleTabs;
	isExpanded: boolean;
	setIsExpanded: (isExpanded: boolean) => void;
	voteMetrics?: IVoteMetrics;
	approvalThreshold?: number;
}) {
	const t = useTranslations('PostDetails.VotesData');
	const [activeTab, setActiveTab] = useState(selectedTab || EVoteBubbleTabs.Summary);

	useEffect(() => {
		setActiveTab(selectedTab);
	}, [selectedTab]);

	return (
		<Dialog
			open={isExpanded}
			onOpenChange={setIsExpanded}
		>
			<DialogContent className={classes.dialogContent}>
				<DialogHeader className={classes.dialogHeader}>
					<DialogTitle className={classes.dialogTitle}>
						<div className='flex items-center justify-between'>
							<Select
								value={activeTab}
								onValueChange={(value: EVoteBubbleTabs) => setActiveTab(value)}
							>
								<SelectTrigger className='flex items-center gap-2 border-none text-lg font-semibold text-text_primary shadow-none'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={EVoteBubbleTabs.Summary}>{t('voteSummary')}</SelectItem>
									<SelectItem value={EVoteBubbleTabs.Bubble}>{t('voteBubble')}</SelectItem>
									{enableGraph ? <SelectItem value={EVoteBubbleTabs.Graph}>{t('voteGraph')}</SelectItem> : null}
								</SelectContent>
							</Select>
						</div>
					</DialogTitle>
				</DialogHeader>
				<div className={classes.dialogTabsContent}>
					{isFetching && <LoadingLayover />}

					{/* Conditional Rendering based on Active Tab */}
					{activeTab === EVoteBubbleTabs.Summary ? (
						<div>
							<VoteSummary
								index={index}
								voteMetrics={voteMetrics}
								approvalThreshold={approvalThreshold}
							/>
						</div>
					) : activeTab === EVoteBubbleTabs.Graph ? (
						<div className='mt-4 h-full'>
							<VoteCurves
								chartLabels={chartLabels}
								approvalData={approvalData}
								supportData={supportData}
								approvalThresholdData={approvalThresholdData}
								supportThresholdData={supportThresholdData}
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
