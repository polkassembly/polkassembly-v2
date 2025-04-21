// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { delegateUserTracksAtom } from '@/app/_atoms/delegation/delegationAtom';
import { EDelegationStatus } from '@/_shared/types';
import styles from './DelegationTrack/DelegationTrack.module.scss';

interface DelegationHeaderProps {
	trackName: string;
	trackDescription: string;
	trackId: number;
	isReceived: boolean;
}

export function DelegationHeader({ trackName, trackDescription, trackId, isReceived }: DelegationHeaderProps) {
	const [delegateUserTracks] = useAtom(delegateUserTracksAtom);
	const currentTrackStatus = delegateUserTracks?.find((track) => track.trackId === trackId)?.status;
	const isDelegated = currentTrackStatus === EDelegationStatus.DELEGATED;

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
