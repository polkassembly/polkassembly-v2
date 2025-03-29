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
import DelegateDialog from '../../Components/DelegateDialog/DelegateDialog';
import UndelegateDialog from '../../Components/UndelegateDialog/UndelegateDialog';

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
	const [openDelegate, setOpenDelegate] = useState(false);
	const [openUndelegateAddresses, setOpenUndelegateAddresses] = useState<Record<string, boolean>>({});

	const handleOpenUndelegate = (address: string, isOpen: boolean) => {
		setOpenUndelegateAddresses((prev) => ({
			...prev,
			[address]: isOpen
		}));
	};

	const { data: delegateTrackResponse } = useQuery({
		queryKey: ['delegateTrack', trackId],
		queryFn: async () => {
			if (user?.loginAddress && trackId) {
				return NextApiClientService?.getDelegateTrack({ address: user?.loginAddress, trackId });
			}
			return null;
		},
		enabled: !!user?.loginAddress && !!trackId
	});

	const activeProposals = delegateTrackResponse?.data?.activeProposalListingWithDelegateVote?.items || [];

	return (
		<div>
			<div className='mb-4 flex items-center gap-2 text-btn_secondary_text'>
				<Link
					href='/delegation'
					className='cursor-pointer text-sm'
				>
					Dashboard
				</Link>
				<span className='mt-[-2px]'>
					<MdKeyboardArrowRight className='text-sm' />
				</span>
				<span className='cursor-pointer text-sm capitalize text-text_pink'>{trackName}</span>
			</div>
			<div className='flex flex-col justify-between gap-5 rounded-lg bg-bg_modal p-5'>
				<div>
					<div className='flex items-center gap-4'>
						<p className='text-2xl font-bold text-btn_secondary_text'>{trackName}</p>
						<span
							className={cn(
								'rounded-[26px] px-3 py-1.5 text-center text-xs text-btn_secondary_text',
								isDelegated && 'bg-delegated_delegation_bg',
								!isDelegated && 'bg-undelegated_delegation_bg'
							)}
						>
							{isDelegated ? 'Delegated' : 'Undelegated'}
						</span>
					</div>
					<p className='text-sm text-text_primary'>{trackDescription}</p>
				</div>

				<div className='flex flex-col items-center justify-center gap-4'>
					{!isDelegated ? (
						<>
							<Image
								src={UndelegatedTrack}
								alt='delegation-track'
								width={150}
								height={150}
							/>
							<p className='flex items-center gap-2 text-sm text-text_primary'>
								Voting power for this track has not been delegated yet{' '}
								<DelegateDialog
									open={openDelegate}
									setOpen={setOpenDelegate}
									delegate={{ address: '' }}
								>
									<button
										type='button'
										className='flex cursor-pointer items-center gap-1 text-text_pink'
									>
										<IoPersonAdd />
										<span>Delegate</span>
									</button>
								</DelegateDialog>
							</p>
						</>
					) : (
						<div className='flex w-full items-center justify-center p-4'>
							<Table className='w-full overflow-y-auto border-border_grey'>
								<TableHeader>
									<TableRow className='overflow-hidden rounded-t-lg bg-page_background px-6'>
										<TableHead className='p-6 first:rounded-tl-lg last:rounded-tr-lg'>#</TableHead>
										<TableHead className='w-1/4 px-6 py-5'>Delegated to</TableHead>
										<TableHead className='p-6'>Vote Balance</TableHead>
										<TableHead className='p-6'>Delegated on</TableHead>
										<TableHead className='p-6 last:rounded-tr-lg'>Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{delegateTrackResponse?.data?.delegatedTo?.map((delegation, index) => (
										<TableRow key={delegation.address}>
											<TableCell className='p-6'>{index + 1}</TableCell>
											<TableCell className='w-1/4 px-6 py-5'>{delegation.address}</TableCell>
											<TableCell className='p-6'>{formatBnBalance(delegation.balance, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}</TableCell>
											<TableCell className='p-6'>{dayjs(delegation.createdAt).format('DD MMM YYYY')}</TableCell>
											<TableCell className='p-6 last:rounded-tr-lg'>
												<div className='flex items-center gap-1'>
													<Tooltip>
														<TooltipTrigger asChild>
															<UndelegateDialog
																open={openUndelegateAddresses[delegation.address] || false}
																setOpen={(isOpen) => handleOpenUndelegate(delegation.address, isOpen)}
																delegate={{ address: delegation.address, balance: delegation.balance }}
																disabled={delegation.lockPeriod > 0}
															>
																<button
																	type='button'
																	className='flex cursor-pointer items-center gap-1 text-text_pink'
																>
																	<IoPersonRemove />
																	<span>Undelegate</span>
																</button>
															</UndelegateDialog>
														</TooltipTrigger>
														<TooltipContent className='bg-bg_modal text-sm text-text_primary'>
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
			<div className={cn('mt-10 flex flex-col gap-5 rounded-lg bg-bg_modal p-5', !isActiveProposalOpen ? 'h-auto' : '')}>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<p className='text-2xl font-bold text-btn_secondary_text'>Active Proposals</p>
						<span className='ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-grey_bg text-sm font-medium'>
							{activeProposals.length > 0 ? activeProposals.length : 0}
						</span>
					</div>
					<button
						type='button'
						className='text-sm text-text_primary'
						onClick={() => setIsActiveProposalOpen(!isActiveProposalOpen)}
					>
						<ChevronDown className={cn('h-6 w-6', isActiveProposalOpen && 'rotate-180')} />
					</button>
				</div>

				{isActiveProposalOpen && (
					<div className='mt-2 flex max-h-[500px] flex-col gap-5 overflow-y-auto'>
						{activeProposals.length > 0 ? (
							activeProposals.map((proposal) => (
								<div
									key={proposal.index}
									className='rounded-lg border border-border_grey p-6'
								>
									<div className='flex flex-col gap-2'>
										<div className='flex justify-between'>
											<div>
												<Link
													href={`/referenda/${proposal.index}`}
													className='text-sm font-medium text-btn_secondary_text'
												>
													#{proposal.index} {proposal.title}
												</Link>
											</div>
										</div>

										<div className='flex items-center gap-2 text-sm'>
											<span className='text-xs text-text_primary'>By:</span>
											<div className='flex items-center gap-1'>{proposal.onChainInfo?.proposer && <Address address={proposal.onChainInfo?.proposer} />}</div>

											{proposal.createdAt && (
												<div className='flex items-center gap-1.5 text-text_primary'>
													<Separator
														orientation='vertical'
														className='h-4'
													/>
													<FaRegClock className='text-sm' />
													<span className='text-xs text-text_primary'>{dayjs(proposal.onChainInfo?.createdAt).fromNow()}</span>
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
									<div className='flex items-center gap-2'>
										<span className='text-xs text-text_primary'>Votes:</span>
										<span className='text-xs text-text_primary'>{proposal?.delegateVote?.decision || 'Not Voted yet'}</span>
									</div>
								</div>
							))
						) : (
							<div className='text-text_secondary flex items-center justify-center py-8'>No active proposals found for this track</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default DelegationTrack;
