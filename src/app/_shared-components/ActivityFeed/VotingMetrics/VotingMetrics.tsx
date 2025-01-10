// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/Tooltip';
import VotingBar from '@ui/ListingComponent/VotingBar/VotingBar';
import { formatUSDWithUnits } from '@app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@app/_client-utils/formatBnBalance';
import { IPostListing } from '@/_shared/types';
import styles from './VotingMetrics.module.scss';

interface VotingMetricsProps {
	postData: IPostListing;
	ayePercent: number;
	nayPercent: number;
}

function VotingMetrics({ postData, ayePercent, nayPercent }: VotingMetricsProps) {
	return (
		<>
			<span>|</span>
			<Tooltip>
				<TooltipTrigger asChild>
					<div>
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
							Aye ={' '}
							{formatUSDWithUnits(
								formatBnBalance(postData.onChainInfo?.voteMetrics?.aye.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, postData.network)
							)}{' '}
							({ayePercent.toFixed(2)}%)
						</p>
						<p>
							Nay ={' '}
							{formatUSDWithUnits(
								formatBnBalance(postData.onChainInfo?.voteMetrics?.nay.value || '0', { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, postData.network)
							)}{' '}
							({nayPercent.toFixed(2)}%)
						</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</>
	);
}

export default VotingMetrics;
