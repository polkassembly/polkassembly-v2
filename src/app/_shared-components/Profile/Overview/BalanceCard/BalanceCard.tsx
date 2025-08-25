// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Wallet, Users } from 'lucide-react';
import classes from './BalanceCard.module.scss';

interface BalanceCardProps {
	availableBalance: number;
	delegatedBalance: number;
}

function BalanceCard({ availableBalance, delegatedBalance }: BalanceCardProps) {
	return (
		<>
			<div className={classes.statCard}>
				<div className={classes.statCardHeader}>
					<Wallet className={classes.statCardIcon} />
					<span className={classes.statCardTitle}>Available</span>
				</div>
				<div className={classes.statCardValue}>
					<span className={classes.value}>{availableBalance.toFixed(1)}</span>
					<span className={classes.unit}>DOT</span>
				</div>
			</div>
			<div className={classes.statCard}>
				<div className={classes.statCardHeader}>
					<Users className={classes.statCardIcon} />
					<span className={classes.statCardTitle}>Delegated</span>
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
