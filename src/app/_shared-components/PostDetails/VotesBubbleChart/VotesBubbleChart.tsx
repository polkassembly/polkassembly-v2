// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useMemo, useCallback, useState } from 'react';
import { EAnalyticsType, ENetwork, EVotesDisplayType, EProposalType, ETheme, EVoteDecision, IPostBubbleVotes, IVoteDistribution } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { ResponsiveCirclePacking } from '@nivo/circle-packing';
import { THEME_COLORS } from '@/app/_style/theme';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { BN, BN_ZERO } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import Image from 'next/image';
import noData from '@/_assets/activityfeed/gifs/noactivity.gif';
import { animated } from '@react-spring/web';
import { useRouter } from 'next/navigation';
import Address from '../../Profile/Address/Address';
import classes from './VotesBubbleChart.module.scss';
import { Skeleton } from '../../Skeleton';
import { Button } from '../../Button';

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
	return new BN(votesBubbleData?.[`${decision}`]?.reduce((acc, curr) => new BN(acc).add(new BN(curr.votingPower || curr.balanceValue)), BN_ZERO));
};

const calculatePerVotePercentage = ({
	vote,
	decision,
	votesBubbleData
}: {
	vote: { balanceValue: string; votingPower?: string | null };
	decision: Exclude<EVoteDecision, EVoteDecision.SPLIT | EVoteDecision.SPLIT_ABSTAIN>;
	votesBubbleData: IPostBubbleVotes['votes'];
}): number => {
	const totalPercentage = calculateTotalDecisionVotes({ votesBubbleData, decision });
	const percentage =
		new BN(vote.votingPower || vote.balanceValue).gt(BN_ZERO) && !!totalPercentage
			? new BN(vote.votingPower || vote.balanceValue).mul(new BN(100)).div(new BN(totalPercentage))?.toString()
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
					voterAddress: vote.voterAddress,
					balanceValue: vote.balanceValue,
					votingPower: vote.votingPower,
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
		id: vote.voterAddress,
		name: vote.voterAddress,
		value: Number(formatBnBalance(vote.votingPower || vote.balanceValue, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network).replace(/,/g, '')),
		color: getDecisionColor(vote.decision),
		percentage: vote.percentage || 0,
		delegatorsCount: vote.delegatorsCount || 0,
		isDelegated: vote.isDelegated,
		lockPeriod: vote.lockPeriod,
		decision: vote.decision
	}));
};

const getPostAnalytics = async ({
	proposalType,
	index,
	analyticsType,
	votesType,
	skipCache = false
}: {
	proposalType: EProposalType;
	index: string;
	analyticsType: EAnalyticsType;
	votesType: EVotesDisplayType;
	skipCache?: boolean;
}) => {
	const { data, error } = await NextApiClientService.getPostBubbleVotes({
		proposalType: proposalType as EProposalType,
		index: index.toString(),
		analyticsType,
		votesType,
		skipCache
	});
	if (error) {
		throw new Error(error?.message || 'Failed to fetch data');
	}
	return data;
};

