// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ITrackDelegationDetails, EDelegationStatus } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { IoPersonAdd } from '@react-icons/all-files/io5/IoPersonAdd';
import { IoPersonRemove } from '@react-icons/all-files/io5/IoPersonRemove';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import UndelegatedTrack from '@assets/delegation/undelegated.svg';
import half from '@assets/delegation/half-time-left-clock.svg';
import onethird from '@assets/delegation/one-third-time-left-clock.svg';
import threefourth from '@assets/delegation/three-forth-time-left-clock.svg';
import whole from '@assets/delegation/whole-time-left-clock.svg';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { useTranslations } from 'next-intl';
import { useAtom } from 'jotai';
import { delegateUserTracksAtom } from '@/app/_atoms/delegation/delegationAtom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/_shared-components/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import DelegateVotingPower from '@/app/_shared-components/DelegateVotingPower/DelegateVotingPower';
import UndelegateDialog from '../../Components/UndelegateDialog/UndelegateDialog';
import styles from './DelegationTrack/DelegationTrack.module.scss';

const getIconForUndelegationTimeLeft = (percentage: number) => {
	if (percentage >= 75) {
		return whole;
	}
	if (percentage < 75 && percentage >= 50) {
		return threefourth;
	}
	if (percentage < 50 && percentage >= 25) {
		return half;
	}
	return onethird;
};

const getDelegationProgress = (createdAt: Date, endsAt: Date) => {
	const now = new Date();
	const start = new Date(createdAt);
	const end = new Date(endsAt);

	const totalDuration = end.getTime() - start.getTime();
	const elapsedDuration = now.getTime() - start.getTime();
	return Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100);
};

interface DelegationContentProps {
	isReceived: boolean;
	delegateTrackResponse: ITrackDelegationDetails;
	trackId: number;
	trackName: string;
}

export function DelegationContent({ isReceived, delegateTrackResponse, trackId, trackName }: DelegationContentProps) {
	const network = getCurrentNetwork();
	const t = useTranslations('Delegation');
	const [openUndelegateAddresses, setOpenUndelegateAddresses] = useState<Record<string, boolean>>({});
	const [delegateUserTracks] = useAtom(delegateUserTracksAtom);
	const [trackData, setTrackData] = useState<ITrackDelegationDetails | null>(delegateTrackResponse);

	const currentTrackStatus = delegateUserTracks?.find((track) => track.trackId === trackId)?.status;
	const isDelegated = currentTrackStatus === EDelegationStatus.DELEGATED || trackData?.status === EDelegationStatus.DELEGATED;

	const hasTrackData =
		trackData && ((isReceived && Array.isArray(trackData.receivedDelegations)) || (!isReceived && Array.isArray(trackData.delegatedTo) && trackData.delegatedTo.length > 0));

	useEffect(() => {
		if (delegateTrackResponse) {
			setTrackData(delegateTrackResponse);
		}
	}, [delegateTrackResponse]);

	const handleOpenUndelegate = (address: string, isOpen: boolean) => {
		setOpenUndelegateAddresses((prev) => ({ ...prev, [address]: isOpen }));
	};

	const handleUndelegateSuccess = (address: string) => {
		if (trackData) {
			setTrackData({
				...trackData,
				delegatedTo: trackData.delegatedTo?.filter((d) => d.address !== address) || []
			});
		}
	};

	const renderDelegationTable = () => {
		const delegations = isReceived ? trackData?.receivedDelegations : trackData?.delegatedTo;
		if (!Array.isArray(delegations)) return null;

		return (
			<div className={styles.tableContainer}>
				<Table className={styles.delegationTable}>
					<TableHeader>
						<TableRow className={styles.tableHeader}>
							<TableHead className={cn(styles.tableHeaderCell, 'px-6')}>#</TableHead>
							<TableHead className={styles.addressCell}>{isReceived ? 'Delegated by' : 'Delegated to'}</TableHead>
							<TableHead className={styles.tableHeaderCell}>{t('balance')}</TableHead>
							<TableHead className={styles.tableHeaderCell}>{t('conviction')}</TableHead>
							<TableHead className={styles.tableHeaderCell}>{t('delegatedOn')}</TableHead>
							{!isReceived && <TableHead className={styles.tableHeaderCell}>{t('action')}</TableHead>}
						</TableRow>
					</TableHeader>
					<TableBody>
						{delegations.map((delegation, index) => (
							<TableRow key={delegation.address}>
								<TableCell className='p-6'>{index + 1}</TableCell>
								<TableCell className={styles.addressCell}>
									<Address address={delegation.address} />
								</TableCell>
								<TableCell className='p-6'>{formatBnBalance(delegation.balance, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}</TableCell>
								<TableCell className='p-6'>{delegation.lockPeriod}x </TableCell>
								<TableCell className='p-6'>
									<div className='flex items-center gap-2'>
										<span>{dayjs(delegation.createdAt).format('DD MMM YYYY')}</span>
										{delegation.lockPeriod > 0 && (
											<Tooltip>
												<TooltipTrigger asChild>
													<Image
														src={getIconForUndelegationTimeLeft(getDelegationProgress(delegation.createdAt, delegation.endsAt))}
														alt='delegation-progress'
														width={24}
														height={24}
													/>
												</TooltipTrigger>
												<TooltipContent className={cn(styles.tooltipContent, 'bg-tooltip_background text-btn_primary_text')}>
													<p>{`${t('youCanUndelegateAfter')} ${dayjs(delegation.endsAt).format('DD MMM YYYY')}`}</p>
												</TooltipContent>
											</Tooltip>
										)}
									</div>
								</TableCell>
								{!isReceived && (
									<TableCell className={styles.actionCell}>
										<UndelegateDialog
											open={openUndelegateAddresses[delegation.address] || false}
											setOpen={(isOpen) => handleOpenUndelegate(delegation.address, isOpen)}
											delegate={{ address: delegation.address, balance: delegation.balance }}
											disabled={dayjs().isBefore(dayjs(delegation.endsAt))}
											trackId={trackId}
											trackName={trackName}
											onUndelegateSuccess={() => handleUndelegateSuccess(delegation.address)}
										>
											<button
												type='button'
												className={styles.undelegateButton}
											>
												<IoPersonRemove />
												<span>{t('undelegate')}</span>
											</button>
										</UndelegateDialog>
									</TableCell>
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	};

	if (!isDelegated && !isReceived && !hasTrackData) {
		return (
			<div className={styles.undelegatedContent}>
				<Image
					src={UndelegatedTrack}
					alt='delegation-track'
					width={150}
					height={150}
				/>
				<p className={styles.undelegatedMessage}>
					{t('votingPowerForThisTrackHasNotBeenDelegatedYet')}
					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant='ghost'
								className='flex items-center gap-x-2 text-sm font-medium text-text_pink'
							>
								<IoPersonAdd />
								<span>{t('delegate')}</span>
							</Button>
						</DialogTrigger>
						<DialogContent className='max-w-screen-md p-6'>
							<DialogHeader>
								<DialogTitle className='flex items-center gap-x-2'>
									<IoPersonAdd />
									<span>{t('delegate')}</span>
								</DialogTitle>
							</DialogHeader>
							<DelegateVotingPower
								delegate={{ address: '' }}
								trackId={trackId}
							/>
						</DialogContent>
					</Dialog>
				</p>
			</div>
		);
	}

	return renderDelegationTable();
}
