// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EAnalyticsType, EPostOrigin, EProposalStatus, EProposalType, IStatusHistoryItem } from '@/_shared/types';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import { Button } from '../../Button';
import VoteHistory from '../VoteSummary/VoteHistory/VoteHistory';
import VoteCurvesData from '../VoteCurvesData/VoteCurvesData';
import VotesDistributionTiles from '../VotesDistributionTiles/VotesDistributionTiles';
import { Tabs, TabsContent } from '../../Tabs';
import classes from './VotesData.module.scss';

interface IVotesDataProps {
	proposalType: EProposalType;
	index: string;
	trackName: EPostOrigin;
	createdAt?: Date;
	timeline?: IStatusHistoryItem[];
	setThresholdValues?: (values: { approvalThreshold: number; supportThreshold: number }) => void;
	thresholdValues?: { approvalThreshold: number; supportThreshold: number };
}

enum EProposalVoteType {
	Tile = 'tile',
	Graph = 'graph'
}

function VotesData({ proposalType, index, trackName, createdAt, timeline, setThresholdValues, thresholdValues }: IVotesDataProps) {
	const t = useTranslations('PostDetails.VotesData');
	const [activeTab, setActiveTab] = useState<EProposalVoteType>(EProposalVoteType.Tile);
	return (
		<div className={classes.card}>
			<h1 className={classes.header}>{t('votes')}</h1>
			<Tabs
				value={activeTab}
				defaultValue={activeTab}
			>
				<div className={classes.tabs}>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setActiveTab(EProposalVoteType.Tile)}
						className={cn(classes.tab, 'h-7', activeTab === EProposalVoteType.Tile ? classes.activeTab : classes.inactiveTab)}
					>
						{t('tile')}
					</Button>
					{!!trackName && timeline?.some((s) => s.status === EProposalStatus.DecisionDepositPlaced) && (
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setActiveTab(EProposalVoteType.Graph)}
							className={cn(classes.tab, 'h-7', activeTab === EProposalVoteType.Graph ? classes.activeTab : classes.inactiveTab)}
						>
							{t('graph')}
						</Button>
					)}
				</div>
				{activeTab === EProposalVoteType.Tile && (
					<TabsContent
						value={EProposalVoteType.Tile}
						className='px-6'
					>
						<VotesDistributionTiles
							proposalType={proposalType}
							index={index}
							analyticsType={EAnalyticsType.CONVICTIONS}
						/>
					</TabsContent>
				)}
				{activeTab === EProposalVoteType.Graph && !!trackName && timeline?.some((s) => s.status === EProposalStatus.DecisionDepositPlaced) && (
					<TabsContent value={EProposalVoteType.Graph}>
						<VoteCurvesData
							proposalType={proposalType}
							index={index}
							createdAt={createdAt}
							trackName={trackName}
							timeline={timeline}
							setThresholdValues={setThresholdValues}
							thresholdValues={thresholdValues}
						/>
					</TabsContent>
				)}
			</Tabs>
			<div className={classes.voteHistoryContainer}>
				<Dialog>
					<DialogTrigger
						asChild
						className='mt-6'
					>
						<Button
							variant='outline'
							className='flex w-full justify-between rounded-sm px-2 text-xs font-normal text-text_pink'
						>
							{t('voteHistory')}
							<ChevronRight className={classes.voteHistoryButtonIcon} />
						</Button>
					</DialogTrigger>
					<DialogContent className={classes.voteHistoryDialogContent}>
						<DialogHeader className={classes.voteHistoryDialogHeader}>
							<DialogTitle>{t('voteHistory')}</DialogTitle>
						</DialogHeader>
						<VoteHistory
							proposalType={proposalType}
							index={index}
						/>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}

export default VotesData;
