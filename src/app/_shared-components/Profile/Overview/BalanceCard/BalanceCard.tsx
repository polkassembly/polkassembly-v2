// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import AvailableBalanceChart from '@assets/profile/available-balance-chart.svg';
import DelegatedBalanceChart from '@assets/profile/delegated-balance-chart.svg';
import Image from 'next/image';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN } from '@polkadot/util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import classes from './BalanceCard.module.scss';

interface BalanceCardProps {
	availableBalance: BN;
	delegatedBalance: BN;
}

function BalanceCard({ availableBalance, delegatedBalance }: BalanceCardProps) {
	const network = getCurrentNetwork();
	const { tokenSymbol } = NETWORKS_DETAILS[network];

	return (
		<>
			<div className={classes.statCard}>
				<Image
					src={AvailableBalanceChart}
					alt='Available Balance'
					width={62}
					height={20}
					className='mb-2'
				/>
				<div className={classes.statCardHeader}>
					<span className={classes.statCardTitle}>Available</span>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className={classes.infoIcon}>?</div>
						</TooltipTrigger>
						<TooltipContent className='max-w-xs bg-tooltip_background p-2 text-white'>
							<p>The DOT in your wallet that&apos;s currently not locked or delegated — it&apos;s free to be used for voting or staking.</p>
						</TooltipContent>
					</Tooltip>
				</div>
				<div className={classes.statCardValue}>
					<span className={classes.value}>
						{formatBnBalance(availableBalance, { withThousandDelimitor: false, withUnit: false, numberAfterComma: 1, compactNotation: true }, network)}
					</span>
					<span className={classes.unit}>{tokenSymbol}</span>
				</div>
			</div>
			<div className={classes.statCard}>
				<Image
					src={DelegatedBalanceChart}
					alt='Delegated Balance'
					width={62}
					height={20}
					className='mb-2'
				/>
				<div className={classes.statCardHeader}>
					<span className={classes.statCardTitle}>Delegated</span>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className={classes.infoIcon}>?</div>
						</TooltipTrigger>
						<TooltipContent className='max-w-xs bg-tooltip_background p-2 text-white'>
							<p>The amount of DOT you&apos;ve delegated to someone else to vote on your behalf.</p>
						</TooltipContent>
					</Tooltip>
				</div>
				<div className={classes.statCardValue}>
					<span className={classes.value}>
						{formatBnBalance(delegatedBalance, { withThousandDelimitor: false, withUnit: false, numberAfterComma: 1, compactNotation: true }, network)}
					</span>
					<span className={classes.unit}>{tokenSymbol}</span>
				</div>
			</div>
		</>
	);
}

export default BalanceCard;