// Component
function VotesBubbleChart({
	proposalType,
	index,
	analyticsType,
	enableTitle = false,
	enableFilter = false,
	enableFullHeight = true,
	setIsExpanded
}: {
	proposalType: EProposalType;
	index: string;
	analyticsType: EAnalyticsType;
	enableTitle?: boolean;
	enableFilter?: boolean;
	enableFullHeight?: boolean;
	setIsExpanded?: (isExpanded: boolean) => void;
}) {
	const t = useTranslations('PostDetails.VotesBubble');
	const network = getCurrentNetwork();
	const router = useRouter();
	const {
		userPreferences: { theme }
	} = useUserPreferences();
	const [votesType, setVotesType] = useState<EVotesDisplayType>(EVotesDisplayType.NESTED);

	const getBorderColor = (decision: EVoteDecision) => {
		return THEME_COLORS.light[`${decision}_color` as keyof typeof THEME_COLORS.light];
	};
	const getDecisionColor = (decision: EVoteDecision) => {
		return THEME_COLORS[`${theme}`][`${decision}_bubble_bg` as keyof (typeof THEME_COLORS)[typeof theme]];
	};

	// First query: fetch from cache
	const {
		data: cachedData,
		isFetching: isFetchingCached,
		isSuccess: isCachedSuccess
	} = useQuery({
		queryKey: ['postBubbleVotes', proposalType, index, analyticsType, votesType, 'cached'],
		queryFn: () => getPostAnalytics({ proposalType, index, analyticsType, votesType }),
		enabled: !!proposalType && !!index,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		retry: false
	});

	// Second query: fetch fresh data after cached data arrives (no loading state shown for this)
	const { data: freshData } = useQuery({
		queryKey: ['postBubbleVotes', proposalType, index, analyticsType, votesType, 'fresh'],
		queryFn: () => getPostAnalytics({ proposalType, index, analyticsType, votesType, skipCache: true }),
		enabled: !!proposalType && !!index && isCachedSuccess,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		retry: false
	});

	// Use fresh data if available, otherwise use cached data
	const votesBubbleData = useMemo(() => freshData || cachedData, [freshData, cachedData]);

	const allVotes = useVotesDistribution({ votesBubbleData: votesBubbleData?.votes || { aye: [], nay: [], abstain: [] } });
	const chartData = useMemo(() => {
		return getChartData(allVotes, network, getDecisionColor);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allVotes, network, votesType]);

	const renderTooltip = useCallback(
		(node: { id: string; formattedValue: string; percentage: number }) => {
			const { id, formattedValue } = node;
			const vote = allVotes.find((value) => value.voterAddress === id);
			const percentage = vote?.percentage || 0;
			const delegatorsCount = vote?.delegatorsCount;
			const isDelegated = vote?.isDelegated;
			const lockPeriod = vote?.lockPeriod || DEFAULT_LOCK_PERIOD;

			const formattedBalance = formatUSDWithUnits(
				formatBnBalance(vote?.balanceValue || BN_ZERO, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: true }, network).replace(/,/g, ''),
				1
			);

			return (
				<div className={classes.tooltip}>
					<div className={classes.tooltipContent}>
						<Address
							address={id}
							textClassName='text-sm'
							redirectToProfile
							disableTooltip
						/>
						{votesType === EVotesDisplayType.NESTED ? (
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

	// Custom label component for circle packing chart
	const CirclePackingLabel = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(props: any) => {
			const radius = props.node.radius || 20;

			// Only show labels for bubbles with sufficient size
			if (radius < 30) {
				return <div />;
			}

			// Calculate dimensions that fit WITHIN the circle - be more conservative
			// Use 80% of diameter to ensure text fits comfortably within circle bounds
			const availableWidth = radius * 1.6; // 80% of diameter
			const availableHeight = radius * 1.2; // 60% of diameter for height

			// Get the exact center coordinates from the node
			const centerX = props.node.x || props.style.x;
			const centerY = props.node.y || props.style.y;

			return (
				<animated.foreignObject
					key={props.node.id}
					x={centerX - availableWidth / 2}
					y={centerY - availableHeight / 2}
					width={availableWidth}
					height={availableHeight}
					style={{
						pointerEvents: 'none',
						overflow: 'visible'
					}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							width: '100%',
							height: '100%',
							fontWeight: 600,
							color: theme === ETheme.DARK ? '#fff' : '#000',
							textAlign: 'center',
							lineHeight: '1.1',
							padding: '2px',
							boxSizing: 'border-box',
							position: 'relative'
						}}
					>
						<div
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<Address
								address={props.node.data.name}
								truncateCharLen={3}
								textClassName='text-xs font-semibold lg:text-xs'
								className='text-center text-xs font-semibold leading-none lg:text-xs'
								wrapperClassName='w-full'
								showIdenticon={false}
								redirectToProfile
								disableTooltip
							/>
						</div>
					</div>
				</animated.foreignObject>
			);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[theme]
	);

	return (
		<div className={enableTitle ? classes.card : 'mt-4'}>
			<div className={classes.header}>
				{enableTitle && <h2 className={classes.heading}>{t('votesDistribution')}</h2>}
				{enableFilter && (
					<div className={classes.buttonContainer}>
						{[EVotesDisplayType.NESTED, EVotesDisplayType.FLATTENED].map((type) => (
							<Button
								key={type}
								variant='ghost'
								disabled={isFetchingCached}
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
				)}
			</div>

			{isFetchingCached ? (
				<Skeleton className={cn('mt-4 w-full', enableFullHeight ? 'h-full min-h-[50vh]' : 'h-[300px]')} />
			) : allVotes.length > 0 ? (
				<div className={enableFilter ? 'mt-6' : ''}>
					<div className={cn(classes.chartWrapper, enableFullHeight ? 'h-full min-h-[50vh]' : 'h-[300px]')}>
						<ResponsiveCirclePacking
							data={{ name: t('votesDistribution'), children: chartData, color: 'transparent' }}
							colors={(node) => {
								const chartItem = chartData.find((item) => item.id === node.id);
								return chartItem ? getDecisionColor(chartItem.decision) : '#000';
							}}
							leavesOnly
							onClick={(node) => {
								if (setIsExpanded) {
									setIsExpanded(true);
								} else {
									router.push(`/user/address/${node.id}`);
								}
							}}
							value='value'
							valueFormat={(value) => formatUSDWithUnits(value?.toString(), 1)}
							padding={6}
							borderWidth={1}
							borderColor={(node) => {
								const chartItem = chartData.find((item) => item.id === node.id);
								return chartItem ? getBorderColor(chartItem.decision) : '#000';
							}}
							enableLabels
							labelTextColor={theme === ETheme.DARK ? '#fff' : THEME_COLORS.light.text_primary}
							labelsSkipRadius={30}
							labelComponent={CirclePackingLabel}
							tooltip={renderTooltip}
							margin={{ bottom: 20, left: 20, right: 20, top: 20 }}
							motionConfig='gentle'
						/>
					</div>
					{enableFilter && (
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
					)}
				</div>
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
