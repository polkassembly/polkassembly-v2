// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EAnalyticsType, EPostOrigin, EProposalStatus, EProposalType, IStatusHistoryItem } from '@/_shared/types';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import { Button } from '../../Button';
import VoteHistory from '../VoteSummary/VoteHistory/VoteHistory';
import VoteCurvesData from '../VoteCurvesData/VoteCurvesData';
import VotesBubbleChart from '../VotesBubbleChart/VotesBubbleChart';
import { Tabs, TabsContent } from '../../Tabs';
import classes from './VotesData.module.scss';
import VotesDataDialog from './VotesDataDialog';

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
	Bubble = 'bubble',
	Graph = 'graph'
}

function VotesData({ proposalType, index, trackName, createdAt, timeline, setThresholdValues, thresholdValues }: IVotesDataProps) {
	const t = useTranslations('PostDetails.VotesData');
	const [activeTab, setActiveTab] = useState<EProposalVoteType>(EProposalVoteType.Bubble);
	const fetchVoteCurves = async () => {
		const { data, error } = await NextApiClientService.getVoteCurves({
			proposalType,
			indexOrHash: index
		});

		if (error || !data) {
			throw new ClientError(error?.message || 'Failed to fetch API data');
		}

		return data;
	};

	const { data: voteCurveData, isFetching } = useQuery({
		queryKey: ['vote-curves', proposalType, index],
		queryFn: () => fetchVoteCurves(),
		placeholderData: [],
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false
	});

	const latestApproval = Array.isArray(voteCurveData) && voteCurveData.length > 0 ? voteCurveData[voteCurveData.length - 1].approvalPercent : null;
	const latestSupport = Array.isArray(voteCurveData) && voteCurveData.length > 0 ? voteCurveData[voteCurveData.length - 1].supportPercent : null;

	return (
		<div className={classes.card}>
			<div className='flex w-full items-center justify-between'>
				<h1 className={classes.header}>{t('votes')}</h1>
				<VotesDataDialog
					index={index}
					voteCurveData={voteCurveData || []}
					trackName={trackName}
					timeline={timeline || []}
					createdAt={createdAt || new Date()}
					setThresholdValues={setThresholdValues || (() => {})}
					thresholdValues={thresholdValues || { approvalThreshold: 0, supportThreshold: 0 }}
					latestApproval={latestApproval}
					latestSupport={latestSupport}
					isFetching={isFetching}
					proposalType={proposalType}
				/>
			</div>
			<Tabs
				value={activeTab}
				defaultValue={activeTab}
			>
				<div className={classes.tabs}>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setActiveTab(EProposalVoteType.Bubble)}
						className={cn(classes.tab, 'h-7', activeTab === EProposalVoteType.Bubble ? classes.activeTab : classes.inactiveTab)}
					>
						{t('bubble')}
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
				{activeTab === EProposalVoteType.Bubble && (
					<TabsContent
						value={EProposalVoteType.Bubble}
						className='px-6'
					>
						<VotesBubbleChart
							proposalType={proposalType}
							index={index}
							analyticsType={EAnalyticsType.CONVICTIONS}
							enableFullHeight={false}
						/>
					</TabsContent>
				)}
				{activeTab === EProposalVoteType.Graph && !!trackName && timeline?.some((s) => s.status === EProposalStatus.DecisionDepositPlaced) && (
					<TabsContent value={EProposalVoteType.Graph}>
						<VoteCurvesData
							latestApproval={latestApproval}
							latestSupport={latestSupport}
							isFetching={isFetching}
							voteCurveData={voteCurveData || []}
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
