// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import AvailableBalanceChart from '@assets/profile/available-balance-chart.svg';
import DelegatedBalanceChart from '@assets/profile/delegated-balance-chart.svg';
import Image from 'next/image';
import classes from './BalanceCard.module.scss';

interface BalanceCardProps {
	availableBalance: number;
	delegatedBalance: number;
}

function BalanceCard({ availableBalance, delegatedBalance }: BalanceCardProps) {
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
					<div className={classes.infoIcon}>?</div>
				</div>
				<div className={classes.statCardValue}>
					<span className={classes.value}>{availableBalance.toFixed(1)}</span>
					<span className={classes.unit}>DOT</span>
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
					<div className={classes.infoIcon}>?</div>
				</div>
				<div className={classes.statCardValue}>
					<span className={classes.value}>{delegatedBalance.toFixed(1)}</span>
					<span className={classes.unit}>DOT</span>
				</div>
			</div>
		</>
	);
}

export default BalanceCard;
