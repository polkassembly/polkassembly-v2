// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import classes from './VotingPowerCard.module.scss';

interface VotingPowerData {
	total: number;
	self: number;
	delegated: number;
}

interface VotingPowerCardProps {
	votingPowerData: VotingPowerData;
}

function VotingPowerCard({ votingPowerData }: VotingPowerCardProps) {
	return (
		<div className={cn(classes.statCard, classes.votingPowerCard)}>
			<div className={classes.statCardHeader}>
				<BarChart3 className={classes.statCardIcon} />
				<span className={classes.statCardTitle}>Voting Power</span>
			</div>
			<div className={classes.votingPowerBreakdown}>
				<div className={classes.votingPowerItem}>
					<div className={classes.votingPowerLabel}>
						<span>Voting Power</span>
						<div className={classes.infoIcon}>i</div>
					</div>
					<div className={classes.votingPowerValue}>
						<span className={classes.value}>{votingPowerData.total.toFixed(1)}</span>
						<span className={classes.unit}>DOT</span>
					</div>
				</div>
				<div className={classes.divider} />
				<div className={classes.votingPowerItem}>
					<div className={classes.votingPowerLabel}>
						<span>Self</span>
						<div className={classes.infoIcon}>i</div>
					</div>
					<div className={classes.votingPowerValue}>
						<span className={classes.value}>{votingPowerData.self.toFixed(1)}</span>
						<span className={classes.unit}>DOT</span>
					</div>
				</div>
				<div className={classes.divider} />
				<div className={classes.votingPowerItem}>
					<div className={classes.votingPowerLabel}>
						<span>Delegated</span>
						<div className={classes.infoIcon}>i</div>
					</div>
					<div className={classes.votingPowerValue}>
						<span className={classes.value}>{votingPowerData.delegated.toFixed(1)}</span>
						<span className={classes.unit}>DOT</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default VotingPowerCard;
