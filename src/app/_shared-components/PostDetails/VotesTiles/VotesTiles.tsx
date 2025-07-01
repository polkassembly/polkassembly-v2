// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useMemo, useCallback, useState } from 'react';
import { EAnalyticsType, EPostTileVotesType, EProposalType, ETheme, EVoteDecision, IPostTilesVotes } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { ResponsiveTreeMap } from '@nivo/treemap';
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
import classes from './VotesTiles.module.scss';
import { Skeleton } from '../../Skeleton';
import { Button } from '../../Button';

// Types
enum EVoteType {
	AYE = 'aye',
	NAY = 'nay',
	ABSTAIN = 'abstain',
	OTHERS = 'others'
}

interface IVoteDistribution {
	voter: string;
	balance: string;
	decision: EVoteDecision;
	voteType: EVoteType;
	votingPower: string | null;
	percentage: number;
	delegatorsCount?: number;
	isDelegated: boolean;
	lockPeriod: number;
}

interface IChartNode {
	id: string;
	name: string;
	value: number;
	color: string;
	percentage: number;
	decision: EVoteDecision;
	originalValue?: number;
}

// Constants
const MIN_VOTING_POWER_PERCENTAGE = 1;
const CHART_WIDTH = 280;
const MIN_WIDTH_PX = 10;
const DEFAULT_LOCK_PERIOD = 0.1;

// Utility functions
const calculateTotalDecisionVotes = ({
	votesTilesData,
	decision
}: {
	votesTilesData: IPostTilesVotes['votes'];
	decision: Exclude<EVoteDecision, EVoteDecision.SPLIT | EVoteDecision.SPLIT_ABSTAIN>;
}): BN => {
	return new BN(votesTilesData?.[`${decision}`]?.reduce((acc, curr) => new BN(acc).add(new BN(curr.votingPower || curr.balance)), BN_ZERO));
};

const calculatePerVotePercentage = ({
	vote,
	decision,
	votesTilesData
}: {
	vote: { balance: string; votingPower: string | null };
	decision: Exclude<EVoteDecision, EVoteDecision.SPLIT | EVoteDecision.SPLIT_ABSTAIN>;
	votesTilesData: IPostTilesVotes['votes'];
}): number => {
	const totalPercentage = calculateTotalDecisionVotes({ votesTilesData, decision });
	const percentage =
		new BN(vote.votingPower || vote.balance).gt(BN_ZERO) && !!totalPercentage
			? new BN(vote.votingPower || vote.balance).mul(new BN(100)).div(new BN(totalPercentage))?.toString()
			: '0';
	return Number(percentage);
};

// Custom hooks
const useVotesDistribution = ({ votesTilesData }: { votesTilesData: IPostTilesVotes['votes'] }): IVoteDistribution[] => {
	return useMemo(() => {
		const votes: IVoteDistribution[] = [];
		const decisions: Array<Exclude<EVoteDecision, EVoteDecision.SPLIT | EVoteDecision.SPLIT_ABSTAIN>> = [EVoteDecision.AYE, EVoteDecision.NAY, EVoteDecision.ABSTAIN];

		decisions.forEach((decision) => {
			const distributionKey = decision;
			const votesList = votesTilesData?.[`${distributionKey}`];

			if (votesList?.length > 0) {
				const otherVotes: IVoteDistribution = {
					voter: '',
					balance: '0',
					decision,
					voteType: EVoteType.OTHERS,
					votingPower: null,
					percentage: 0,
					isDelegated: false,
					lockPeriod: 0
				};

				const totalVotes = calculateTotalDecisionVotes({ votesTilesData, decision });
				const minVoteThreshold = totalVotes.mul(new BN(MIN_VOTING_POWER_PERCENTAGE)).div(new BN('100'));

				votesList.forEach((vote) => {
					const payload = {
						voter: vote.voter,
						balance: vote.balance,
						votingPower: vote.votingPower || null,
						voteType: EVoteType[decision.toUpperCase() as keyof typeof EVoteType],
						decision,
						percentage: calculatePerVotePercentage({ vote, decision, votesTilesData }),
						delegatorsCount: vote.delegatorsCount,
						isDelegated: vote.isDelegated,
						lockPeriod: vote.lockPeriod
					};

					if (new BN(vote.votingPower || vote.balance).lt(minVoteThreshold)) {
						otherVotes.balance = new BN(otherVotes.balance).add(new BN(vote.balance)).toString();
						otherVotes.votingPower = new BN(otherVotes.votingPower || '0').add(new BN(vote.votingPower || '0')).toString();
					} else {
						votes.push(payload);
					}
				});

				if (new BN(otherVotes.balance).gt(BN_ZERO)) {
					otherVotes.percentage = calculatePerVotePercentage({ vote: otherVotes, decision, votesTilesData });
					votes.push(otherVotes);
				}
			}
		});

		return votes;
	}, [votesTilesData]);
};

