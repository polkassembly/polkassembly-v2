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
import classes from './VoteSummary.module.scss';
import { Button } from '../../Button';
import VoteHistory from './VoteHistory/VoteHistory';
import { Skeleton } from '../../Skeleton';

function VoteSummary({ voteMetrics, proposalType, index }: { voteMetrics?: IVoteMetrics; proposalType: EProposalType; index: string }) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const [loading, setLoading] = useState(false);
	const [issuance, setIssuance] = useState<BN | null>(null);

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
				aye: voteMetrics?.[EVoteDecision.AYE].value || '0',
				nay: voteMetrics?.[EVoteDecision.NAY].value || '0',
				support: voteMetrics?.support?.value || '0'
			});
			setLoading(false);
		} else {
			setTally(ongoingReferendaTally);
			setLoading(false);
		}
	}, [apiService, index, voteMetrics]);

	const getIssuance = useCallback(async () => {
		if (!apiService) return;
		const totalIssuance = await apiService?.getTotalIssuance();
		const inactiveIssuance = await apiService?.getInactiveIssuance();
		const totalIssuanceBN = new BN(totalIssuance?.toString() || '0');
		const inactiveIssuanceBN = new BN(inactiveIssuance?.toString() || '0');
		setIssuance(totalIssuanceBN.sub(inactiveIssuanceBN));
	}, [apiService]);

	useEffect(() => {
		if (!voteMetrics) return;
		getIssuance();
		getOngoingTally();
	}, [getOngoingTally, getIssuance, voteMetrics]);

	if (!voteMetrics) return null;

	const ayeVotesNumber = Number(formatBnBalance(tally.aye || '0', { numberAfterComma: 6, withThousandDelimitor: false }, network));
	const totalVotesNumber = Number(formatBnBalance(new BN(tally.aye || '0').add(new BN(tally.nay || '0')), { numberAfterComma: 6, withThousandDelimitor: false }, network));

	const ayePercent = (ayeVotesNumber / totalVotesNumber) * 100;
	const nayPercent = 100 - ayePercent;
	const isAyeNaN = !ValidatorService.isValidNumber(ayePercent);
	const isNayNaN = !ValidatorService.isValidNumber(nayPercent);

	return (
		<div className={classes.voteSummaryWrapper}>
			<p className={classes.voteSummaryTitle}>{t('PostDetails.summary')}</p>
			{loading || !tally.aye || !tally.nay ? (
				<Skeleton className='h-[220px] w-full' />
			) : (
				<>
					<div className={classes.voteSummaryPieChart}>
						<div className={classes.voteSummaryPieChartAyeNay}>
							<p className='text-xl font-semibold text-success'>{isAyeNaN ? 50 : ayePercent.toFixed(1)}%</p>
							<p className={classes.voteSummaryPieChartAyeNayTitle}>{t('PostDetails.aye')}</p>
						</div>
						<PieChart
							className='w-[47%] xl:w-[49%]'
							center={[50, 75]}
							startAngle={-180}
							lengthAngle={180}
							rounded
							lineWidth={15}
							data={[
								{ color: '#6DE1A2', title: 'Aye', value: isAyeNaN ? 50 : ayePercent },
								{ color: '#FF778F', title: 'Nay', value: isNayNaN ? 50 : nayPercent }
							]}
						/>

						<div className={classes.voteSummaryPieChartAyeNay}>
							<p className='text-xl font-semibold text-failure'>{isNayNaN ? 50 : nayPercent.toFixed(1)}%</p>
							<p className={classes.voteSummaryPieChartAyeNayTitle}>{t('PostDetails.nay')}</p>
						</div>
					</div>
					<div className={classes.voteSummaryTable}>
						<div className={classes.voteSummaryTableItem}>
							<p className={classes.voteSummaryTableItemTitle}>
								<span>
									{t('PostDetails.aye')} ({voteMetrics[EVoteDecision.AYE].count})
								</span>
								<span>{formatUSDWithUnits(formatBnBalance(tally.aye || '0', { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}</span>
							</p>
							<p className={classes.voteSummaryTableItemTitle}>
								<span>{t('PostDetails.support')}</span>
								<span>{formatUSDWithUnits(formatBnBalance(tally.support || '0', { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}</span>
							</p>
						</div>
						<div className={classes.voteSummaryTableItem}>
							<p className={classes.voteSummaryTableItemTitle}>
								<span>
									{t('PostDetails.nay')} ({voteMetrics[EVoteDecision.NAY].count})
								</span>
								<span>{formatUSDWithUnits(formatBnBalance(tally.nay || '0', { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}</span>
							</p>
							<p className={classes.voteSummaryTableItemTitle}>
								<span>{t('PostDetails.issuance')}</span>
								<span>
									{formatUSDWithUnits(
										formatBnBalance(issuance || BN_ZERO?.toString(), { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, getCurrentNetwork()),
										1
									)}
								</span>
							</p>
						</div>
					</div>
				</>
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
				<DialogContent className='max-w-xl p-6'>
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
