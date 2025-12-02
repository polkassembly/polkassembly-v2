// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Clock, Box, ExternalLink, FileText, Search, CheckCircle, Trash2, UserPlus, UserMinus, Copy } from 'lucide-react';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { IIdentityUpdate, formatIdentityUpdateType, formatIdentityHistoryBlocks } from '@/app/_client-utils/identityUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import Image from 'next/image';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Address from '@/app/_shared-components/Profile/Address/Address';

interface IdentityUpdateTimelineProps {
	updates: IIdentityUpdate[];
	isLoading?: boolean;
}

function IdentityUpdateTimeline({ updates, isLoading }: IdentityUpdateTimelineProps) {
	const network = getCurrentNetwork();
	const formatDate = (timestamp: string) => {
		const date = new Date(timestamp);
		const day = date.getDate();
		const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
		const month = date.toLocaleDateString('en-US', { month: 'short' });
		const year = date.getFullYear().toString().slice(-2);
		const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
		return `${day}${suffix} ${month}'${year}, ${time}`;
	};

	const getUpdateIcon = (type: IIdentityUpdate['type']) => {
		switch (type) {
			case 'IdentitySet':
				return FileText;
			case 'JudgementRequested':
				return Search;
			case 'JudgementGiven':
				return CheckCircle;
			case 'IdentityCleared':
				return Trash2;
			case 'SubIdentityAdded':
				return UserPlus;
			case 'SubIdentityRemoved':
				return UserMinus;
			default:
				return FileText;
		}
	};

	const getUpdateColor = (type: IIdentityUpdate['type']) => {
		switch (type) {
			case 'IdentitySet':
				return 'bg-pink-500';
			case 'JudgementRequested':
				return 'bg-gray-400';
			case 'JudgementGiven':
				return 'bg-gray-400';
			case 'IdentityCleared':
				return 'bg-red-500';
			case 'SubIdentityAdded':
				return 'bg-green-500';
			case 'SubIdentityRemoved':
				return 'bg-orange-500';
			default:
				return 'bg-blue-500';
		}
	};

	const getSubscanUrl = (type: 'block' | 'extrinsic', value: string | number) => {
		return `https://${network}.subscan.io/${type}/${value}`;
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	if (isLoading) {
		return (
			<div className='flex flex-col gap-3 rounded-lg border border-primary_border bg-bg_modal p-4'>
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
			</div>
		);
	}

	if (!updates || updates.length === 0) {
		return (
			<div className='rounded-lg border border-primary_border bg-bg_modal p-6 text-center'>
				<p className='text-xs text-basic_text'>No update history available</p>
			</div>
		);
	}

	return (
		<div className='max-h-[350px] space-y-0 overflow-y-auto'>
			{updates.map((update, index) => {
				const UpdateIcon = getUpdateIcon(update.type);
				const colorClass = getUpdateColor(update.type);
				const isLast = index === updates.length - 1;

				return (
					<div
						key={`${update.blockNumber}-${update.extrinsicIndex}`}
						className='relative flex gap-4 pb-6'
					>
						<div className='relative flex flex-col items-center'>
							<div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ${colorClass}`}>
								<UpdateIcon
									size={16}
									className='text-white'
								/>
							</div>
							{!isLast && <div className='absolute top-10 h-full w-px border-l-2 border-dashed border-primary_border' />}
						</div>

						<div className='flex-1 pt-1'>
							<div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
								<div className='flex-1 space-y-2'>
									<h3 className='text-base font-semibold text-text_primary'>{formatIdentityUpdateType(update.type)}</h3>

									<div className='flex items-center gap-2 text-xs text-basic_text'>
										<Clock size={14} />
										<span>{formatDate(update.timestamp)}</span>
									</div>

									<div className='flex items-center gap-2 text-xs text-basic_text'>
										<Box size={14} />
										<span>{update.blockNumber}</span>
									</div>

									<div className='flex items-center gap-3 text-xs'>
										{update.extrinsicHash && (
											<a
												href={getSubscanUrl('extrinsic', update.extrinsicHash)}
												target='_blank'
												rel='noopener noreferrer'
												className='flex items-center gap-1 text-text_pink hover:underline'
											>
												Extrinsic
												<ExternalLink size={12} />
											</a>
										)}
										<a
											href={getSubscanUrl('block', update.blockNumber)}
											target='_blank'
											rel='noopener noreferrer'
											className='flex items-center gap-1 text-text_pink hover:underline'
										>
											Event
											<ExternalLink size={12} />
										</a>
									</div>
								</div>

								<div className='bg-bg_card min-w-[300px] space-y-2 rounded-lg p-4'>
									{update.type === 'IdentitySet' && update.changes && update.changes.length > 0 && (
										<>
											{update.changes.map((change) => (
												<div
													key={change.field}
													className='flex items-center justify-between rounded-sm bg-create_option_bg px-2 py-1 text-xs'
												>
													<span className='text-basic_text'>{change.field}</span>
													<span className='font-medium text-text_primary'>{change.newValue || '-'}</span>
												</div>
											))}
										</>
									)}

									{(update.type === 'JudgementRequested' || update.type === 'JudgementGiven') && (
										<>
											{update.registrarIndex !== undefined && (
												<div className='flex items-center justify-between rounded-sm bg-create_option_bg px-2 py-1 text-xs'>
													<span className='text-basic_text'>Registrar Index</span>
													<span className='font-medium text-text_primary'>{update.registrarIndex}</span>
												</div>
											)}
											{update.registrarAddress && (
												<div className='flex items-center justify-between gap-10 rounded-sm bg-create_option_bg px-2 py-1 text-xs'>
													<span className='text-basic_text'>Registrar Address</span>
													<div className='flex items-center gap-1'>
														<Address
															iconSize={16}
															address={update.registrarAddress}
															textClassName='text-xs'
															disableTooltip
														/>
														<span className='font-medium text-text_primary'>
															({update.registrarAddress.slice(0, 1)}...{update.registrarAddress.slice(-3)})
														</span>
														<button
															title='Copy address'
															onClick={() => copyToClipboard(update.registrarAddress || '')}
															className='text-basic_text hover:text-text_primary'
															type='button'
														>
															<Copy size={12} />
														</button>
													</div>
												</div>
											)}
										</>
									)}

									{update.type === 'JudgementGiven' && update.judgement && (
										<>
											<div className='flex items-center justify-between rounded-sm bg-create_option_bg px-2 py-1 text-xs'>
												<span className='text-basic_text'>Judgement</span>
												<span className='text-xs font-medium text-text_primary'>{update.judgement}</span>
											</div>
											{update.maxFee && (
												<div className='flex items-center justify-between rounded-sm bg-create_option_bg px-2 py-1 text-xs'>
													<span className='text-basic_text'>Fees</span>
													<div className='flex items-center gap-1'>
														<Image
															src={NETWORKS_DETAILS[`${network}`].logo}
															alt={network}
															width={16}
															height={16}
															className='rounded-full'
														/>
														<span className='font-medium text-text_primary'>
															{formatBnBalance(
																update.maxFee || '0',
																{
																	withUnit: true,
																	numberAfterComma: 2,
																	compactNotation: true
																},
																network
															)}
														</span>
													</div>
												</div>
											)}
										</>
									)}

									{!update.changes?.length && !update.registrarIndex && !update.judgement && <div className='text-center text-xs text-basic_text'>No additional details</div>}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export function IdentityTimelineDialog({ selectedAddress, onClose }: { selectedAddress: { address: string; displayName: string } | null; onClose: () => void }) {
	const {
		data: updates,
		isLoading,
		error
	} = useQuery({
		queryKey: ['identityHistory', selectedAddress?.address],
		queryFn: async () => {
			if (!selectedAddress?.address) return [];

			const { data } = await NextApiClientService.fetchIdentityHistory({ address: selectedAddress.address });
			return formatIdentityHistoryBlocks(data?.history || []);
		},
		enabled: !!selectedAddress?.address
	});

	return (
		<Dialog
			open={!!selectedAddress}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className='max-w-screen-md p-4 sm:p-6'>
				<DialogHeader>
					<div className='flex items-center gap-2'>
						<Clock
							size={24}
							className='text-text_primary'
						/>
						<DialogTitle className='text-xl font-semibold text-text_primary'>Latest Update</DialogTitle>
					</div>
				</DialogHeader>
				<div className='mt-4 max-h-[350px] overflow-y-auto'>
					{error ? (
						<div className='rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center'>
							<p className='text-xs font-medium text-red-500'>Failed to load update history</p>
							<p className='mt-2 text-xs text-basic_text'>
								{error instanceof Error ? error.message : 'This feature is currently only available for Polkadot and Kusama networks.'}
							</p>
						</div>
					) : (
						<IdentityUpdateTimeline
							updates={updates || []}
							isLoading={isLoading}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default IdentityUpdateTimeline;