const useChartData = ({ allVotes, votesType }: { allVotes: IVoteDistribution[]; votesType: EPostTileVotesType }) => {
	const t = useTranslations('PostDetails.VotesTiles');
	const network = getCurrentNetwork();
	const {
		userPreferences: { theme }
	} = useUserPreferences();
	return useMemo(() => {
		// Calculate all vote values first
		const allRawValues = allVotes
			.map((vote) => Number(formatBnBalance(vote.votingPower || vote.balance, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network).replace(/,/g, '')))
			.filter((value) => value > 0);

		// Calculate minimum value needed for ~20px width
		// Treemap typically uses sqrt of values for sizing, so we need to calculate accordingly
		const totalValue = allRawValues.reduce((sum, val) => sum + val, 0);
		const chartWidth = CHART_WIDTH; // Approximate chart width based on container height
		const minWidthPx = MIN_WIDTH_PX;
		const minValueForVisibility = totalValue > 0 ? Math.max((minWidthPx / chartWidth) * totalValue, 1) : 1;

		const createChildren = (decision: EVoteDecision, color: string): IChartNode[] => {
			return allVotes
				.filter((vote) => vote.decision === decision)
				.sort((a, b) => Number(new BN(b.votingPower || b.balance).sub(new BN(a.votingPower || a.balance))))
				.map((vote) => {
					const rawValue = Number(
						formatBnBalance(vote.votingPower || vote.balance, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network).replace(/,/g, '')
					);
					// Ensure minimum visible value for any vote > 0
					const adjustedValue = rawValue > 0 ? Math.max(rawValue, minValueForVisibility) : rawValue;

					return {
						id: vote.voter,
						name: vote.voter,
						value: adjustedValue,
						color,
						percentage: vote.percentage,
						delegatorsCount: vote.delegatorsCount,
						isDelegated: vote.isDelegated,
						lockPeriod: vote.lockPeriod,
						decision: vote.decision,
						// Store original value for tooltip display
						originalValue: rawValue
					};
				});
		};
		const payload: {
			id: string;
			children: { id: string; name: string; children: IChartNode[]; color: string; decision: EVoteDecision }[];
			color: string;
			decision: EVoteDecision;
		} = {
			id: t('votesDistribution'),
			children: [],
			color: THEME_COLORS.light.bg_code,
			decision: EVoteDecision.AYE
		};
		if (createChildren(EVoteDecision.AYE, THEME_COLORS[`${theme}`].aye_tile_bg).length > 0) {
			payload.children.push({
				id: t('aye'),
				name: t('aye'),
				children: createChildren(EVoteDecision.AYE, THEME_COLORS[`${theme}`].aye_tile_bg),
				color: THEME_COLORS[`${theme}`].aye_tile_bg,
				decision: EVoteDecision.AYE
			});
		}
		if (createChildren(EVoteDecision.NAY, THEME_COLORS[`${theme}`].nay_tile_bg).length > 0) {
			payload.children.push({
				id: t('nay'),
				name: t('nay'),
				children: createChildren(EVoteDecision.NAY, THEME_COLORS[`${theme}`].nay_tile_bg),
				color: THEME_COLORS[`${theme}`].nay_tile_bg,
				decision: EVoteDecision.NAY
			});
		}
		if (createChildren(EVoteDecision.ABSTAIN, THEME_COLORS[`${theme}`].abstain_tile_bg).length > 0) {
			payload.children.push({
				id: t('abstain'),
				name: t('abstain'),
				children: createChildren(EVoteDecision.ABSTAIN, THEME_COLORS[`${theme}`].abstain_tile_bg),
				color: THEME_COLORS[`${theme}`].abstain_tile_bg,
				decision: EVoteDecision.ABSTAIN
			});
		}
		return payload;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allVotes, network, t, votesType, theme]);
};

