// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EDelegationStatus, EPostOrigin, IPostWithDelegateVote } from '@/_shared/types';
import { delegateUserTracksAtom } from '@/app/_atoms/delegation/delegationAtom';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { IoPersonAdd, IoPersonRemove } from 'react-icons/io5';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MdKeyboardArrowRight } from 'react-icons/md';
import Image from 'next/image';
import UndelegatedTrack from '@assets/delegation/undelegated.svg';
import Link from 'next/link';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { FaRegClock } from 'react-icons/fa';
import { Separator } from '@/app/_shared-components/Separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import { useTranslations } from 'next-intl';
import DelegateDialog from '../../Components/DelegateDialog/DelegateDialog';
import UndelegateDialog from '../../Components/UndelegateDialog/UndelegateDialog';
import styles from './DelegationTrack.module.scss';

function DelegationTrack({ track }: { track: string }) {
	const [delegateUserTracks] = useAtom(delegateUserTracksAtom);
	const network = getCurrentNetwork();
	const { user } = useUser();
	const t = useTranslations('Delegation');
	const [isActiveProposalOpen, setIsActiveProposalOpen] = useState(false);
	const [openDelegate, setOpenDelegate] = useState(false);
	const [openUndelegateAddresses, setOpenUndelegateAddresses] = useState<Record<string, boolean>>({});
	const trackName = track.charAt(0).toUpperCase() + track.slice(1).replace(/-/g, ' ');
	const trackNameSnakeCase = track.replace(/-/g, '_');
	const trackOriginEntry = Object.entries(NETWORKS_DETAILS[network].trackDetails).find(([, details]) => details?.name === trackNameSnakeCase);
	const trackOrigin = trackOriginEntry ? (trackOriginEntry[0] as EPostOrigin) : undefined;
	const trackDetails = trackOrigin ? NETWORKS_DETAILS[network].trackDetails[trackOrigin] : undefined;
	const trackDescription = trackDetails?.description;
	const trackId = trackDetails?.trackId;
	const trackDelegation = delegateUserTracks?.find((track) => track.trackId === trackId);
	const isDelegated = trackDelegation?.status === EDelegationStatus.DELEGATED;
	const isReceived = trackDelegation?.status === EDelegationStatus.RECEIVED;

	const handleOpenUndelegate = (address: string, isOpen: boolean) => {
		setOpenUndelegateAddresses((prev) => ({ ...prev, [address]: isOpen }));
	};

	const { data: delegateTrackResponse, isLoading: isDelegateTrackLoading } = useQuery({
		queryKey: ['delegateTrack', trackId],
		queryFn: async () => {
			if (user?.defaultAddress && trackId !== undefined) {
				return NextApiClientService?.getDelegateTrack({ address: user?.defaultAddress, trackId });
			}
			return null;
		}
	});

	const getTimeRemaining = (endDate: string) => {
		const timeLeft = new Date(endDate).getTime() - new Date().getTime();
		const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
		const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
		return `${days} d : ${hours} h : ${minutes} m Remaining`;
	};

	const activeProposals = delegateTrackResponse?.data?.activeProposalListingWithDelegateVote?.items || [];
	const hasDelegations = (delegateTrackResponse?.data?.delegatedTo?.length ?? 0) > 0 || (delegateTrackResponse?.data?.receivedDelegations?.length ?? 0) > 0;

	const renderDelegationTable = () => {
		const delegations = isReceived ? delegateTrackResponse?.data?.receivedDelegations || [] : delegateTrackResponse?.data?.delegatedTo || [];

		return (
			<div className={styles.tableContainer}>
				<Table className={styles.delegationTable}>
					<TableHeader>
						<TableRow className={styles.tableHeader}>
							<TableHead className={cn(styles.tableHeaderCell, 'px-6')}>#</TableHead>
							<TableHead className={styles.addressCell}>{isReceived ? 'Delegated by' : 'Delegated to'}</TableHead>
							<TableHead className={styles.tableHeaderCell}>{t('Balance')}</TableHead>
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
								<TableCell className='p-6'>{delegation.lockPeriod}x</TableCell>
								<TableCell className='p-6'>{dayjs(delegation.createdAt).format('DD MMM YYYY')}</TableCell>
								{!isReceived && (
									<TableCell className={styles.actionCell}>
										<Tooltip>
											<TooltipTrigger asChild>
												<UndelegateDialog
													open={openUndelegateAddresses[delegation.address] || false}
													setOpen={(isOpen) => handleOpenUndelegate(delegation.address, isOpen)}
													delegate={{ address: delegation.address, balance: delegation.balance }}
													disabled={delegation.lockPeriod > 0}
													trackId={trackId}
													trackName={trackName}
												>
													<button
														type='button'
														className={styles.undelegateButton}
													>
														<IoPersonRemove />
														<span>{t('undelegate')}</span>
													</button>
												</UndelegateDialog>
											</TooltipTrigger>
											<TooltipContent className={styles.tooltipContent}>
												{delegation.lockPeriod > 0 ? <p>{t('youCanUndelegateAfter', { days: delegation.lockPeriod })}</p> : <p>{t('youCanUndelegateNow')}</p>}
											</TooltipContent>
										</Tooltip>
									</TableCell>
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	};

	const renderProposalTimeInfo = (proposal: IPostWithDelegateVote) => {
		return (
			<>
				{proposal.createdAt && (
					<div className='flex items-center gap-1.5 text-text_primary'>
						<Separator
							orientation='vertical'
							className='h-4'
						/>
						<FaRegClock className='text-sm' />
						<span className={styles.proposalLabel}>{dayjs(proposal.onChainInfo?.createdAt).fromNow()}</span>
					</div>
				)}
				{proposal.onChainInfo?.decisionPeriodEndsAt && (
					<div className='flex items-center gap-1.5 text-text_primary'>
						<Separator
							orientation='vertical'
							className='h-4'
						/>
						<FaRegClock className='text-sm text-btn_secondary_text' />
						<span className='text-xs text-btn_secondary_text'>{getTimeRemaining(proposal.onChainInfo.decisionPeriodEndsAt.toString())}</span>
					</div>
				)}
			</>
		);
	};

	const renderContent = () => {
		if (isDelegateTrackLoading) {
			return (
				<div className={styles.loadingContainer}>
					<LoadingLayover />
				</div>
			);
		}

		if (!isDelegated && !isReceived) {
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
						<DelegateDialog
							open={openDelegate}
							setOpen={setOpenDelegate}
							delegate={{ address: '' }}
						>
							<button
								type='button'
								className={styles.delegateButton}
							>
								<IoPersonAdd />
								<span>{t('delegate')}</span>
							</button>
						</DelegateDialog>
					</p>
				</div>
			);
		}

		if (hasDelegations) {
			return renderDelegationTable();
		}

		return null;
	};

	const renderProposals = () => {
		return (
			<div className={cn(styles.proposalsContainer, !isActiveProposalOpen && 'h-auto')}>
				<div className={styles.proposalsHeader}>
					<div className={styles.proposalsTitle}>
						<p className={styles.delegationTrackName}>{t('activeProposals')}</p>
						<span className={styles.proposalsCount}>{activeProposals.length}</span>
					</div>
					<button
						type='button'
						className={styles.expandButton}
						onClick={() => setIsActiveProposalOpen(!isActiveProposalOpen)}
					>
						<ChevronDown className={cn('h-6 w-6', isActiveProposalOpen && 'rotate-180')} />
					</button>
				</div>

				{isActiveProposalOpen && (
					<div className={styles.proposalsList}>
						{activeProposals.length > 0 ? (
							activeProposals.map((proposal: IPostWithDelegateVote) => (
								<div
									key={proposal.index}
									className={styles.proposalCard}
								>
									<div className={styles.proposalDetails}>
										<div className='flex justify-between'>
											<div>
												<Link
													href={`/referenda/${proposal.index}`}
													className={styles.proposalTitle}
												>
													#{proposal.index} {proposal.title}
												</Link>
											</div>
										</div>
										<div className={styles.proposalInfo}>
											<span className={styles.proposalLabel}>{t('by')}:</span>
											<div className='flex items-center gap-1'>{proposal.onChainInfo?.proposer && <Address address={proposal.onChainInfo?.proposer} />}</div>
											{renderProposalTimeInfo(proposal)}
										</div>
									</div>
									<div className={styles.voteInfo}>
										<span className={styles.proposalLabel}>{t('votes')}:</span>
										<span className={styles.proposalLabel}>{proposal?.delegateVote?.decision || t('notVotedYet')}</span>
									</div>
								</div>
							))
						) : (
							<div className={styles.noProposalsMessage}>{t('noActiveProposalsFoundForThisTrack')}</div>
						)}
					</div>
				)}
			</div>
		);
	};

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
					<div className={styles.trackHeader}>
						<p className={styles.delegationTrackName}>{trackName}</p>
						<span
							className={cn(styles.statusBadge, isDelegated && styles.delegatedBadge, isReceived && styles.receivedBadge, !isDelegated && !isReceived && styles.undelegatedBadge)}
						>
							{isDelegated ? 'Delegated' : isReceived ? 'Received' : 'Undelegated'}
						</span>
					</div>
					<p className={styles.trackDescription}>{trackDescription}</p>
				</div>

				<div className={styles.contentContainer}>{renderContent()}</div>
			</div>

			{renderProposals()}
		</div>
	);
}

export default DelegationTrack;
