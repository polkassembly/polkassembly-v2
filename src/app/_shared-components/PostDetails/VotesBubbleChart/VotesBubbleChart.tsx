// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useMemo, useCallback, useState } from 'react';
import { EAnalyticsType, ENetwork, EPostBubbleVotesType, EProposalType, ETheme, EVoteDecision, IPostBubbleVotes } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import { THEME_COLORS } from '@/app/_style/theme';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { BN, BN_ZERO } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import Image from 'next/image';
import noData from '@/_assets/activityfeed/gifs/noactivity.gif';
import Address from '../../Profile/Address/Address';
import classes from './VotesBubbleChart.module.scss';
import { Skeleton } from '../../Skeleton';
import { Button } from '../../Button';

interface IVoteDistribution {
	voter: string;
	balance: string;
	decision: EVoteDecision;
	votingPower: string | null;
	percentage: number;
	delegatorsCount?: number;
	isDelegated: boolean;
	lockPeriod: number;
}

interface INodeData {
	id: string;
	name: string;
	value: number;
	color: string;
	percentage: number;
	delegatorsCount: number;
	isDelegated: boolean;
	lockPeriod: number;
	decision: EVoteDecision;
}

// Constants
const DEFAULT_LOCK_PERIOD = 0.1;

// Utility functions
const calculateTotalDecisionVotes = ({
	votesBubbleData,
	decision
}: {
	votesBubbleData: IPostBubbleVotes['votes'];
	decision: Exclude<EVoteDecision, EVoteDecision.SPLIT | EVoteDecision.SPLIT_ABSTAIN>;
}): BN => {
	return new BN(votesBubbleData?.[`${decision}`]?.reduce((acc, curr) => new BN(acc).add(new BN(curr.votingPower || curr.balance)), BN_ZERO));
};

const calculatePerVotePercentage = ({
	vote,
	decision,
	votesBubbleData
}: {
	vote: { balance: string; votingPower: string | null };
	decision: Exclude<EVoteDecision, EVoteDecision.SPLIT | EVoteDecision.SPLIT_ABSTAIN>;
	votesBubbleData: IPostBubbleVotes['votes'];
}): number => {
	const totalPercentage = calculateTotalDecisionVotes({ votesBubbleData, decision });
	const percentage =
		new BN(vote.votingPower || vote.balance).gt(BN_ZERO) && !!totalPercentage
			? new BN(vote.votingPower || vote.balance).mul(new BN(100)).div(new BN(totalPercentage))?.toString()
			: '0';
	return Math.round(Number(percentage));
};

// Custom hooks
const useVotesDistribution = ({ votesBubbleData }: { votesBubbleData: IPostBubbleVotes['votes'] }): IVoteDistribution[] => {
	return useMemo(() => {
		const votes: IVoteDistribution[] = [];
		const decisions: Array<Exclude<EVoteDecision, EVoteDecision.SPLIT | EVoteDecision.SPLIT_ABSTAIN>> = [EVoteDecision.AYE, EVoteDecision.NAY, EVoteDecision.ABSTAIN];

		decisions.forEach((decision) => {
			const distributionKey = decision;
			const votesList = votesBubbleData?.[`${distributionKey}`];
			if (votesList?.length === 0) return;

			votesList.forEach((vote) => {
				const payload = {
					voter: vote.voter,
					balance: vote.balance,
					votingPower: vote.votingPower || null,
					decision,
					percentage: calculatePerVotePercentage({ vote, decision, votesBubbleData }),
					delegatorsCount: vote.delegatorsCount,
					isDelegated: vote.isDelegated,
					lockPeriod: vote.lockPeriod
				};

				votes.push(payload);
			});
		});

		return votes;
	}, [votesBubbleData]);
};

const getChartData = (allVotes: IVoteDistribution[], network: ENetwork, getDecisionColor: (decision: EVoteDecision) => string): INodeData[] => {
	return allVotes.map((vote: IVoteDistribution) => ({
		id: vote.voter,
		name: vote.voter,
		value: Number(formatBnBalance(vote.votingPower || vote.balance, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network).replace(/,/g, '')),
		color: getDecisionColor(vote.decision),
		percentage: vote.percentage,
		delegatorsCount: vote.delegatorsCount || 0,
		isDelegated: vote.isDelegated,
		lockPeriod: vote.lockPeriod,
		decision: vote.decision
	}));
};

