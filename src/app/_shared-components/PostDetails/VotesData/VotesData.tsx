// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EAnalyticsType, EPostOrigin, EProposalStatus, EProposalType, EVotesDisplayType, IStatusHistoryItem } from '@/_shared/types';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../Select/Select';

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
	const [votesDisplayType, setVotesDisplayType] = useState<EVotesDisplayType>(EVotesDisplayType.NESTED);
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

	const enableGraph = useMemo(() => !!trackName && !!timeline?.some((s) => s.status === EProposalStatus.DecisionDepositPlaced), [trackName, timeline]);
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
					selectedTab={activeTab}
					enableGraph={enableGraph}
				/>
			</div>
			{enableGraph ? (
				<Tabs
					value={activeTab}
					defaultValue={activeTab}
				>
					<div className={classes.tabs}>
						{[EProposalVoteType.Bubble, EProposalVoteType.Graph].map((tab) => (
							<Button
								key={tab}
								variant='ghost'
								size='sm'
								onClick={() => setActiveTab(tab)}
								className={cn(classes.tab, 'h-7', activeTab === tab ? classes.activeTab : classes.inactiveTab)}
							>
								{t(tab)}
							</Button>
						))}
					</div>
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
				</Tabs>
			) : (
				<div className='px-6'>
					<VotesBubbleChart
						proposalType={proposalType}
						index={index}
						analyticsType={EAnalyticsType.CONVICTIONS}
						enableFullHeight={false}
					/>
				</div>
			)}

			<div className={classes.voteHistoryContainer}>
				<Dialog>
					<DialogTrigger
						asChild
						className='mt-6'
					>
						<Button
							variant='outline'
							className='flex w-full justify-between text-xs font-normal text-text_pink'
						>
							{t('voteHistory')}
							<ChevronRight className='h-4 w-4 text-xs text-text_pink' />
						</Button>
					</DialogTrigger>
					<DialogContent className='max-w-2xl p-3 sm:p-6'>
						<DialogHeader>
							<DialogTitle>
								<Select
									value={votesDisplayType}
									onValueChange={(value) => setVotesDisplayType(value as EVotesDisplayType)}
								>
									<SelectTrigger
										className='m-0 mb-0 flex w-fit items-center gap-x-2 border-none p-0 text-lg text-text_primary shadow-none'
										hideChevron
									>
										<SelectValue
											placeholder={t('voteHistory')}
											className='-mt-2 text-lg font-semibold text-text_primary'
										/>
										<ChevronDown className='h-5 w-5 text-xs font-semibold' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={EVotesDisplayType.NESTED}>{t('nestedVotes')}</SelectItem>
										<SelectItem value={EVotesDisplayType.FLATTENED}>{t('flattenedVotes')}</SelectItem>
									</SelectContent>
								</Select>
							</DialogTitle>
						</DialogHeader>
						<VoteHistory
							proposalType={proposalType}
							index={index}
							votesDisplayType={votesDisplayType}
						/>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}

export default VotesData;
