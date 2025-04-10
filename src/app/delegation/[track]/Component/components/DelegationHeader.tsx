// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { cn } from '@/lib/utils';
import styles from '../DelegationTrack.module.scss';

interface DelegationHeaderProps {
	trackName: string;
	trackDescription: string;
	isDelegated: boolean;
	isReceived: boolean;
}

export function DelegationHeader({ trackName, trackDescription, isDelegated, isReceived }: DelegationHeaderProps) {
	return (
		<>
			<div className={styles.trackHeader}>
				<p className={styles.delegationTrackName}>{trackName}</p>
				<span className={cn(styles.statusBadge, isDelegated && styles.delegatedBadge, isReceived && styles.receivedBadge, !isDelegated && !isReceived && styles.undelegatedBadge)}>
					{isDelegated ? 'Delegated' : isReceived ? 'Received' : 'Undelegated'}
				</span>
			</div>
			<p className={styles.trackDescription}>{trackDescription}</p>
		</>
	);
}