// Component
function VotesBubbleChart({ proposalType, index, analyticsType }: { proposalType: EProposalType; index: string; analyticsType: EAnalyticsType }) {
	const t = useTranslations('PostDetails.VotesBubble');
	const network = getCurrentNetwork();
	const {
		userPreferences: { theme }
	} = useUserPreferences();
	const [votesType, setVotesType] = useState<EPostBubbleVotesType>(EPostBubbleVotesType.FLATTENED);

	const getBorderColor = (decision: EVoteDecision) => {
		return THEME_COLORS.light[`${decision}_color` as keyof typeof THEME_COLORS.light];
	};
	const getDecisionColor = (decision: EVoteDecision) => {
		return THEME_COLORS[`${theme}`][`${decision}_bubble_bg` as keyof (typeof THEME_COLORS)[typeof theme]];
	};
	const getPostAnalytics = async () => {
		const { data, error } = await NextApiClientService.getPostBubbleVotes({
			proposalType: proposalType as EProposalType,
			index: index.toString(),
			analyticsType,
			votesType
		});
		if (error || !data) {
			throw new ClientError(error?.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data: votesBubbleData, isFetching } = useQuery({
		queryKey: ['postBubbleVotes', proposalType, index, analyticsType, votesType],
		queryFn: getPostAnalytics,
		enabled: !!proposalType && !!index,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		retry: false
	});

	const allVotes = useVotesDistribution({ votesBubbleData: votesBubbleData?.votes || { aye: [], nay: [], abstain: [] } });
	const chartData = useMemo(() => {
		return getChartData(allVotes, network, getDecisionColor);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allVotes, network, votesType]);

	const renderTooltip = useCallback(
		(node: { id: string; formattedValue: string; percentage: number }) => {
			const { id, formattedValue } = node;
			const vote = allVotes.find((value) => value.voter === id);
			const percentage = vote?.percentage || 0;
			const delegatorsCount = vote?.delegatorsCount;
			const isDelegated = vote?.isDelegated;
			const lockPeriod = vote?.lockPeriod || DEFAULT_LOCK_PERIOD;

			const formattedBalance = formatUSDWithUnits(
				formatBnBalance(vote?.balance || BN_ZERO, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: true }, network).replace(/,/g, ''),
				1
			);

			return (
				<div className={classes.tooltip}>
					<div className={classes.tooltipContent}>
						<Address
							address={id}
							textClassName='text-sm'
						/>
						{votesType === EPostBubbleVotesType.NESTED ? (
							<div className={classes.tooltipContent}>
								<div className={classes.tooltipContentValue}>
									<span className={classes.tooltipText}>
										{t('votes')}: {formattedValue} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
									</span>
									<span className={classes.tooltipText}>
										{t('delegators')}: {delegatorsCount}
									</span>
								</div>
								<span className={classes.tooltipText}>{percentage}%</span>
							</div>
						) : (
							<div className={classes.tooltipContent}>
								<div className={classes.tooltipContentValue}>
									<div className='flex items-center gap-1'>
										<span className={classes.tooltipText}>{t('capital')}:</span>
										<span className='font-bold text-basic_text'>{formattedBalance}</span>
										<span className={classes.tooltipText}>{isDelegated ? `(${lockPeriod}x/d) ` : `(${lockPeriod}x)`}</span>
									</div>
									<span className={classes.tooltipText}>
										{t('votes')}: {formattedValue} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
									</span>
								</div>
								<span className={classes.tooltipText}>{percentage}%</span>
							</div>
						)}
					</div>
				</div>
			);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[allVotes, t, network]
	);

	return (
		<div className={classes.card}>
			<div className={classes.header}>
				<h2 className={classes.heading}>{t('votesDistribution')}</h2>
				<div className={classes.buttonContainer}>
					{[EPostBubbleVotesType.FLATTENED, EPostBubbleVotesType.NESTED].map((type) => (
						<Button
							key={type}
							variant='ghost'
							disabled={isFetching}
							onClick={() => setVotesType(type)}
							className={cn(
								'h-7 w-full bg-transparent px-3 text-sm font-medium shadow-none transition-all hover:bg-transparent',
								votesType === type ? 'bg-toggle_btn_active_bg font-semibold text-toggle_btn_active_text shadow-sm' : 'text-toggle_btn_inactive_text hover:bg-primary_border'
							)}
						>
							{t(type)}
						</Button>
					))}
				</div>
			</div>

			{isFetching ? (
				<Skeleton className='mt-4 h-[500px] w-full' />
			) : allVotes.length > 0 ? (
				<>
					<div className={classes.chartWrapper}>
						<ResponsiveCirclePacking
							data={{ name: t('votesDistribution'), children: chartData, color: 'transparent' }}
							colors={(node) => {
								const chartItem = chartData.find((item) => item.id === node.id);
								return chartItem ? getDecisionColor(chartItem.decision) : '#000';
							}}
							leavesOnly
							value='value'
							valueFormat={(value) => formatUSDWithUnits(value?.toString(), 1)}
							padding={4}
							borderWidth={1}
							borderColor={(node) => {
								const chartItem = chartData.find((item) => item.id === node.id);
								return chartItem ? getBorderColor(chartItem.decision) : '#000';
							}}
							enableLabels
							labelTextColor={theme === ETheme.DARK ? '#fff' : THEME_COLORS.light.text_primary}
							labelsSkipRadius={20}
							label={(node) => {
								return `${node.formattedValue} ${Math.round(node.percentage)}%`;
							}}
							tooltip={renderTooltip}
							margin={{ bottom: 10, left: 10, right: 10, top: 10 }}
							motionConfig='gentle'
						/>
					</div>
					<div className={classes.decisionsContainer}>
						{[EVoteDecision.AYE, EVoteDecision.NAY, EVoteDecision.ABSTAIN].map((decision) => {
							const bgColor = getDecisionColor(decision);
							const borderColor = getBorderColor(decision);

							return (
								<div
									key={decision}
									className={cn(classes.decisionContainer, `border-${borderColor} bg-${bgColor}`)}
									style={{ backgroundColor: bgColor, borderColor }}
								>
									<div
										className='h-3 w-3 rounded-full'
										style={{ backgroundColor: borderColor }}
									/>
									<span className='text-sm font-medium text-text_primary dark:text-white'>{t(decision)}</span>
								</div>
							);
						})}
					</div>
				</>
			) : (
				// No votes found
				<div className='flex flex-col items-center justify-center gap-5'>
					<Image
						src={noData}
						alt='no data'
						width={100}
						height={100}
						className='my-4'
					/>
					<p className='text-sm'>{t('noVotesFound')}</p>
				</div>
			)}
		</div>
	);
}

export default VotesBubbleChart;
