// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EDelegationStatus, EPostOrigin } from '@/_shared/types';
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
import DelegateDialog from '../../Components/DelegateDialog/DelegateDialog';
import UndelegateDialog from '../../Components/UndelegateDialog/UndelegateDialog';
import styles from './DelegationTrack.module.scss';

function DelegationTrack({ track }: { track: string }) {
	const [delegateUserTracks] = useAtom(delegateUserTracksAtom);
	const network = getCurrentNetwork();
	const { user } = useUser();
	const trackName = track.charAt(0).toUpperCase() + track.slice(1).replace(/-/g, ' ');
	const trackNameSnakeCase = track.replace(/-/g, '_');
	const trackOriginEntry = Object.entries(NETWORKS_DETAILS[network].trackDetails).find(([, details]) => details?.name === trackNameSnakeCase);
	const trackOrigin = trackOriginEntry ? (trackOriginEntry[0] as EPostOrigin) : undefined;
	const [isActiveProposalOpen, setIsActiveProposalOpen] = useState(false);
	const trackDetails = trackOrigin ? NETWORKS_DETAILS[network].trackDetails[trackOrigin] : undefined;
	const trackDescription = trackDetails?.description;
	const trackId = trackDetails?.trackId;
	const trackDelegation = delegateUserTracks?.find((track) => track.trackId === trackId);
	const isDelegated = trackDelegation?.status === EDelegationStatus.DELEGATED;
	const isReceived = trackDelegation?.status === EDelegationStatus.RECEIVED;
	const [openDelegate, setOpenDelegate] = useState(false);
	const [openUndelegateAddresses, setOpenUndelegateAddresses] = useState<Record<string, boolean>>({});

	const handleOpenUndelegate = (address: string, isOpen: boolean) => {
		setOpenUndelegateAddresses((prev) => ({
			...prev,
			[address]: isOpen
		}));
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

	const activeProposals = delegateTrackResponse?.data?.activeProposalListingWithDelegateVote?.items || [];
	return (
		<div>
			<div className={styles.delegationTrackContainer}>
				<Link
					href='/delegation'
					className='cursor-pointer text-sm'
				>
					Dashboard
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

				<div className={styles.contentContainer}>
					{!isDelegated && !isReceived && !isDelegateTrackLoading ? (
						<div className={styles.undelegatedContent}>
							<Image
								src={UndelegatedTrack}
								alt='delegation-track'
								width={150}
								height={150}
							/>
							<p className={styles.undelegatedMessage}>
								Voting power for this track has not been delegated yet{' '}
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
										<span>Delegate</span>
									</button>
								</DelegateDialog>
							</p>
						</div>
					) : isDelegateTrackLoading ? (
						<div className={styles.loadingContainer}>
							<LoadingLayover />
						</div>
					) : (
						<div className={styles.tableContainer}>
							<Table className={styles.delegationTable}>
								<TableHeader>
									<TableRow className={styles.tableHeader}>
										<TableHead className={styles.tableHeaderCell}>#</TableHead>
										<TableHead className={styles.addressCell}>{isReceived ? 'Delegated by' : 'Delegated to'}</TableHead>
										<TableHead className={styles.tableHeaderCell}>Balance</TableHead>
										<TableHead className={styles.tableHeaderCell}>Conviction</TableHead>
										<TableHead className={styles.tableHeaderCell}>Delegated on</TableHead>
										{!isReceived && <TableHead className={styles.tableHeaderCell}>Action</TableHead>}
									</TableRow>
								</TableHeader>
								<TableBody>
									{isReceived
										? delegateTrackResponse?.data?.receivedDelegations?.map((delegation, index) => (
												<TableRow key={delegation.address}>
													<TableCell className='p-6'>{index + 1}</TableCell>
													<TableCell className={styles.addressCell}>
														<Address address={delegation.address} />
													</TableCell>
													<TableCell className='p-6'>{formatBnBalance(delegation.balance, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}</TableCell>
													<TableCell className='p-6'>{delegation.lockPeriod}x</TableCell>
													<TableCell className='p-6'>{dayjs(delegation.createdAt).format('DD MMM YYYY')}</TableCell>
												</TableRow>
											))
										: delegateTrackResponse?.data?.delegatedTo?.map((delegation, index) => (
												<TableRow key={delegation.address}>
													<TableCell className='p-6'>{index + 1}</TableCell>
													<TableCell className={styles.addressCell}>{delegation.address}</TableCell>
													<TableCell className='p-6'>{formatBnBalance(delegation.balance, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}</TableCell>
													<TableCell className='p-6'>{delegation.lockPeriod}x</TableCell>
													<TableCell className='p-6'>{dayjs(delegation.createdAt).format('DD MMM YYYY')}</TableCell>
													<TableCell className={styles.actionCell}>
														<div className='flex items-center gap-1'>
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
																			<span>Undelegate</span>
																		</button>
																	</UndelegateDialog>
																</TooltipTrigger>
																<TooltipContent className={styles.tooltipContent}>
																	{delegation.lockPeriod > 0 ? <p>You can undelegate after {delegation.lockPeriod} days</p> : <p>You can undelegate now</p>}
																</TooltipContent>
															</Tooltip>
														</div>
													</TableCell>
												</TableRow>
											))}
								</TableBody>
							</Table>
						</div>
					)}
				</div>
			</div>
			<div className={cn(styles.proposalsContainer, !isActiveProposalOpen && 'h-auto')}>
				<div className={styles.proposalsHeader}>
					<div className={styles.proposalsTitle}>
						<p className={styles.delegationTrackName}>Active Proposals</p>
						<span className={styles.proposalsCount}>{activeProposals.length > 0 ? activeProposals.length : 0}</span>
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
							activeProposals.map((proposal) => (
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
											<span className={styles.proposalLabel}>By:</span>
											<div className='flex items-center gap-1'>{proposal.onChainInfo?.proposer && <Address address={proposal.onChainInfo?.proposer} />}</div>

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
													<span className='text-xs text-btn_secondary_text'>
														{proposal.onChainInfo?.decisionPeriodEndsAt
															? (() => {
																	const timeLeft = new Date(proposal.onChainInfo.decisionPeriodEndsAt).getTime() - new Date().getTime();
																	const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
																	const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
																	const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
																	return `${days} d : ${hours} h : ${minutes} m Remaining`;
																})()
															: ''}
													</span>
												</div>
											)}
										</div>
									</div>
									<div className={styles.voteInfo}>
										<span className={styles.proposalLabel}>Votes:</span>
										<span className={styles.proposalLabel}>{proposal?.delegateVote?.decision || 'Not Voted yet'}</span>
									</div>
								</div>
							))
						) : (
							<div className={styles.noProposalsMessage}>No active proposals found for this track</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default DelegationTrack;
