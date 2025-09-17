// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { cn } from '@/lib/utils';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN } from '@polkadot/util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import classes from './VotingPowerCard.module.scss';

interface VotingPowerData {
	total: BN;
	self: BN;
	delegated: BN;
}

interface VotingPowerCardProps {
	votingPowerData: VotingPowerData;
	isProfileOwner?: boolean;
}

function VotingPowerCard({ votingPowerData, isProfileOwner }: VotingPowerCardProps) {
	const network = getCurrentNetwork();
	const { tokenSymbol } = NETWORKS_DETAILS[network];

	return (
		<div className={cn(classes.statCard, !isProfileOwner ? classes.spanFour : classes.votingPowerCard)}>
			<div className={cn(classes.votingPowerBreakdown, !isProfileOwner ? 'lg:justify-around' : '')}>
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
