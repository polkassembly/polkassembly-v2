// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN } from '@polkadot/util';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import classes from './BalanceCard.module.scss';

interface BalanceCardProps {
	availableBalance: BN;
	delegatedBalance: BN;
	isLoading?: boolean;
}

function BalanceCard({ availableBalance, delegatedBalance, isLoading }: BalanceCardProps) {
	const network = getCurrentNetwork();
	const t = useTranslations();
	const { tokenSymbol } = NETWORKS_DETAILS[network];

	return (
		<>
			<div className={classes.statCard}>
				<div className={classes.statCardHeader}>
					<span className={classes.statCardTitle}>{t('Profile.available')}</span>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className={classes.infoIcon}>?</div>
						</TooltipTrigger>
						<TooltipContent className='max-w-xs bg-tooltip_background p-2 text-white'>
							<p>{t('Profile.availableBalanceText')}</p>
						</TooltipContent>
					</Tooltip>
				</div>
				{isLoading ? (
					<Skeleton className='h-8 w-full' />
				) : (
					<div className={classes.statCardValue}>
						<span className={classes.value}>
							{formatBnBalance(availableBalance, { withThousandDelimitor: false, withUnit: false, numberAfterComma: 2, compactNotation: true }, network)}
						</span>
						<span className={classes.unit}>{tokenSymbol}</span>
					</div>
				)}
			</div>
			<div className={classes.statCard}>
				<div className={classes.statCardHeader}>
					<span className={classes.statCardTitle}>{t('Profile.delegated')}</span>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className={classes.infoIcon}>?</div>
						</TooltipTrigger>
						<TooltipContent className='max-w-xs bg-tooltip_background p-2 text-white'>
							<p>{t('Profile.delegatedBalanceText')}</p>
						</TooltipContent>
					</Tooltip>
				</div>
				{isLoading ? (
					<Skeleton className='h-8 w-full' />
				) : (
					<div className={classes.statCardValue}>
						<span className={classes.value}>
							{formatBnBalance(delegatedBalance, { withThousandDelimitor: false, withUnit: false, numberAfterComma: 2, compactNotation: true }, network)}
						</span>
						<span className={classes.unit}>{tokenSymbol}</span>
					</div>
				)}
			</div>
		</>
	);
}

export default BalanceCard;
