// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EProposalType, EVoteDecision, IVoteMetrics } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { PieChart } from 'react-minimal-pie-chart';
import { BN } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@ui/Dialog/Dialog';
import classes from './VoteSummary.module.scss';
import { Button } from '../../Button';
import VoteHistory from './VoteHistory/VoteHistory';

function VoteSummary({ voteMetrics, proposalType, index }: { voteMetrics?: IVoteMetrics; proposalType: EProposalType; index: string }) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	if (!voteMetrics) return null;
	const ayeVotesNumber =
		voteMetrics[EVoteDecision.AYE].count === undefined
			? Number(formatBnBalance(voteMetrics[EVoteDecision.AYE].value, { numberAfterComma: 6, withThousandDelimitor: false }, network))
			: Number(voteMetrics[EVoteDecision.AYE].count);
	const totalVotesNumber =
		voteMetrics[EVoteDecision.AYE].count === undefined || voteMetrics[EVoteDecision.NAY].count === undefined
			? Number(
					formatBnBalance(
						new BN(voteMetrics[EVoteDecision.AYE].value).add(new BN(voteMetrics[EVoteDecision.NAY].value)),
						{ numberAfterComma: 6, withThousandDelimitor: false },
						network
					)
				)
			: Number(voteMetrics[EVoteDecision.AYE].count) + Number(voteMetrics[EVoteDecision.NAY].count);

	const ayePercent = (ayeVotesNumber / totalVotesNumber) * 100;
	const nayPercent = 100 - ayePercent;
	const isAyeNaN = isNaN(ayePercent);
	const isNayNaN = isNaN(nayPercent);

	return (
		<div className={classes.voteSummaryWrapper}>
			<p className={classes.voteSummaryTitle}>{t('PostDetails.summary')}</p>
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
						<span>
							{formatUSDWithUnits(formatBnBalance(voteMetrics[EVoteDecision.AYE].value, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}
						</span>
					</p>
					<p className={classes.voteSummaryTableItemTitle}>
						<span>{t('PostDetails.support')}</span>
						<span>{formatUSDWithUnits(formatBnBalance(voteMetrics.support.value, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}</span>
					</p>
				</div>
				<div className={classes.voteSummaryTableItem}>
					<p className={classes.voteSummaryTableItemTitle}>
						<span>
							{t('PostDetails.nay')} ({voteMetrics[EVoteDecision.NAY].count})
						</span>
						<span>
							{formatUSDWithUnits(formatBnBalance(voteMetrics[EVoteDecision.NAY].value, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}
						</span>
					</p>
					<p className={classes.voteSummaryTableItemTitle}>
						<span>{t('PostDetails.bareAyes')}</span>
						<span>
							{formatUSDWithUnits(formatBnBalance(voteMetrics.bareAyes.value, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, getCurrentNetwork()), 1)}
						</span>
					</p>
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
				<DialogContent className='max-w-xl'>
					<DialogHeader className='text-xl font-semibold text-text_primary'>{t('PostDetails.voteHistory')}</DialogHeader>
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
