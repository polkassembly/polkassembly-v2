// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

// import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN } from '@polkadot/util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
// import VotingPowerChart from '@assets/profile/voting-power-chart.svg';
import classes from './VotingPowerCard.module.scss';

interface VotingPowerData {
	total: BN;
	self: BN;
	delegated: BN;
}

interface VotingPowerCardProps {
	votingPowerData: VotingPowerData;
}

function VotingPowerCard({ votingPowerData }: VotingPowerCardProps) {
	const network = getCurrentNetwork();
	const { tokenSymbol } = NETWORKS_DETAILS[network];

	return (
		<div className={cn(classes.statCard, classes.votingPowerCard)}>
			{/* <div className='flex justify-center lg:justify-start'>
				<Image
					src={VotingPowerChart}
					alt='Voting Power'
					width={89}
					height={20}
					className='mb-2'
				/>
			</div> */}
			<div className={classes.votingPowerBreakdown}>
				<div className={classes.votingPowerItem}>
					<div className={classes.votingPowerLabel}>
						<span>Voting Power</span>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className={classes.infoIcon}>?</div>
							</TooltipTrigger>
							<TooltipContent className='max-w-xs bg-tooltip_background p-2 text-white'>
								<p>Total DOT you can use to vote on proposals — includes your own tokens plus any delegated to you by others.</p>
							</TooltipContent>
						</Tooltip>
					</div>
					<div className={classes.votingPowerValue}>
						<span className={classes.value}>
							{formatBnBalance(votingPowerData.total, { withThousandDelimitor: false, withUnit: false, numberAfterComma: 1, compactNotation: true }, network)}
						</span>
						<span className={classes.unit}>{tokenSymbol}</span>
					</div>
				</div>
				<div className={classes.divider} />
				<div className={classes.votingPowerItem}>
					<div className={classes.votingPowerLabel}>
						<span>Self</span>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className={classes.infoIcon}>?</div>
							</TooltipTrigger>
							<TooltipContent className='max-w-xs bg-tooltip_background p-2 text-white'>
								<p>The amount of DOT you personally control and are using for on-chain voting (without delegation).</p>
							</TooltipContent>
						</Tooltip>
					</div>
					<div className={classes.votingPowerValue}>
						<span className={classes.value}>
							{formatBnBalance(votingPowerData.self, { withThousandDelimitor: false, withUnit: false, numberAfterComma: 1, compactNotation: true }, network)}
						</span>
						<span className={classes.unit}>{tokenSymbol}</span>
					</div>
				</div>
				<div className={classes.divider} />
				<div className={classes.votingPowerItem}>
					<div className={classes.votingPowerLabel}>
						<span>Delegated</span>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className={classes.infoIcon}>?</div>
							</TooltipTrigger>
							<TooltipContent className='max-w-xs bg-tooltip_background p-2 text-white'>
								<p>The DOT that others have delegated to you, giving you the power to vote on their behalf.</p>
							</TooltipContent>
						</Tooltip>
					</div>
					<div className={classes.votingPowerValue}>
						<span className={classes.value}>
							{formatBnBalance(votingPowerData.delegated, { withThousandDelimitor: false, withUnit: false, numberAfterComma: 1, compactNotation: true }, network)}
						</span>
						<span className={classes.unit}>{tokenSymbol}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default VotingPowerCard;
