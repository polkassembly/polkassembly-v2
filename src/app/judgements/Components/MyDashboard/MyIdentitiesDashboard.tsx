// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { EJudgementStatus, ENotificationStatus } from '@/_shared/types';
import { mapJudgementStatus } from '@/app/_client-utils/identityUtils';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '@/app/_shared-components/Table';
import { useUser } from '@/hooks/useUser';
import { Settings, Trash2, Copy, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { useToast } from '@/hooks/useToast';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { IdentityTimelineDialog } from '../IdentityUpdateTimeline/IdentityUpdateTimeline';
import { SocialLinksDisplay, UpdateHistoryButton, LastUpdateCell } from '../Shared/IdentityComponents';
import styles from '../Overview/IdentitiesListingTable.module.scss';

const SUB_IDENTITY_TYPE = 'Sub-identity';

function MyIdentitiesDashboard() {
	const { identityService } = useIdentityService();
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const queryClient = useQueryClient();
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const [selectedAddressForTimeline, setSelectedAddressForTimeline] = useState<{ address: string; displayName: string } | null>(null);
	const { setVaultQrState } = usePolkadotVault();
	const { toast } = useToast();
	const { data: myIdentities, isLoading } = useQuery({
		queryKey: ['myIdentities', user?.defaultAddress, identityService],
		queryFn: async () => {
			if (!identityService || !user?.defaultAddress) return null;

			const identities = [];
			let totalJudgements = 0;

			const mainIdentity = await identityService.getOnChainIdentity(user.defaultAddress);
			const api = identityService.getApi();

			const getUserBalances = await api.derive.balances.all(user.defaultAddress);
			const balance = getUserBalances.freeBalance.toString();

			let lastUpdatedBlock: number | undefined;
			try {
				const identityData = await api.query.identity.identityOf(user.defaultAddress);
				const blockHash = identityData?.createdAtHash || (await api.rpc.chain.getBlockHash());
				const blockHeader = await api.rpc.chain.getHeader(blockHash);
				lastUpdatedBlock = blockHeader.number.toNumber();
			} catch {
				lastUpdatedBlock = undefined;
			}

			if (mainIdentity.isIdentitySet) {
				const judgements = mainIdentity.judgements.map((judgement) => {
					const judgementArray = [...judgement];
					const judgementStatus = judgementArray[1];
					return mapJudgementStatus(String(judgementStatus));
				});

				const approvedJudgements = judgements.filter((j: EJudgementStatus) => j === EJudgementStatus.APPROVED || j === EJudgementStatus.REJECTED);
				totalJudgements += approvedJudgements.length;

				const socials = {
					twitter: mainIdentity.twitter,
					email: mainIdentity.email,
					discord: mainIdentity.discord,
					matrix: mainIdentity.matrix,
					github: mainIdentity.github,
					web: mainIdentity.web
				};

				identities.push({
					address: user.defaultAddress,
					displayName: mainIdentity.display,
					type: 'Direct' as const,
					socials,
					judgements: approvedJudgements,
					balance,
					lastUpdated: new Date(),
					lastUpdatedBlock,
					canEdit: true,
					canDelete: false
				});
			}

			const subAddresses = await identityService.getSubIdentities(user.defaultAddress);

			const subIdentitiesData = await Promise.all(
				subAddresses.map(async (subAddress) => {
					const subInfo = await identityService.getSubIdentityInfo(subAddress);
					const subIdentity = await identityService.getOnChainIdentity(subAddress);
					const subAccountInfo = await api.derive.balances.all(subAddress);
					const subBalance = subAccountInfo.freeBalance.toString();

					const subJudgements = subIdentity.judgements.map((judgement) => {
						const judgementArray = [...judgement];
						const judgementStatus = judgementArray[1];
						return mapJudgementStatus(String(judgementStatus));
					});

					const approvedSubJudgements = subJudgements.filter((j: EJudgementStatus) => j === EJudgementStatus.APPROVED || j === EJudgementStatus.REJECTED);
					totalJudgements += approvedSubJudgements.length;

					return {
						address: subAddress,
						displayName: subInfo.displayName || subIdentity.display,
						type: SUB_IDENTITY_TYPE,
						socials: {
							twitter: subIdentity.twitter,
							email: subIdentity.email,
							discord: subIdentity.discord,
							matrix: subIdentity.matrix,
							github: subIdentity.github,
							web: subIdentity.web
						},
						judgements: approvedSubJudgements,
						balance: subBalance,
						lastUpdated: new Date(),
						lastUpdatedBlock,
						canEdit: false,
						canDelete: true
					};
				})
			);

			identities.push(...subIdentitiesData);

			return {
				totalSubIdentities: subAddresses.length,
				percentageThisMonth: 12.8,
				totalJudgements,
				totalBalance: balance,
				lastUpdatedCount: identities.length,
				identities
			};
		},
		enabled: !!identityService && !!user?.defaultAddress,
		staleTime: 30000
	});

	const handleEdit = (address: string) => {
		window.location.href = `/set-identity?address=${address}`;
	};

	const handleDeleteIdentity = async (address: string, isSub: boolean) => {
		if (!identityService || !user?.defaultAddress || !userPreferences.wallet) return;

		const confirmMessage = isSub ? 'Are you sure you want to remove this sub-identity?' : 'Are you sure you want to clear your on-chain identity? This action cannot be undone.';

		if (!window.confirm(confirmMessage)) return;

		setIsDeleting(address);

		if (!isSub) {
			await identityService.clearOnChainIdentity({
				address: user.defaultAddress,
				wallet: userPreferences.wallet,
				setVaultQrState,
				selectedAccount: userPreferences.selectedAccount,
				onSuccess: () => {
					toast({
						title: 'Success',
						description: 'Identity cleared successfully!',
						status: ENotificationStatus.SUCCESS
					});
					queryClient.invalidateQueries({ queryKey: ['myIdentities', user.defaultAddress] });
					setIsDeleting(null);
				},
				onFailed: (errorMessage?: string) => {
					toast({
						title: 'Error',
						description: errorMessage || 'Failed to clear identity',
						status: ENotificationStatus.ERROR
					});
					setIsDeleting(null);
				}
			});
		} else {
			toast({
				title: 'Info',
				description: 'Sub-identity removal will be implemented in the next update',
				status: ENotificationStatus.INFO
			});
			setIsDeleting(null);
		}
	};

	if (isLoading || !identityService) {
		return (
			<div className='flex flex-col gap-4 rounded-3xl border border-primary_border bg-bg_modal p-4'>
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
				<Skeleton className='h-12 w-full' />
			</div>
		);
	}

	if (!myIdentities || myIdentities.identities.length === 0) {
		return (
			<div className='flex items-center justify-center rounded-3xl border border-primary_border bg-bg_modal p-12'>
				<div className='text-center'>
					<h3 className='text-xl font-semibold text-text_primary'>No Identity Set</h3>
					<p className='text-text_secondary mt-2'>Set up your on-chain identity to get started</p>
				</div>
			</div>
		);
	}

	return (
		<div className='w-full'>
			{/* Stats Cards */}
			<div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<div className='rounded-lg bg-bg_modal p-4'>
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-[#E5007A]/10'>
							<span className='text-xl'>👤</span>
						</div>
						<div>
							<p className='text-text_secondary text-xs'>My sub-identities</p>
							<div className='flex items-baseline gap-2'>
								<p className='text-2xl font-bold text-text_primary'>{myIdentities?.totalSubIdentities || 0}</p>
								<span className='text-xs text-green-500'>↑{myIdentities?.percentageThisMonth.toFixed(1)}% this month</span>
							</div>
						</div>
					</div>
				</div>

				<div className='rounded-lg bg-bg_modal p-4'>
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-[#E5007A]/10'>
							<span className='text-xl'>📊</span>
						</div>
						<div>
							<p className='text-text_secondary text-xs'>Judgement</p>
							<p className='text-2xl font-bold text-text_primary'>{myIdentities?.totalJudgements || 0}</p>
						</div>
					</div>
				</div>

				<div className='rounded-lg bg-bg_modal p-4'>
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-[#E5007A]/10'>
							<span className='text-xl'>💰</span>
						</div>
						<div>
							<p className='text-text_secondary text-xs'>Balance</p>
							<p className='text-2xl font-bold text-text_primary'>{myIdentities?.totalBalance || 0}</p>
						</div>
					</div>
				</div>

				<div className='rounded-lg bg-bg_modal p-4'>
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-[#E5007A]/10'>
							<span className='text-xl'>🕐</span>
						</div>
						<div>
							<p className='text-text_secondary text-xs'>Last Updated on</p>
							<p className='text-2xl font-bold text-text_primary'>{myIdentities?.lastUpdatedCount || 0}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className='w-full rounded-3xl border border-primary_border bg-bg_modal p-6'>
				<Table>
					<TableHeader>
						<TableRow className={styles.headerRow}>
							<TableHead className={styles.headerCell}>IDENTITY</TableHead>
							<TableHead className={styles.headerCell}>SOCIALS</TableHead>
							<TableHead className={styles.headerCell}>TYPE</TableHead>
							<TableHead className={styles.headerCell}>LATEST UPDATE</TableHead>
							<TableHead className={styles.headerCell}>JUDGEMENTS</TableHead>
							<TableHead className={styles.headerCell}>ACTIONS</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{myIdentities?.identities.map((identity) => (
							<TableRow key={identity.address}>
								<td className='py-4 pl-2 pr-6'>
									<div className='flex items-center gap-1'>
										<span className='text-xs text-basic_text'>
											<Address
												iconSize={24}
												address={identity.address}
											/>
										</span>
										<span className='text-xs text-basic_text'>
											({identity.address.slice(0, 6)}...{identity.address.slice(-5)})
										</span>
										<button
											type='button'
											className='text-basic_text hover:text-text_primary'
											title='Copy address'
										>
											<Copy size={14} />
										</button>
									</div>
								</td>
								<td className='px-6 py-4'>
									<SocialLinksDisplay socials={identity.socials} />
								</td>
								<td className='px-6 py-4'>
									<span className='rounded px-2 py-1 text-sm font-semibold text-text_primary'>{identity.type}</span>
								</td>
								<td className='px-6 py-4'>
									<div className='flex items-center gap-2 text-sm font-semibold text-text_primary'>
										<LastUpdateCell address={identity.address} />
										<UpdateHistoryButton onClick={() => setSelectedAddressForTimeline({ address: identity.address, displayName: identity.displayName })} />
									</div>
								</td>
								<td className='px-6 py-4'>
									{identity.judgements.length > 0 ? (
										<div className='flex items-center gap-1'>
											<span className='rounded px-2 py-1 text-sm font-semibold text-text_primary'>Reasonable</span>
											{identity.judgements.length > 1 && (
												<Tooltip>
													<TooltipTrigger asChild>
														<span className='flex !size-6 items-center justify-center rounded-full border border-primary_border bg-poll_option_bg p-2 text-xs font-medium text-text_primary'>
															+{identity.judgements.length - 1}
														</span>
													</TooltipTrigger>
													<TooltipContent
														side='top'
														align='center'
														className='bg-tooltip_background'
													>
														<div className='flex flex-col gap-2 p-2'>
															<span className='text-xs text-white'>{identity.judgements.join(', ')}</span>
														</div>
													</TooltipContent>
												</Tooltip>
											)}
										</div>
									) : (
										<span className='px-4 text-center font-semibold text-text_primary'>-</span>
									)}
								</td>
								<td className='px-6 py-4'>
									<div className='flex items-center gap-2'>
										{identity.canEdit && (
											<button
												onClick={() => handleEdit(identity.address)}
												className='text-text_pink hover:text-text_pink/80'
												type='button'
												title='Edit'
											>
												<PencilIcon size={16} />
											</button>
										)}
										{identity.canDelete && (
											<button
												onClick={() => handleDeleteIdentity(identity.address, identity.type === SUB_IDENTITY_TYPE)}
												className='text-red-500 hover:text-red-600 disabled:opacity-50'
												type='button'
												title={identity.type === SUB_IDENTITY_TYPE ? 'Remove Sub-identity' : 'Clear Identity'}
												disabled={isDeleting === identity.address}
											>
												{isDeleting === identity.address ? <span>⏳</span> : <Trash2 size={16} />}
											</button>
										)}
										<button
											className='text-text_pink hover:text-text_pink/80'
											type='button'
											title='Settings'
										>
											<Settings size={16} />
										</button>
									</div>
								</td>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<IdentityTimelineDialog
				selectedAddress={selectedAddressForTimeline}
				onClose={() => setSelectedAddressForTimeline(null)}
			/>
		</div>
	);
}

export default MyIdentitiesDashboard;
