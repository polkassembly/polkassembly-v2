// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip';
import VotingBar from '@ui/ListingComponent/VotingBar/VotingBar';
import { formatBnBalance } from '@app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IPost, IPostListing } from '@/_shared/types';
import styles from './VotingMetrics.module.scss';

interface VotingMetricsProps {
	postData: IPostListing | IPost;
	ayePercent: number;
	nayPercent: number;
}

function VotingMetrics({ postData, ayePercent, nayPercent }: VotingMetricsProps) {
	const network = getCurrentNetwork();
	const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

	const formatBalance = (balance: string) => {
		return formatter.format(Number(formatBnBalance(balance, { withThousandDelimitor: false }, network)));
	};
	return (
		<>
			<span>|</span>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className='mt-1'>
						<VotingBar
							ayePercent={ayePercent}
							nayPercent={nayPercent}
						/>
					</div>
				</TooltipTrigger>
				<TooltipContent
					side='top'
					align='center'
				>
					<div className={styles.progressBarContainer}>
						<p>
							Aye = {formatBalance(postData.onChainInfo?.voteMetrics?.aye.value || '0')} ({ayePercent.toFixed(2)}%)
						</p>
						<p>
							Nay = {formatBalance(postData.onChainInfo?.voteMetrics?.nay.value || '0')} ({nayPercent.toFixed(2)}%)
						</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</>
	);
}
export default VotingMetrics;
