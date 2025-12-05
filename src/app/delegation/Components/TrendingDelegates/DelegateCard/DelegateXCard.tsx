// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { IoPersonAdd } from '@react-icons/all-files/io5/IoPersonAdd';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Button } from '@/app/_shared-components/Button';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { IDelegateXAccount, EWallet, ENotificationStatus } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Pencil } from 'lucide-react';
import DelegateXBotGif from '@assets/delegation/klara/klara.gif';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useAtom } from 'jotai';
import { delegateXAtom } from '@/app/_atoms/delegateX/delegateXAtom';
import { usePolkadotVault } from '@/hooks/usePolkadotVault';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/useToast';
import { DelegateXClientService } from '@/app/_client-services/delegate_x_client_service';
import { DELEGATE_X_TRACKS } from '@/_shared/_constants/delegateXTracks';
import EditDelegateXDialog from '../../DelegateXSetupDialog/EditDelegateXDialog';
import DelegateXSetupDialog from '../../DelegateXSetupDialog/DelegateXSetupDialog';
import styles from './DelegateCard.module.scss';
import DelegateXStats from '../../DelegateXSetupDialog/components/DelegateXStats';

interface IDelegateXCardProps {
	data: {
		address: string;
		bio: string;
		votesPast30Days: number;
		votingPower: string;
		ayeCount: number;
		nayCount: number;
		abstainCount: number;
		totalVotingPower: string;
		totalVotesPast30Days: number;
		totalDelegators: number;
	};
	delegateXAccount: IDelegateXAccount | null;
	onRefresh?: (delegateXAccount: IDelegateXAccount) => void;
	isLoading?: boolean;
}

