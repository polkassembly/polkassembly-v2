// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EAnalyticsType, EPostOrigin, EProposalStatus, EProposalType, EVoteBubbleTabs, EVotesDisplayType, IStatusHistoryItem, IVoteMetrics } from '@/_shared/types';
import { ChevronDown, ChevronRight, Expand } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
import { dayjs } from '@shared/_utils/dayjsInit';
import { getTrackFunctions } from '@/app/_client-utils/trackCurvesUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import { Button } from '../../Button';
import VoteSummary from '../VoteSummary/VoteSummary';
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
	voteMetrics?: IVoteMetrics;
	approvalThreshold?: number;
}

function VotesData({ proposalType, index, trackName, createdAt, timeline, setThresholdValues, thresholdValues, voteMetrics, approvalThreshold }: IVotesDataProps) {
	const t = useTranslations('PostDetails.VotesData');
	const [activeTab, setActiveTab] = useState<EVoteBubbleTabs>(EVoteBubbleTabs.Summary);
	const [votesDisplayType, setVotesDisplayType] = useState<EVotesDisplayType>(EVotesDisplayType.NESTED);
	const [isExpanded, setIsExpanded] = useState(false);

	const network = getCurrentNetwork();

	const { approvalCalc, supportCalc } = getTrackFunctions({ network, trackName });

	const fetchVoteCurves = async () => {
		const { data: voteCurveData, error } = await NextApiClientService.getVoteCurves({
			proposalType,
			indexOrHash: index
		});

		if (error || !voteCurveData) {
			throw new ClientError(error?.message || 'Failed to fetch API data');
		}

		const latestApproval = voteCurveData.length > 0 ? voteCurveData[voteCurveData.length - 1].approvalPercent : undefined;
		const latestSupport = voteCurveData.length > 0 ? voteCurveData[voteCurveData.length - 1].supportPercent : undefined;

		const trackInfo = NETWORKS_DETAILS[`${network}`]?.trackDetails?.[`${trackName}`];
		if (!trackInfo || voteCurveData.length === 0) {
			return {
				supportData: [],
				approvalData: [],
				approvalThresholdData: [],
				supportThresholdData: [],
				latestApproval,
				latestSupport,
				labels: []
			};
		}

		const labels: number[] = [];
		const supportData: { x: number; y: number }[] = [];
		const approvalData: { x: number; y: number }[] = [];

		const approvalThresholdData: { x: number; y: number }[] = [];
		const supportThresholdData: { x: number; y: number }[] = [];

		const statusBlock = timeline?.find((s) => s?.status === EProposalStatus.Deciding);

		const lastGraphPoint = voteCurveData[voteCurveData.length - 1];
		const proposalCreatedAt = dayjs(statusBlock?.timestamp || createdAt || voteCurveData[0].timestamp);

		const { decisionPeriod } = trackInfo;

		const { totalSeconds } = BlockCalculationsService.getTimeForBlocks({ network, blocks: decisionPeriod });
		const decisionPeriodInHrs = Math.floor(dayjs.duration(totalSeconds, 'seconds').asHours());
		const decisionPeriodFromTimelineInHrs = dayjs(lastGraphPoint.timestamp).diff(proposalCreatedAt, 'hour');

		if (decisionPeriodFromTimelineInHrs < decisionPeriodInHrs) {
			for (let i = 0; i < decisionPeriodInHrs; i += 1) {
				labels.push(i);

				if (approvalCalc) {
					approvalThresholdData.push({
						x: i,
						y: approvalCalc(i / decisionPeriodInHrs) * 100
					});
				}

				if (supportCalc) {
					supportThresholdData.push({
						x: i,
						y: supportCalc(i / decisionPeriodInHrs) * 100
					});
				}
			}
		}

		// Process each data point
		voteCurveData.forEach((point) => {
			const hour = dayjs(point.timestamp).diff(proposalCreatedAt, 'hour');
			labels.push(hour);

			if (decisionPeriodFromTimelineInHrs > decisionPeriodInHrs) {
				if (approvalCalc) {
					approvalThresholdData.push({
						x: hour,
						y: approvalCalc(hour / decisionPeriodFromTimelineInHrs) * 100
					});
				}
				if (supportCalc) {
					supportThresholdData.push({
						x: hour,
						y: supportCalc(hour / decisionPeriodFromTimelineInHrs) * 100
					});
				}
			}

			// Add actual data points
			if (point.supportPercent !== undefined) {
				supportData.push({
					x: hour,
					y: point.supportPercent
				});
			}

			if (point.approvalPercent !== undefined) {
				approvalData.push({
					x: hour,
					y: point.approvalPercent
				});
			}
		});

		const currentApproval = approvalData[approvalData.length - 1];
		const currentSupport = supportData[supportData.length - 1];

		setThresholdValues?.({
			approvalThreshold: approvalThresholdData.find((data) => data && data?.x >= currentApproval?.x)?.y || 0,
			supportThreshold: supportThresholdData.find((data) => data && data?.x >= currentSupport?.x)?.y || 0
		});

		return {
			supportData,
			approvalData,
			approvalThresholdData,
			supportThresholdData,
			latestApproval,
			latestSupport,
			labels
		};
	};

	const { data: voteCurveData, isFetching } = useQuery({
		queryKey: ['vote-curves', proposalType, index],
		queryFn: () => fetchVoteCurves(),
		placeholderData: (prev) =>
			prev || {
				supportData: [],
				approvalData: [],
				approvalThresholdData: [],
				supportThresholdData: [],
				latestApproval: undefined,
				latestSupport: undefined,
				labels: []
			},
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false
	});

	const enableGraph = useMemo(() => !!trackName && !!timeline?.some((s) => s.status === EProposalStatus.DecisionDepositPlaced), [trackName, timeline]);

	return (
		<div className={classes.card}>
			<div className='flex w-full items-center justify-between'>
				<h1 className={classes.header}>{t('votes')}</h1>
				<Button
					variant='ghost'
					className='mr-6 flex justify-between rounded-sm px-1.5 py-0.5 text-xs font-normal text-text_pink'
					onClick={() => setIsExpanded(true)}
				>
					<Expand className='h-2.5 w-2.5' />
				</Button>
				<VotesDataDialog
					index={index}
					setIsExpanded={setIsExpanded}
					isExpanded={isExpanded}
					chartLabels={voteCurveData?.labels || []}
					approvalData={voteCurveData?.approvalData || []}
					supportData={voteCurveData?.supportData || []}
					approvalThresholdData={voteCurveData?.approvalThresholdData || []}
					supportThresholdData={voteCurveData?.supportThresholdData || []}
					thresholdValues={thresholdValues || { approvalThreshold: 0, supportThreshold: 0 }}
					latestApproval={voteCurveData?.latestApproval}
					latestSupport={voteCurveData?.latestSupport}
					isFetching={isFetching}
					proposalType={proposalType}
					selectedTab={activeTab}
					enableGraph={enableGraph}
					voteMetrics={voteMetrics}
					approvalThreshold={approvalThreshold}
				/>
			</div>
			{enableGraph ? (
				<Tabs
					value={activeTab}
					defaultValue={activeTab}
				>
					<div className={classes.tabs}>
						{[EVoteBubbleTabs.Summary, EVoteBubbleTabs.Bubble, EVoteBubbleTabs.Graph].map((tab) => (
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
						value={EVoteBubbleTabs.Summary}
						className='px-6'
					>
						<VoteSummary
							index={index}
							voteMetrics={voteMetrics}
							approvalThreshold={approvalThreshold}
						/>
					</TabsContent>
					<TabsContent
						value={EVoteBubbleTabs.Bubble}
						className='px-6'
					>
						<VotesBubbleChart
							proposalType={proposalType}
							index={index}
							analyticsType={EAnalyticsType.CONVICTIONS}
							enableFullHeight={false}
							setIsExpanded={setIsExpanded}
						/>
					</TabsContent>
					<TabsContent value={EVoteBubbleTabs.Graph}>
						<VoteCurvesData
							latestApproval={voteCurveData?.latestApproval}
							chartLabels={voteCurveData?.labels || []}
							approvalData={voteCurveData?.approvalData || []}
							supportData={voteCurveData?.supportData || []}
							approvalThresholdData={voteCurveData?.approvalThresholdData || []}
							supportThresholdData={voteCurveData?.supportThresholdData || []}
							latestSupport={voteCurveData?.latestSupport}
							isFetching={isFetching}
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
						setIsExpanded={setIsExpanded}
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
					<DialogContent className='max-w-[90vw] p-3 sm:max-w-2xl sm:p-6'>
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
