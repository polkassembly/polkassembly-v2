// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EProposalType, EVoteDecision, IVoteMetrics } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { PieChart, Pie, Cell } from 'recharts';
import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import Image from 'next/image';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import { THEME_COLORS } from '@/app/_style/theme';
import classes from './VoteSummary.module.scss';
import { Button } from '../../Button';
import VoteHistory from './VoteHistory/VoteHistory';
import { Skeleton } from '../../Skeleton';

const RADIAN = Math.PI / 180;
const NONE_CHART_VALUE = 0;

const needle = (value: number, cx: number, cy: number, length: number) => {
	const ang = 180.0 * (1 - value / 100);
	const sin = Math.sin(-RADIAN * ang);
	const cos = Math.cos(-RADIAN * ang);
	const r = 5;
	const x0 = cx;
	const y0 = cy;
	const xba = x0 + r * sin;
	const yba = y0 - r * cos;
	const xbb = x0 - r * sin;
	const ybb = y0 + r * cos;
	const xp = x0 + length * cos;
	const yp = y0 + length * sin;

	const textDistance = 25;
	const textX = xp + textDistance * cos;
	const textY = yp + textDistance * sin;

	return [
		<circle
			key='needle-circle'
			cx={x0}
			cy={y0}
			r={r}
			fill='currentColor'
			stroke='none'
		/>,
		<path
			key='needle-path'
			d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
			stroke='none'
			fill='currentColor'
		/>,
		<text
			key='needle-text'
			x={textX}
			y={textY}
			textAnchor='middle'
			dominantBaseline='middle'
			transform={`rotate(${90 - ang}, ${textX}, ${textY})`}
			fill='currentColor'
			fontSize='14'
			fontWeight='bold'
		>
			{`${value}%`}
		</text>
	];
};