const DelegateXCard = memo(({ data, delegateXAccount, onRefresh, isLoading = false }: IDelegateXCardProps) => {
	const { user } = useUser();
	const t = useTranslations('Delegation');
	const currentNetwork = getCurrentNetwork();
	const network = NETWORKS_DETAILS[currentNetwork];

	const [openModal, setOpenModal] = useState(false);
	const [openSetupDialog, setOpenSetupDialog] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editStep, setEditStep] = useState(1);
	const [isEditMode, setIsEditMode] = useState(false);
	const [delegateXState, setDelegateXState] = useAtom(delegateXAtom);
	const { apiService } = usePolkadotApiService();
	const { setVaultQrState } = usePolkadotVault();
	const { userPreferences } = useUserPreferences();
	const { toast } = useToast();
	const handleEditStrategy = () => {
		setOpenEditDialog(false);
		setEditStep(3);
		setIsEditMode(true);
		setOpenSetupDialog(true);
	};

	const handleEditPersonality = () => {
		setOpenEditDialog(false);
		setEditStep(4);
		setIsEditMode(true);
		setOpenSetupDialog(true);
	};

	const handleUndelegate = async () => {
		if (!delegateXState.account) {
			toast({
				title: t('delegateXNotActive'),
				description: t('delegateXNotActiveDescription'),
				status: ENotificationStatus.ERROR
			});
			return;
		}
		await apiService?.undelegateForDelegateX({
			address: userPreferences.selectedAccount?.address || '',
			wallet: userPreferences.wallet as EWallet,
			tracks: DELEGATE_X_TRACKS.spender,
			onSuccess: async () => {
				await DelegateXClientService.updateDelegateXAccount({ ...delegateXState.account, votingPower: '0', active: false });
				toast({
					title: t('delegateXUndelegatedSuccessfully'),
					description: t('delegateXUndelegatedSuccessfullyDescription'),
					status: ENotificationStatus.SUCCESS
				});
				setOpenEditDialog(false);
				setDelegateXState((prev) => ({
					...prev,
					account: {
						...prev.account,
						active: false,
						votingPower: '0'
					} as IDelegateXAccount
				}));
			},
			onFailed: (error: string) => {
				toast({
					title: t('errorUndelegatingDelegateX'),
					description: error,
					status: ENotificationStatus.ERROR
				});
			},
			setVaultQrState
		});
	};

	return (
		<div className={styles.delegateXCardWrapper}>
			<Image
				className={styles.delegateXGif}
				src={DelegateXBotGif}
				alt={data.address}
				width={95}
				height={95}
				priority
			/>
			<div className='flex gap-2 rounded-t-md border-b border-wallet_btn_text py-1'>
				<div className='flex items-center gap-1 px-2 lg:gap-2 lg:px-4'>
					<p className='text-medium pl-12 text-xs text-btn_secondary_text'>
						Built on{' '}
						<Link
							href='/'
							className='cursor-pointer text-text_pink underline'
						>
							CyberGov
						</Link>{' '}
						Powered by <span className='font-semibold'>Klara</span>
					</p>
				</div>{' '}
			</div>
			<div className={styles.delegateXCard}>
				<div className='px-4 pt-4'>
					<div className={styles.delegationDialog}>
						<div className='min-w-32'>{isLoading ? <Skeleton className='h-6 w-32' /> : <Address address={data.address} />}</div>

						{user?.id ? (
							<>
								<Button
									variant='ghost'
									disabled={isLoading}
									className='flex items-center gap-x-2 text-sm font-medium text-text_pink'
									onClick={() => {
										if (delegateXAccount && delegateXAccount.active) {
											setOpenEditDialog(true);
										} else {
											setIsEditMode(false);
											setEditStep(1);
											setOpenSetupDialog(true);
										}
									}}
								>
									{delegateXAccount && delegateXAccount.active ? <Pencil /> : <IoPersonAdd />}
									<span>{delegateXAccount && delegateXAccount.active ? 'Edit' : t('delegate')}</span>
								</Button>
								<DelegateXSetupDialog
									key={`${delegateXAccount?.strategyId}-${delegateXAccount?.contactLink}-${delegateXAccount?.signatureLink}-${delegateXAccount?.votingPower}-${delegateXAccount?.prompt}`}
									open={openSetupDialog}
									onOpenChange={setOpenSetupDialog}
									isEditMode={isEditMode}
									initialStep={editStep}
									networkSymbol={network?.tokenSymbol}
									onSuccess={onRefresh}
									initialData={
										delegateXAccount
											? {
													selectedStrategy: delegateXAccount.strategyId,
													contact: delegateXAccount.contactLink,
													signature: delegateXAccount.signatureLink,
													includeComment: delegateXAccount.includeComment,
													votingPower: delegateXAccount.votingPower,
													prompt: delegateXAccount.prompt
												}
											: {}
									}
								/>
								<EditDelegateXDialog
									open={openEditDialog}
									onOpenChange={setOpenEditDialog}
									onEditStrategy={handleEditStrategy}
									onEditPersonality={handleEditPersonality}
									onUndelegate={handleUndelegate}
								/>
							</>
						) : (
							<Link
								href='/login'
								className='flex items-center gap-x-2 text-sm font-medium text-text_pink'
							>
								<IoPersonAdd />
								<span>{t('delegate')}</span>
							</Link>
						)}
					</div>
				</div>

				<div className='px-4 pb-2 pt-2'>
					{isLoading ? (
						<div className='space-y-2'>
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-3/4' />
						</div>
					) : (
						<MarkdownViewer
							markdown={data.bio}
							truncate
							onShowMore={() => setOpenModal(true)}
							className='line-clamp-2'
						/>
					)}
				</div>

				<DelegateXStats
					data={data}
					networkSymbol={network?.tokenSymbol}
					isBotSetup={!!delegateXAccount}
					isLoading={isLoading}
				/>

				<Dialog
					open={openModal}
					onOpenChange={setOpenModal}
				>
					<DialogContent className='max-w-xl p-6'>
						<DialogHeader>
							<DialogTitle>
								<Address address={data.address} />
							</DialogTitle>
						</DialogHeader>

						<MarkdownViewer
							className='max-h-[70vh] overflow-y-auto'
							markdown={data.bio}
						/>

						<DelegateXStats
							data={data}
							networkSymbol={network?.tokenSymbol}
							isBotSetup={!!delegateXAccount}
						/>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
});

export default DelegateXCard;
