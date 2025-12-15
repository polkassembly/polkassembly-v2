// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ENotificationStatus } from '@/_shared/types';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '@/app/_shared-components/Table';
import { useUser } from '@/hooks/useUser';
import { Settings, Trash2, Copy, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { Separator } from '@/app/_shared-components/Separator';
import JudgementRequestedIcon from '@assets/icons/judgement-requests.svg';
import JudgementCompletedIcon from '@assets/icons/judgements-completed.svg';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { useToast } from '@/hooks/useToast';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
import { BN } from '@polkadot/util';
import { useRouter } from 'next/navigation';
import LoaderGif from '@/app/_shared-components/LoaderGif/LoaderGif';
import { SocialLinksDisplay } from '../Overview/IdentityComponents';
import styles from '../Overview/IdentitiesListingTable.module.scss';

const SUB_IDENTITY_TYPE = 'Sub-identity';

function MyIdentitiesDashboard() {
	const { identityService } = useIdentityService();
	const { user } = useUser();
	const network = getCurrentNetwork();
	const router = useRouter();
	const t = useTranslations();
	const { userPreferences } = useUserPreferences();
	const queryClient = useQueryClient();
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const { setVaultQrState } = usePolkadotVault();
	const { toast } = useToast();
	const { data: myIdentities, isLoading } = useQuery({
		queryKey: ['myIdentities', user?.defaultAddress, identityService],
		queryFn: async () => {
			if (!identityService || !user?.defaultAddress) return null;

			const data = await identityService.getUserIdentityDashboardData(user.defaultAddress);

			return {
				...data,
				lastUpdatedOn: BlockCalculationsService.getDateFromBlockNumber({
					currentBlockNumber: new BN(data.lastUpdatedBlock || 0),
					targetBlockNumber: new BN(data.lastUpdatedBlock || 0),
					network
				})
			};
		},
		enabled: !!identityService && !!user?.defaultAddress,
		staleTime: 30000
	});

	const handleEdit = (address: string) => {
		router.push(`/set-identity?address=${address}`);
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
		return <LoaderGif />;
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
			<div className={styles.container}>
				<div className='flex w-full flex-col gap-x-4 gap-y-4 md:flex-row md:items-center md:justify-between lg:w-4/5'>
					<div className={styles.statsContainer}>
						<Image
							src={JudgementRequestedIcon}
							alt='Judgement Requests'
							width={50}
							height={50}
						/>
						<div className={styles.statsContent}>
							<p className={styles.statsLabel}>{t('Judgements.mySubIdentities')}</p>
							<div className={styles.statsValue}>
								<p className='text-2xl font-bold text-text_primary'>{myIdentities?.totalSubIdentities || 0}</p>
							</div>
						</div>
					</div>
					<Separator
						orientation='vertical'
						className='hidden h-11 md:block'
					/>
					<div className={styles.statsContainer}>
						<Image
							src={JudgementCompletedIcon}
							alt='Judgement'
							width={50}
							height={50}
						/>
						<div className={styles.statsContent}>
							<p className={styles.statsLabel}>{t('Judgements.judgements')}</p>
							<div className={styles.statsValue}>
								<p className='text-2xl font-bold text-text_primary'>{myIdentities?.totalJudgements || 0}</p>
							</div>
						</div>
					</div>
					<Separator
						orientation='vertical'
						className='hidden h-11 md:block'
					/>
					<div className={styles.statsContainer}>
						<Image
							src={JudgementCompletedIcon}
							alt='Balance'
							width={50}
							height={50}
						/>
						<div className={styles.statsContent}>
							<p className={styles.statsLabel}>{t('Profile.balance')}</p>
							<div className={styles.statsValue}>
								<div className='flex items-baseline gap-2'>
									<p className='text-2xl font-bold text-text_primary'>
										{formatBnBalance(
											myIdentities?.totalBalance || '0',
											{
												withUnit: true,
												numberAfterComma: 2,
												compactNotation: true
											},
											network
										)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className='mt-4 w-full rounded-3xl border border-primary_border bg-bg_modal p-6'>
				<Table>
					<TableHeader>
						<TableRow className={styles.headerRow}>
							<TableHead className={styles.headerCell}>IDENTITY</TableHead>
							<TableHead className={styles.headerCell}>SOCIALS</TableHead>
							<TableHead className={styles.headerCell}>TYPE</TableHead>
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
											onClick={() => navigator.clipboard.writeText(identity.address)}
										>
											<Copy size={14} />
										</button>
									</div>
								</td>
								<td className='px-6 py-4'>
									<SocialLinksDisplay socials={identity.socials} />
								</td>
								<td className='px-6 py-4'>
									<span className='rounded px-2 py-1 text-sm font-semibold text-text_primary'>{t('Judgements.reasonable')}</span>
								</td>
								<td className='px-6 py-4'>
									{identity.judgements.length > 0 ? (
										<div className='flex items-center gap-1'>
											<span className='rounded px-2 py-1 text-sm font-semibold text-text_primary'>{t('Judgements.reasonable')}</span>
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
		</div>
	);
}

export default MyIdentitiesDashboard;
