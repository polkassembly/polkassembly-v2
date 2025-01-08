// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EVoteDecision, IVoteMetrics } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { PieChart } from 'react-minimal-pie-chart';
import React from 'react';
import { BN } from '@polkadot/util';

function VoteSummary({ voteMetrics }: { voteMetrics?: IVoteMetrics }) {
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
		<div className='flex flex-col rounded-xl bg-bg_modal p-6 shadow-lg'>
			<p className='text-xl font-semibold text-text_primary'>Summary</p>
			<div className='mb-6 flex items-end justify-center gap-x-4'>
				<div className='mb-8 flex flex-col gap-y-1'>
					<p className='text-xl font-semibold text-success'>{isAyeNaN ? 50 : ayePercent.toFixed(1)}%</p>
					<p className='text-xs font-medium text-wallet_btn_text'>Aye</p>
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

				<div className='mb-8 flex flex-col gap-y-1'>
					<p className='text-xl font-semibold text-failure'>{isNayNaN ? 50 : nayPercent.toFixed(1)}%</p>
					<p className='text-xs font-medium text-wallet_btn_text'>Nay</p>
				</div>
			</div>
			<div className='grid grid-cols-2 gap-4 text-xs text-wallet_btn_text'>
				<div className='col-span-1 flex flex-col gap-y-2'>
					<p className='flex items-center justify-between capitalize'>
						<span>
							{EVoteDecision.AYE} ({voteMetrics[EVoteDecision.AYE].count})
						</span>
						<span>
							{formatUSDWithUnits(
								formatBnBalance(voteMetrics[EVoteDecision.AYE].value, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, getCurrentNetwork()),
								1
							)}
						</span>
					</p>
					<p className='flex items-center justify-between capitalize'>
						<span>Support</span>
						<span>
							{formatUSDWithUnits(formatBnBalance(voteMetrics.support.value, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, getCurrentNetwork()), 1)}
						</span>
					</p>
				</div>
				<div className='col-span-1 flex flex-col gap-y-2'>
					<p className='flex items-center justify-between capitalize'>
						<span>
							{EVoteDecision.NAY} ({voteMetrics[EVoteDecision.NAY].count})
						</span>
						<span>
							{formatUSDWithUnits(
								formatBnBalance(voteMetrics[EVoteDecision.NAY].value, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, getCurrentNetwork()),
								1
							)}
						</span>
					</p>
					<p className='flex items-center justify-between capitalize'>
						<span>Bare Ayes</span>
						<span>
							{formatUSDWithUnits(formatBnBalance(voteMetrics.bareAyes.value, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, getCurrentNetwork()), 1)}
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}

export default VoteSummary;