function VoteSummary({ voteMetrics, proposalType, index }: { voteMetrics?: IVoteMetrics; proposalType: EProposalType; index: string }) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const [loading, setLoading] = useState(true);
	const [issuance, setIssuance] = useState<BN | null>(null);

	const [tally, setTally] = useState<{ aye: string | null; nay: string | null; support: string | null }>({
		aye: null,
		nay: null,
		support: null
	});

	const getOngoingTally = useCallback(async () => {
		if (!apiService) return;
		const ongoingReferendaTally = await apiService.getOngoingReferendaTally({ postIndex: Number(index) });
		if (!ongoingReferendaTally) {
			setTally({
				aye: voteMetrics?.[EVoteDecision.AYE].value || null,
				nay: voteMetrics?.[EVoteDecision.NAY].value || null,
				support: voteMetrics?.support?.value || null
			});
			setLoading(false);
		} else {
			setTally(ongoingReferendaTally);
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService]);

	const getIssuance = useCallback(async () => {
		if (!apiService) return;
		const totalIssuance = await apiService?.getTotalIssuance();
		const inactiveIssuance = await apiService?.getInactiveIssuance();
		const totalIssuanceBN = new BN(totalIssuance?.toString() || BN_ZERO.toString());
		const inactiveIssuanceBN = new BN(inactiveIssuance?.toString() || BN_ZERO.toString());
		const activeIssuance = totalIssuanceBN.sub(inactiveIssuanceBN);
		setIssuance(activeIssuance.lte(BN_ZERO) ? null : activeIssuance);
	}, [apiService]);

	useEffect(() => {
		if (!voteMetrics?.[EVoteDecision.AYE].count && !voteMetrics?.[EVoteDecision.NAY].count) return;
		getIssuance();
		getOngoingTally();
	}, [getOngoingTally, getIssuance, voteMetrics]);

	if (!voteMetrics?.[EVoteDecision.AYE].count && !voteMetrics?.[EVoteDecision.NAY].count) return null;

	const ayeVotesNumber = Number(formatBnBalance(tally.aye || BN_ZERO.toString(), { numberAfterComma: 6, withThousandDelimitor: false }, network));
	const totalVotesNumber = Number(
		formatBnBalance(new BN(tally.aye || BN_ZERO.toString()).add(new BN(tally.nay || BN_ZERO.toString())), { numberAfterComma: 6, withThousandDelimitor: false }, network)
	);

	const ayePercent = (ayeVotesNumber / totalVotesNumber) * 100;
	const nayPercent = 100 - ayePercent;
	const isAyeNaN = !ValidatorService.isValidNumber(ayePercent);
	const isNayNaN = !ValidatorService.isValidNumber(nayPercent);
	const AYE_TITLE = t('PostDetails.aye');
	const NAY_TITLE = t('PostDetails.nay');

	const progress = voteMetrics?.voteProgress;

	const chartData = [
		{ id: 'aye', name: 'Aye', value: isAyeNaN ? NONE_CHART_VALUE : ayePercent, color: THEME_COLORS.light.aye_color },
		{ id: 'nay', name: 'Nay', value: isNayNaN ? NONE_CHART_VALUE : nayPercent, color: THEME_COLORS.light.nay_color }
	];

	return (
		<div className={classes.voteSummaryWrapper}>
			<p className={classes.voteSummaryTitle}>{t('PostDetails.summary')}</p>
			{loading ? (
				<Skeleton className='h-[220px] w-full' />
			) : tally?.aye && tally?.nay && tally?.support && progress?.approvalThreshold && progress?.approvalThreshold > 0 ? (
				<>
					<div className={classes.voteSummaryPieChart}>
						<div className={classes.voteSummaryPieChartAyeNay}>
							<p className='text-xl font-semibold text-success'>{isAyeNaN ? 'N/A' : ayePercent.toFixed(1)}%</p>
							<p className={classes.voteSummaryPieChartAyeNayTitle}>{AYE_TITLE}</p>
						</div>
						<div className='relative flex h-[150px] w-[220px] items-center justify-center'>
							<PieChart
								width={220}
								height={200}
								className='absolute left-1/2 -translate-x-1/2'
							>
								<Pie
									data={chartData}
									cx={100}
									cy={150}
									innerRadius={65}
									outerRadius={75}
									dataKey='value'
									startAngle={180}
									endAngle={0}
									paddingAngle={-10}
									cornerRadius={15}
									stroke='none'
								>
									{chartData.map((entry) => (
										<Cell
											key={`cell-${entry.id}`}
											fill={entry.color}
											stroke='none'
										/>
									))}
								</Pie>
								{progress?.approvalThreshold && <g className='text-text_primary'>{needle(progress.approvalThreshold, 100, 150, 60)}</g>}
							</PieChart>
						</div>
						<div className={classes.voteSummaryPieChartAyeNay}>
							<p className='text-xl font-semibold text-failure'>{isNayNaN ? 'N/A' : nayPercent.toFixed(1)}%</p>
							<p className={classes.voteSummaryPieChartAyeNayTitle}>{NAY_TITLE}</p>
						</div>
					</div>

					<div className={classes.voteSummaryTable}>
						<div className={classes.voteSummaryTableItem}>
							<p className={classes.voteSummaryTableItemTitle}>
								<span>
									{AYE_TITLE} ({voteMetrics[EVoteDecision.AYE].count})
								</span>
								<span>{formatUSDWithUnits(formatBnBalance(tally.aye, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}</span>
							</p>
							<p className={classes.voteSummaryTableItemTitle}>
								<span>{t('PostDetails.support')}</span>
								<span>{formatUSDWithUnits(formatBnBalance(tally.support, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}</span>
							</p>
						</div>
						<div className={classes.voteSummaryTableItem}>
							<p className={classes.voteSummaryTableItemTitle}>
								<span>
									{NAY_TITLE} ({voteMetrics[EVoteDecision.NAY].count})
								</span>
								<span>
									{formatUSDWithUnits(formatBnBalance(tally.nay || BN_ZERO.toString(), { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}
								</span>
							</p>
							{issuance && (
								<p className={classes.voteSummaryTableItemTitle}>
									<span>{t('PostDetails.issuance')}</span>
									<span>{formatUSDWithUnits(formatBnBalance(issuance, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, getCurrentNetwork()), 1)}</span>
								</p>
							)}
						</div>
					</div>
				</>
			) : (
				<div className={classes.voteSummaryTableNoActivity}>
					<Image
						src={NoActivity}
						alt='no activity'
						width={150}
						height={150}
					/>
					<p className={classes.voteSummaryTableNoActivityTitle}>{t('PostDetails.noVotes')}</p>
				</div>
			)}
			<Dialog>
				<DialogTrigger
					asChild
					className='mt-6'
				>
					<Button
						variant='outline'
						className='flex justify-between text-xs font-normal text-text_pink'
					>
						{t('PostDetails.viewVoteHistory')}
						<ChevronRight className='h-4 w-4 text-xs text-text_pink' />
					</Button>
				</DialogTrigger>
				<DialogContent className='max-w-xl p-3 sm:p-6'>
					<DialogHeader className='text-xl font-semibold text-text_primary'>
						<DialogTitle>{t('PostDetails.voteHistory')}</DialogTitle>
					</DialogHeader>
					<VoteHistory
						proposalType={proposalType}
						index={index}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default VoteSummary;
