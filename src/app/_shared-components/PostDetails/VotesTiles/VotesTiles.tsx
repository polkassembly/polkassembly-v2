// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useMemo, useCallback, useState } from 'react';
import { EAnalyticsType, ENetwork, EPostTilesVotesType, EProposalType, EVoteDecision, IPostTilesVotes } from '@/_shared/types';
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
}

// Constants
const MIN_VOTING_POWER_PERCENTAGE = 1;

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

const useChartData = ({ allVotes, t, network }: { allVotes: IVoteDistribution[]; t: (key: string) => string; network: ENetwork }) => {
	return useMemo(() => {
		const createChildren = (decision: EVoteDecision, color: string): IChartNode[] => {
			return allVotes
				.filter((vote) => vote.decision === decision)
				.sort((a, b) => Number(new BN(b.votingPower || b.balance).sub(new BN(a.votingPower || a.balance))))
				.map((vote) => ({
					id: vote.voter,
					name: vote.voter,
					value: Number(formatBnBalance(vote.votingPower || vote.balance, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network).replace(/,/g, '')),
					color,
					percentage: vote.percentage,
					delegatorsCount: vote.delegatorsCount,
					isDelegated: vote.isDelegated,
					lockPeriod: vote.lockPeriod
				}));
		};
		const payload: { id: string; children: { id: string; name: string; children: IChartNode[]; color: string }[]; color: string } = {
			id: t('votesDistribution'),
			children: [],
			color: THEME_COLORS.light.bg_code
		};
		if (createChildren(EVoteDecision.AYE, THEME_COLORS.light.aye_color).length > 0) {
			payload.children.push({
				id: t('aye'),
				name: t('aye'),
				children: createChildren(EVoteDecision.AYE, THEME_COLORS.light.aye_color),
				color: THEME_COLORS.light.aye_color
			});
		}
		if (createChildren(EVoteDecision.NAY, THEME_COLORS.light.nay_color).length > 0) {
			payload.children.push({
				id: t('nay'),
				name: t('nay'),
				children: createChildren(EVoteDecision.NAY, THEME_COLORS.light.nay_color),
				color: THEME_COLORS.light.nay_color
			});
		}
		if (createChildren(EVoteDecision.ABSTAIN, THEME_COLORS.light.abstain_color).length > 0) {
			payload.children.push({
				id: t('abstain'),
				name: t('abstain'),
				children: createChildren(EVoteDecision.ABSTAIN, THEME_COLORS.light.abstain_color),
				color: THEME_COLORS.light.abstain_color
			});
		}
		return payload;
	}, [allVotes, t, network]);
};

// Component
function VotesTiles({ proposalType, index, analyticsType }: { proposalType: EProposalType; index: number; analyticsType: EAnalyticsType }) {
	const t = useTranslations('PostDetails.VotesTiles');
	const network = getCurrentNetwork();
	const [votesType, setVotesType] = useState<EPostTilesVotesType>(EPostTilesVotesType.FLATTENED);

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
		enabled: !!proposalType && !!index
	});

	const allVotes = useVotesDistribution({ votesTilesData: votesTilesData?.votes || { aye: [], nay: [], abstain: [] } });
	const chartData = useChartData({ allVotes, t, network });

	const renderTooltip = useCallback(
		// eslint-disable-next-line react/no-unused-prop-types
		({ node: { id, formattedValue } }: { node: { id: string; formattedValue: string | number } }) => {
			const vote = allVotes.find((value) => value.voter === id);
			const voteType = vote?.voteType;
			const percentage = vote?.percentage || 0;
			const delegatorsCount = vote?.delegatorsCount;
			const isDelegated = vote?.isDelegated;
			const lockPeriod = vote?.lockPeriod || DEFAULT_LOCK_PERIOD;
			const formattedBalance = formatUSDWithUnits(
				formatBnBalance(vote?.balance || BN_ZERO, { numberAfterComma: 0, withThousandDelimitor: false, withUnit: true }, network).replace(/,/g, ''),
				1
			);

			return (
				<div className='flex flex-col items-center justify-center rounded-md bg-bg_code p-4'>
					{voteType === EVoteType.OTHERS ? (
						<div className='flex flex-col items-center justify-center gap-1 text-xs text-text_primary'>
							<span className='text-primary_text text-sm font-bold dark:text-white'>{t('others')}</span>
							<div className='flex items-center justify-center gap-1 text-xs text-text_primary'>
								<span className='font-bold text-basic_text'>
									{formattedValue} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
								</span>
								<span className='text-basic_text'>{percentage}%</span>
							</div>
						</div>
					) : (
						<div className='flex flex-col items-center justify-center gap-1 text-xs text-text_primary'>
							<Address
								address={id}
								textClassName='text-sm'
							/>
							{votesType === EPostTilesVotesType.NESTED ? (
								<div className='flex flex-col items-center justify-center gap-1 text-xs text-text_primary'>
									<div className='flex flex-col items-center gap-1 font-bold text-basic_text'>
										<span className='text-basic_text'>
											{t('votes')}: {formattedValue} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
										</span>
										<span className='text-basic_text'>
											{t('delegators')}: {delegatorsCount}
										</span>
									</div>
									<span className='text-basic_text'>{percentage}%</span>
								</div>
							) : (
								<div className='flex flex-col items-center justify-center gap-1 text-xs text-text_primary'>
									<div className='flex flex-col items-center gap-1 font-bold text-basic_text'>
										<div className='flex items-center gap-1'>
											<span className='text-basic_text'>{t('capital')}:</span>
											<span className='font-bold text-basic_text'>{formattedBalance}</span>
											<span className='text-basic_text'>{isDelegated ? `(${lockPeriod}x/d) ` : `(${lockPeriod}x)`}</span>
										</div>
										<span className='text-basic_text'>
											{t('votes')}: {formattedValue} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
										</span>
									</div>
									<span className='text-basic_text'>{percentage}%</span>
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
			<div className='flex items-center justify-between'>
				<h2 className='text-base font-bold text-text_primary xl:text-sm 2xl:text-base'>{t('votesDistribution')}</h2>
				<div className='flex items-center gap-1 rounded-sm bg-bg_code p-1'>
					{[EPostTilesVotesType.NESTED, EPostTilesVotesType.FLATTENED].map((type) => (
						<Button
							key={type}
							variant='ghost'
							size='sm'
							disabled={isFetching}
							onClick={() => setVotesType(type)}
							className={`h-7 px-3 text-xs font-medium transition-all ${
								votesType === type
									? 'bg-toggle_btn_active_bg text-toggle_btn_active_text shadow-sm'
									: 'bg-toggle_btn_inactive_bg text-toggle_btn_inactive_text hover:bg-primary_border'
							}`}
						>
							{t(type)}
						</Button>
					))}
				</div>
			</div>
			{isFetching ? (
				<Skeleton className='mt-4 h-[280px] w-full' />
			) : (
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
						innerPadding={6}
						outerPadding={2}
						borderWidth={1}
						borderColor='rgba(255, 255, 255, 0.3)'
						enableParentLabel
						nodeOpacity={1}
						labelTextColor={THEME_COLORS.light.text_primary}
						label={(node) => {
							const percentage = allVotes.find((vote) => vote.voter === node.id)?.percentage || 0;
							return `${node.formattedValue} ${percentage}%`;
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
			)}
		</div>
	);
}

export default VotesTiles;
