// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EDelegationStatus, ITrackDelegationDetails } from '@/_shared/types';
import { MdKeyboardArrowRight } from '@react-icons/all-files/md/MdKeyboardArrowRight';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import styles from './DelegationTrack.module.scss';
import { DelegationHeader } from '../DelegationHeader';
import { DelegationContent } from '../DelegationContent';
import { ActiveProposals } from '../ActiveProposals';

interface DelegationTrackProps {
	trackDetails: {
		description: string;
		trackId: number;
		name: string;
	};
	delegateTrackResponse: ITrackDelegationDetails;
}

function DelegationTrack({ trackDetails, delegateTrackResponse }: DelegationTrackProps) {
	const t = useTranslations('Delegation');
	const trackDescription = trackDetails?.description;
	const trackId = trackDetails?.trackId;

	const isReceived = delegateTrackResponse?.status === EDelegationStatus.RECEIVED;
	const activeProposals = delegateTrackResponse?.activeProposalListingWithDelegateVote?.items || [];
	const trackName = trackDetails.name
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');

	return (
		<div>
			<div className={styles.delegationTrackContainer}>
				<Link
					href='/delegation'
					className='cursor-pointer text-sm'
				>
					{t('dashboard')}
				</Link>
				<span className='mt-[-2px]'>
					<MdKeyboardArrowRight className='text-sm' />
				</span>
				<span className={styles.delegationName}>{trackName}</span>
			</div>

			<div className={styles.trackInfoContainer}>
				<div>
					<DelegationHeader
						trackName={trackName}
						trackDescription={trackDescription}
						trackId={trackId}
						isReceived={isReceived}
					/>
				</div>

				<div className={styles.contentContainer}>
					<DelegationContent
						isReceived={isReceived}
						delegateTrackResponse={delegateTrackResponse}
						trackId={trackId}
						trackName={trackName}
					/>
				</div>
			</div>

			<ActiveProposals activeProposals={activeProposals} />
		</div>
	);
}

export default DelegationTrack;
