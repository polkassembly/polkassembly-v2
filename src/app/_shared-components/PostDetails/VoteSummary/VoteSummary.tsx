// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EProposalType, EVoteDecision, IVoteMetrics } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { PieChart } from 'react-minimal-pie-chart';
import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { THEME_COLORS } from '@/app/_style/theme';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import classes from './VoteSummary.module.scss';
import { Button } from '../../Button';
import VoteHistory from './VoteHistory/VoteHistory';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../../Tooltip';
import LoadingLayover from '../../LoadingLayover';

const NONE_CHART_VALUE = 0;

function ThresholdPoint({ approvalThreshold }: { approvalThreshold: number }) {
	const t = useTranslations();

	const centerX = 50;
	const centerY = 75;
	const arcRadius = 46;
	const lineWidth = 8;
	const angle = -180 + (180 * approvalThreshold) / 100;
	const radians = (angle * Math.PI) / 180;

	const innerRadius = arcRadius - lineWidth / 2;
	const outerRadius = arcRadius + lineWidth / 2;
	const lineStartX = centerX + innerRadius * Math.cos(radians);
	const lineStartY = centerY + innerRadius * Math.sin(radians);
	const lineEndX = centerX + outerRadius * Math.cos(radians);
	const lineEndY = centerY + outerRadius * Math.sin(radians);

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<line
						x1={lineStartX}
						y1={lineStartY}
						x2={lineEndX}
						y2={lineEndY}
						strokeWidth='1'
						strokeLinecap='round'
						className='stroke-wallet_btn_text'
					/>
				</TooltipTrigger>
				<TooltipContent className='relative rounded-md bg-gray-800 px-2 py-1 shadow-lg'>
					<p className='whitespace-nowrap text-xs font-medium text-white'>
						{t('PostDetails.threshold')}
						{`: ${approvalThreshold?.toFixed(1)}%`}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

function VoteSummary({
	voteMetrics,
	proposalType,
	index,
	approvalThreshold
}: {
	voteMetrics?: IVoteMetrics;
	proposalType: EProposalType;
	index: string;
	approvalThreshold?: number;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const [loading, setLoading] = useState(false);
	const [issuance, setIssuance] = useState<BN | null>(null);

	const { userPreferences } = useUserPreferences();

	const [tally, setTally] = useState<{ aye: string | null; nay: string | null; support: string | null }>({
		aye: null,
		nay: null,
		support: null
	});

	const getOngoingTally = useCallback(async () => {
		if (!apiService) return;

		setLoading(true);
		const ongoingReferendaTally = await apiService.getOngoingReferendaTally({ postIndex: Number(index) });
		if (!ongoingReferendaTally) {
			setTally({
				aye: voteMetrics?.[EVoteDecision.AYE].value || null,
				nay: voteMetrics?.[EVoteDecision.NAY].value || null,
				support: voteMetrics?.support?.value || null
			});
		} else {
			setTally(ongoingReferendaTally);
		}
		setLoading(false);

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
		getIssuance();
		getOngoingTally();
	}, [getOngoingTally, getIssuance]);

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

	return (
		<div className={classes.voteSummaryWrapper}>
			<p className={classes.voteSummaryTitle}>{t('PostDetails.summary')}</p>

			<div className={classes.voteSummaryPieChart}>
				{loading && <LoadingLayover />}
				<div className={classes.voteSummaryPieChartAyeNay}>
					<p className='text-xl font-semibold text-success'>{isAyeNaN ? '0' : ayePercent.toFixed(1)}%</p>
					<p className={classes.voteSummaryPieChartAyeNayTitle}>{AYE_TITLE}</p>
				</div>
				<div className='relative flex flex-col items-center justify-center'>
					{!!approvalThreshold && (
						<p className={classes.thresholdPercentage}>
							{t('PostDetails.threshold')}
							{`: ${approvalThreshold?.toFixed(1)}%`}
						</p>
					)}
					<div className='flex w-full items-center justify-center'>
						<PieChart
							className='w-full'
							center={[50, 75]}
							startAngle={-180}
							lengthAngle={180}
							rounded
							lineWidth={15}
							background={THEME_COLORS[userPreferences?.theme || 'light'].border_grey}
							data={[
								{ color: THEME_COLORS.light.aye_color, title: AYE_TITLE, value: isAyeNaN ? NONE_CHART_VALUE : ayePercent },
								{ color: THEME_COLORS.light.nay_color, title: NAY_TITLE, value: isNayNaN ? NONE_CHART_VALUE : nayPercent }
							]}
						>
							{!!approvalThreshold && <ThresholdPoint approvalThreshold={approvalThreshold} />}
						</PieChart>
					</div>
				</div>

				<div className={classes.voteSummaryPieChartAyeNay}>
					<p className='text-xl font-semibold text-failure'>{isNayNaN ? '0' : nayPercent.toFixed(1)}%</p>
					<p className={classes.voteSummaryPieChartAyeNayTitle}>{NAY_TITLE}</p>
				</div>
			</div>

			<div className={classes.voteSummaryTable}>
				<div className={classes.voteSummaryTableItem}>
					<p className={classes.voteSummaryTableItemTitle}>
						<span>
							{AYE_TITLE} ({voteMetrics?.[EVoteDecision.AYE]?.count})
						</span>
						<span>{formatUSDWithUnits(formatBnBalance(tally.aye || BN_ZERO.toString(), { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}</span>
					</p>
					<p className={classes.voteSummaryTableItemTitle}>
						<span>{t('PostDetails.support')}</span>
						<span>
							{formatUSDWithUnits(formatBnBalance(tally.support || BN_ZERO.toString(), { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}
						</span>
					</p>
				</div>
				<div className={classes.voteSummaryTableItem}>
					<p className={classes.voteSummaryTableItemTitle}>
						<span>
							{NAY_TITLE} ({voteMetrics?.[EVoteDecision.NAY]?.count})
						</span>
						<span>{formatUSDWithUnits(formatBnBalance(tally.nay || BN_ZERO.toString(), { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}</span>
					</p>
					{issuance && (
						<p className={classes.voteSummaryTableItemTitle}>
							<span>{t('PostDetails.issuance')}</span>
							<span>{formatUSDWithUnits(formatBnBalance(issuance, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, getCurrentNetwork()), 1)}</span>
						</p>
					)}
				</div>
			</div>
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
				<DialogContent className='max-w-2xl p-3 sm:p-6'>
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
