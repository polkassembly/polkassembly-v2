// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { Button } from '@/app/_shared-components/Button';
import { useUser } from '@/hooks/useUser';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useState, useEffect, useRef } from 'react';
import identityIcon from '@assets/delegation/identity.svg';
import { useToast } from '@/hooks/useToast';
import { ENotificationStatus, ENetwork, IDelegateDetails, EDelegateSource } from '@/_shared/types';
import { AiOutlineInfoCircle } from '@react-icons/all-files/ai/AiOutlineInfoCircle';
import Image from 'next/image';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { TfiPencil } from 'react-icons/tfi';
import { useAtom } from 'jotai';
import { delegatesAtom } from '@/app/_atoms/delegation/delegationAtom';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import WalletButtons from '@/app/_shared-components/WalletsUI/WalletButtons/WalletButtons';
import { MarkdownEditor } from '@/app/_shared-components/MarkdownEditor/MarkdownEditor';
import { MDXEditorMethods } from '@mdxeditor/editor';
import styles from './BecomeDelegateDialog.module.scss';

const ERROR_UNKNOWN = 'An unknown error occurred';

export default function BecomeDelegateDialog() {
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const t = useTranslations('Delegation');
	const network = getCurrentNetwork();
	const { toast } = useToast();
	const [manifesto, setManifesto] = useState('');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [delegates, setDelegates] = useAtom(delegatesAtom);
	const [isCurrentAddressDelegate, setIsCurrentAddressDelegate] = useState(false);

	const markdownEditorRef = useRef<MDXEditorMethods | null>(null);

	const queryClient = useQueryClient();

	useEffect(() => {
		if (!userPreferences?.address?.address) return;

		const existingDelegate = delegates.find((delegate) => delegate.address === userPreferences?.address?.address);
		setIsCurrentAddressDelegate(!!existingDelegate);
		if (existingDelegate) {
			setManifesto(existingDelegate.manifesto || '');
		} else {
			setManifesto('');
		}
	}, [user, delegates, userPreferences?.address?.address]);

	const createDelegate = async () => {
		if (!userPreferences?.address?.address) return;
		setLoading(true);
		try {
			const optimisticDelegate: IDelegateDetails = {
				address: userPreferences.address.address,
				manifesto,
				sources: [EDelegateSource.POLKASSEMBLY],
				votingPower: '0',
				last30DaysVotedProposalsCount: 0,
				receivedDelegationsCount: 0,
				network: network as ENetwork
			};

			setDelegates((prev) => [...prev, optimisticDelegate]);
			await NextApiClientService.createPADelegate({ address: userPreferences.address.address, manifesto });
			queryClient.invalidateQueries({ queryKey: ['delegates'] });
			toast({
				title: t('delegateCreatedSuccessfully'),
				status: ENotificationStatus.SUCCESS
			});
			setDialogOpen(false);
		} catch (error) {
			setDelegates((prev) => prev.filter((d) => d.address !== userPreferences?.address?.address));
			toast({
				title: t('errorCreatingDelegate'),
				status: ENotificationStatus.ERROR,
				description: error instanceof Error ? error.message : ERROR_UNKNOWN
			});
		} finally {
			setLoading(false);
		}
	};

	const updateDelegate = async () => {
		if (!userPreferences?.address?.address) return;
		setLoading(true);
		try {
			setDelegates((prev) => prev.map((d) => (d.address === userPreferences?.address?.address ? { ...d, manifesto } : d)));
			await NextApiClientService.updatePADelegate({ address: userPreferences.address.address, manifesto });
			queryClient.invalidateQueries({ queryKey: ['delegates'] });
			toast({
				title: t('delegateUpdatedSuccessfully'),
				status: ENotificationStatus.SUCCESS
			});
			setDialogOpen(false);
		} catch (error) {
			queryClient.invalidateQueries({ queryKey: ['delegates'] });
			toast({
				title: 'Error updating delegate',
				status: ENotificationStatus.ERROR,
				description: error instanceof Error ? error.message : ERROR_UNKNOWN
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			open={dialogOpen}
			onOpenChange={(open) => {
				setDialogOpen(open);
			}}
		>
			<DialogTrigger asChild>
				<Button
					disabled={!user || delegates.length === 0}
					className={`${!user || delegates.length === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
				>
					{isCurrentAddressDelegate ? (
						<>
							<TfiPencil />
							{t('edit')}
						</>
					) : (
						<>{t('becomeDelegate1')}</>
					)}
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-max overflow-x-hidden p-6'>
				<DialogHeader>
					<DialogTitle>{isCurrentAddressDelegate ? t('editDelegate') : t('becomeDelegate')}</DialogTitle>
				</DialogHeader>

				<div className='flex flex-col gap-y-4'>
					<div className='flex max-h-[75vh] flex-col gap-y-4 overflow-y-auto'>
						<WalletButtons small />
						<AddressDropdown withBalance />
						<div className='flex flex-col gap-y-2'>
							<p className='text-sm text-wallet_btn_text'>
								{t('delegationManifesto')} <span className='text-text_pink'>*</span>
							</p>

							<div className='max-w-xl'>
								<MarkdownEditor
									markdown={manifesto}
									placeholder={t('addMessageForDelegateAddress')}
									onChange={(value) => setManifesto(value)}
									ref={markdownEditorRef}
								/>
							</div>
						</div>
						<div className={styles.infoContainer}>
							<AiOutlineInfoCircle className='text-lg text-toast_info_border' />
							<span className={styles.infoText}>
								{t('addSocialsToDelegateProfile')}
								<Link
									href='/set-identity'
									onClick={() => setDialogOpen(false)}
									className={styles.link}
								>
									<Image
										src={identityIcon}
										alt='Polkassembly'
										width={16}
										height={16}
									/>{' '}
									{t('setIdentity')}
								</Link>{' '}
								{t('withPolkassembly')}
							</span>
						</div>
					</div>

					<Button
						size='lg'
						disabled={!user || !manifesto || !userPreferences?.address?.address}
						isLoading={loading}
						className='w-full'
						onClick={isCurrentAddressDelegate ? updateDelegate : createDelegate}
					>
						{t('confirm')}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
