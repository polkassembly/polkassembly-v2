// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EPostOrigin, EProposalType, EVoteDecision, IStatusHistoryItem, IVoteMetrics } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { PieChart } from 'react-minimal-pie-chart';
import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import Image from 'next/image';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import { THEME_COLORS } from '@/app/_style/theme';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { dayjs } from '@shared/_utils/dayjsInit';
import { blockToTime } from '@/_shared/_utils/blockToTime';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { calculateThresholdValue, processGraphPoint } from '@/app/_client-utils/calculateThresholdValue';
import classes from './VoteSummary.module.scss';
import { Button } from '../../Button';
import VoteHistory from './VoteHistory/VoteHistory';
import { Skeleton } from '../../Skeleton';

const NONE_CHART_VALUE = 0;

interface IProgress {
	approval: number;
	approvalThreshold: number;
	support: number;
	supportThreshold: number;
}

function VoteSummary({
	voteMetrics,
	proposalType,
	index,
	statusHistory,
	createdAt,
	trackName
}: {
	voteMetrics?: IVoteMetrics;
	proposalType: EProposalType;
	index: string;
	statusHistory: IStatusHistoryItem[];
	createdAt?: Date;
	trackName?: EPostOrigin;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const [loading, setLoading] = useState(true);
	const [issuance, setIssuance] = useState<BN | null>(null);
	const [progress, setProgress] = useState<IProgress>({
		approval: 0,
		approvalThreshold: 0,
		support: 0,
		supportThreshold: 0
	});

	const [tally, setTally] = useState<{ aye: string | null; nay: string | null; support: string | null }>({
		aye: null,
		nay: null,
		support: null
	});

	const getVoteCurves = useCallback(async () => {
		try {
			if (!trackName) return [];

			const voteCurves = await NextApiClientService.getVoteCurves({ proposalType, index });
			const graphPoints = voteCurves?.data || [];
			if (graphPoints.length === 0) return [];

			const decisionPeriod = NETWORKS_DETAILS[network]?.trackDetails?.[trackName]?.decisionPeriod;
			const statusBlock = statusHistory?.find((s) => s?.status === 'Deciding');
			const { seconds } = blockToTime(decisionPeriod || 0, network);
			const decisionPeriodHrs = Math.ceil(dayjs.duration(seconds, 'seconds').asHours());

			const proposalCreatedAt = dayjs(statusBlock?.timestamp || createdAt);
			const lastGraphPoint = graphPoints[graphPoints.length - 1];
			if (!lastGraphPoint) return [];

			const elapsedHours = dayjs(lastGraphPoint.timestamp).diff(proposalCreatedAt, 'hour');

			const currentData = graphPoints.map((point) => processGraphPoint(point, proposalCreatedAt, elapsedHours, decisionPeriodHrs, network, trackName));

			const currentApproval = currentData[currentData.length - 1]?.approval;
			const currentSupport = currentData[currentData.length - 1]?.support;

			const progressData: IProgress = {
				approval: Number(currentApproval?.y?.toFixed(1) || 0),
				approvalThreshold: calculateThresholdValue(trackName, network, currentApproval, decisionPeriodHrs),
				support: Number(currentSupport?.y?.toFixed(1) || 0),
				supportThreshold: calculateThresholdValue(trackName, network, currentSupport, decisionPeriodHrs)
			};

			setProgress(progressData);
			return graphPoints;
		} catch (error) {
			console.error('Error fetching vote curves:', error);
			return [];
		}
	}, [proposalType, index, trackName, network, statusHistory, createdAt]);

	useEffect(() => {
		getVoteCurves();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	return (
		<div className={classes.voteSummaryWrapper}>
			<p className={classes.voteSummaryTitle}>{t('PostDetails.summary')}</p>
			{loading ? (
				<Skeleton className='h-[220px] w-full' />
			) : tally?.aye && tally?.nay && tally?.support && progress.approvalThreshold > 0 ? (
				<>
					<div className={classes.voteSummaryPieChart}>
						<div className={classes.voteSummaryPieChartAyeNay}>
							<p className='text-xl font-semibold text-success'>{isAyeNaN ? 'N/A' : ayePercent.toFixed(1)}%</p>
							<p className={classes.voteSummaryPieChartAyeNayTitle}>{AYE_TITLE}</p>
						</div>
						<div className='relative'>
							<PieChart
								className='w-full'
								center={[50, 75]}
								startAngle={-180}
								lengthAngle={180}
								rounded
								lineWidth={15}
								data={[
									{ color: THEME_COLORS.light.aye_color, title: AYE_TITLE, value: isAyeNaN ? NONE_CHART_VALUE : ayePercent },
									{ color: THEME_COLORS.light.nay_color, title: NAY_TITLE, value: isNayNaN ? NONE_CHART_VALUE : nayPercent }
								]}
								segmentsStyle={{ transition: 'stroke .3s' }}
							/>
							<div className='absolute inset-0'>
								{(() => {
									const centerX = 75;
									const centerY = 103;
									const arcRadius = 65;
									const labelRadius = arcRadius + 18;
									const angle = -180 + (180 * progress.approvalThreshold) / 100;
									const radians = (angle * Math.PI) / 180;

									const labelX = centerX + labelRadius * Math.cos(radians);
									const labelY = centerY + labelRadius * Math.sin(radians);

									return (
										<>
											<div
												className='absolute h-[2px] w-[15px] bg-wallet_btn_text'
												style={{
													left: `${centerX}px`,
													top: `${centerY}px`,
													transform: `rotate(${angle}deg) translateX(${arcRadius}px)`,
													transformOrigin: 'left center'
												}}
											/>
											<div
												className='absolute whitespace-nowrap text-xs font-medium'
												style={{
													left: `${labelX}px`,
													top: `${labelY}px`,
													transform: 'translate(-50%, -100%)'
												}}
											>
												{progress.approvalThreshold.toFixed(1)}%
											</div>
										</>
									);
								})()}
							</div>
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
