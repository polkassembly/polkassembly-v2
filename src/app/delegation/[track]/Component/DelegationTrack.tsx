// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EDelegationStatus, EVoteDecision, IPostWithDelegateVote, ITrackDelegationDetails } from '@/_shared/types';
import { cn } from '@/lib/utils';
import { IoPersonAdd, IoPersonRemove } from 'react-icons/io5';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MdKeyboardArrowRight } from 'react-icons/md';
import Image from 'next/image';
import UndelegatedTrack from '@assets/delegation/undelegated.svg';
import half from '@assets/delegation/half-time-left-clock.svg';
import onethird from '@assets/delegation/one-third-time-left-clock.svg';
import threefourth from '@assets/delegation/three-forth-time-left-clock.svg';
import whole from '@assets/delegation/whole-time-left-clock.svg';
import Link from 'next/link';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { FaRegClock } from 'react-icons/fa';
import { Separator } from '@/app/_shared-components/Separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { useTranslations } from 'next-intl';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import DelegateDialog from '../../Components/DelegateDialog/DelegateDialog';
import UndelegateDialog from '../../Components/UndelegateDialog/UndelegateDialog';
import styles from './DelegationTrack.module.scss';

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

interface DelegationTrackProps {
	trackDetails: {
		description: string;
		trackId: number;
		name: string;
	};
	delegateTrackResponse: ITrackDelegationDetails;
}

function DelegationTrack({ trackDetails, delegateTrackResponse }: DelegationTrackProps) {
	const network = getCurrentNetwork();
	const t = useTranslations('Delegation');
	const [isActiveProposalOpen, setIsActiveProposalOpen] = useState(false);
	const [openDelegate, setOpenDelegate] = useState(false);
	const [openUndelegateAddresses, setOpenUndelegateAddresses] = useState<Record<string, boolean>>({});
	const trackDescription = trackDetails?.description;
	const trackId = trackDetails?.trackId;

	const isDelegated = delegateTrackResponse?.status === EDelegationStatus.DELEGATED;
	const isReceived = delegateTrackResponse?.status === EDelegationStatus.RECEIVED;
	const handleOpenUndelegate = (address: string, isOpen: boolean) => {
		setOpenUndelegateAddresses((prev) => ({ ...prev, [address]: isOpen }));
	};

	const getTimeRemaining = (endDate: string) => {
		const timeLeft = new Date(endDate).getTime() - new Date().getTime();
		const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
		const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
		return `${days} d : ${hours} h : ${minutes} m Remaining`;
	};

	const activeProposals = delegateTrackResponse?.activeProposalListingWithDelegateVote?.items || [];
	const hasDelegations = (delegateTrackResponse?.delegatedTo?.length ?? 0) > 0 || (delegateTrackResponse?.receivedDelegations?.length ?? 0) > 0;
	const trackName = trackDetails.name
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
	const renderDelegationTable = () => {
		const delegations = isReceived ? delegateTrackResponse?.receivedDelegations || [] : delegateTrackResponse?.delegatedTo || [];

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
					<div>
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
										<div
											className={cn(
												styles.voteInfo,
												proposal?.delegateVote?.decision === EVoteDecision.AYE && styles.aye,
												proposal?.delegateVote?.decision === EVoteDecision.NAY && styles.nay,
												proposal?.delegateVote?.decision === EVoteDecision.SPLIT && styles.split,
												proposal?.delegateVote?.decision === EVoteDecision.SPLIT_ABSTAIN && styles.splitAbstain,
												!proposal?.delegateVote?.decision && styles.notVoted
											)}
										>
											<span className={styles.proposalLabel}>
												{proposal?.delegateVote?.decision === EVoteDecision.AYE && t('votedAye')}
												{proposal?.delegateVote?.decision === EVoteDecision.NAY && t('votedNay')}
												{proposal?.delegateVote?.decision === EVoteDecision.SPLIT && t('votedSplit')}
												{proposal?.delegateVote?.decision === EVoteDecision.SPLIT_ABSTAIN && t('votedSplitAbstain')}
												{!proposal?.delegateVote?.decision && t('notVotedYet')}
												{proposal?.delegateVote?.decision && (
													<div className='flex items-center gap-2'>
														<Separator
															orientation='vertical'
															className='h-4'
														/>
														{t('balance')}: {formatBnBalance(proposal?.delegateVote?.balanceValue, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
														<Separator
															orientation='vertical'
															className='h-4'
														/>
														{t('conviction')}: {proposal?.delegateVote?.lockPeriod}x
													</div>
												)}
											</span>
											{!proposal?.delegateVote?.decision && <IoIosInformationCircleOutline className='text-lg text-warning' />}
										</div>
									</div>
								))
							) : (
								<div className={styles.noProposalsMessage}>{t('noActiveProposalsFoundForThisTrack')}</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default DelegationTrack;