// Component
function VotesTiles({ proposalType, index, analyticsType }: { proposalType: EProposalType; index: string; analyticsType: EAnalyticsType }) {
	const t = useTranslations('PostDetails.VotesTiles');
	const network = getCurrentNetwork();
	const {
		userPreferences: { theme }
	} = useUserPreferences();
	const [votesType, setVotesType] = useState<EPostTileVotesType>(EPostTileVotesType.FLATTENED);

	const getBorderColor = (decision: EVoteDecision) => {
		return THEME_COLORS.light[`${decision}_color` as keyof typeof THEME_COLORS.light];
	};
	const getDecisionColor = (decision: EVoteDecision) => {
		return THEME_COLORS[`${theme}`][`${decision}_tile_bg` as keyof (typeof THEME_COLORS)[typeof theme]];
	};
	const getPostAnalytics = async () => {
		const { data, error } = await NextApiClientService.getPostTilesVotes({
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

	const { data: votesTilesData, isFetching } = useQuery({
		queryKey: ['postTilesVotes', proposalType, index, analyticsType, votesType],
		queryFn: getPostAnalytics,
		enabled: !!proposalType && !!index,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		retry: false
	});

	const allVotes = useVotesDistribution({ votesTilesData: votesTilesData?.votes || { aye: [], nay: [], abstain: [] } });
	const chartData = useChartData({ allVotes, votesType });

	const renderTooltip = useCallback(
		// eslint-disable-next-line react/no-unused-prop-types
		({ node: { id, formattedValue } }: { node: { id: string; formattedValue: string | number } }) => {
			const vote = allVotes.find((value) => value.voter === id);
			const voteType = vote?.voteType;
			const percentage = vote?.percentage || 0;
			const delegatorsCount = vote?.delegatorsCount;
			const isDelegated = vote?.isDelegated;
			const lockPeriod = vote?.lockPeriod || DEFAULT_LOCK_PERIOD;

			// Use original vote value for display, not adjusted chart value
			const originalVoteValue = vote
				? formatUSDWithUnits(
						formatBnBalance(vote.votingPower || vote.balance, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network).replace(/,/g, ''),
						1
					)
				: formattedValue;

			const formattedBalance = formatUSDWithUnits(
				formatBnBalance(vote?.balance || BN_ZERO, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: true }, network).replace(/,/g, ''),
				1
			);

			return (
				<div className={classes.tooltip}>
					{voteType === EVoteType.OTHERS ? (
						<div className={classes.tooltipContent}>
							<span className={classes.tooltipTitle}>{t('others')}</span>
							<div className={classes.tooltipContent}>
								<span className='font-bold text-basic_text'>
									{originalVoteValue} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
								</span>
								<span className={classes.tooltipText}>{percentage}%</span>
							</div>
						</div>
					) : (
						<div className={classes.tooltipContent}>
							<Address
								address={id}
								textClassName='text-sm'
							/>
							{votesType === EPostTileVotesType.NESTED ? (
								<div className={classes.tooltipContent}>
									<div className={classes.tooltipContentValue}>
										<span className={classes.tooltipText}>
											{t('votes')}: {originalVoteValue} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
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
											{t('votes')}: {originalVoteValue} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
										</span>
									</div>
									<span className={classes.tooltipText}>{percentage}%</span>
								</div>
							)}
						</div>
					)}
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
					{[EPostTileVotesType.FLATTENED, EPostTileVotesType.NESTED].map((type) => (
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
				<Skeleton className='mt-4 h-[280px] w-full' />
			) : allVotes.length > 0 ? (
				<>
					<div className={classes.chartWrapper}>
						<ResponsiveTreeMap
							data={chartData}
							tile='squarify'
							colorBy='color'
							identity='name'
							colors={(bar) => {
								return bar.data.color;
							}}
							leavesOnly
							value='value'
							valueFormat={(value) => formatUSDWithUnits(value?.toString(), 1)}
							innerPadding={4}
							outerPadding={2}
							borderWidth={1}
							borderColor={(node) => {
								return getBorderColor(node.data.decision);
							}}
							enableParentLabel
							nodeOpacity={1}
							labelTextColor={theme === ETheme.DARK ? '#fff' : THEME_COLORS.light.text_primary}
							label={(node) => {
								const vote = allVotes.find((v) => v.voter === node.id);
								const percentage = vote?.percentage || 0;
								// Use original value from the vote data, not the adjusted chart value
								const originalValue = vote
									? Number(formatBnBalance(vote.votingPower || vote.balance, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network).replace(/,/g, ''))
									: node.value;
								return `${formatUSDWithUnits(originalValue?.toString(), 1)} ${percentage}%`;
							}}
							tooltip={renderTooltip}
							theme={{
								text: {
									fontSize: 12,
									fontWeight: 500,
									fill: THEME_COLORS.light.text_primary
								}
							}}
							margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
							labelSkipSize={30}
							parentLabelPosition='left'
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

export default VotesTiles;
