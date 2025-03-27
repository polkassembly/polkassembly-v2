// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { Button } from '@/app/_shared-components/Button';
import { useUser } from '@/hooks/useUser';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog/Dialog';
import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import { Input } from '@/app/_shared-components/Input';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useState, useEffect } from 'react';
import identityIcon from '@assets/delegation/identity.svg';
import { useToast } from '@/hooks/useToast';
import { NotificationType, ENetwork, IDelegateDetails, EDelegateSource } from '@/_shared/types';
import { Loader2 } from 'lucide-react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import Image from 'next/image';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { TfiPencil } from 'react-icons/tfi';
import { useAtom } from 'jotai';
import { delegatesAtom } from '@/app/_atoms/delegation/delegationAtom';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';

const ERROR_UNKNOWN = 'An unknown error occurred';

export default function BecomeDelegateDialog() {
	const { user } = useUser();
	const t = useTranslations('Delegation');
	const { toast } = useToast();
	const [manifesto, setManifesto] = useState('');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [checkingDelegate, setCheckingDelegate] = useState(false);
	const [address, setAddress] = useState<string | null>(user?.defaultAddress || null);
	const [delegates, setDelegates] = useAtom(delegatesAtom);
	const [isCurrentAddressDelegate, setIsCurrentAddressDelegate] = useState(false);

	const queryClient = useQueryClient();
	const network = getCurrentNetwork();

	const checkExistingDelegate = async () => {
		if (!address) return;

		setCheckingDelegate(true);
		try {
			const existingDelegate = delegates.find((delegate) => delegate.address === address);
			setIsCurrentAddressDelegate(!!existingDelegate);
			if (existingDelegate) {
				setManifesto(existingDelegate.manifesto || '');
			} else {
				setManifesto('');
			}
		} catch (error) {
			console.error('Error checking delegate status:', error);
			toast({
				title: 'Error checking delegate status',
				status: NotificationType.ERROR,
				description: error instanceof Error ? error.message : ERROR_UNKNOWN
			});
		} finally {
			setCheckingDelegate(false);
		}
	};

	useEffect(() => {
		if (dialogOpen) {
			checkExistingDelegate();
		} else {
			setIsCurrentAddressDelegate(false);
		}
	}, [address, dialogOpen, delegates]);

	const createDelegate = async () => {
		if (!user || !address) return;
		setLoading(true);
		try {
			const optimisticDelegate: IDelegateDetails = {
				address,
				manifesto,
				sources: [EDelegateSource.POLKASSEMBLY],
				votingPower: '0',
				last30DaysVotedProposalsCount: 0,
				receivedDelegationsCount: 0,
				network: network as ENetwork
			};

			setDelegates((prev) => [...prev, optimisticDelegate]);
			await NextApiClientService.createPADelegate({ address, manifesto });
			queryClient.invalidateQueries({ queryKey: ['delegates'] });
			toast({
				title: 'Delegate created successfully',
				status: NotificationType.SUCCESS
			});
			setDialogOpen(false);
		} catch (error) {
			setDelegates((prev) => prev.filter((d) => d.address !== address));
			toast({
				title: 'Error creating delegate',
				status: NotificationType.ERROR,
				description: error instanceof Error ? error.message : ERROR_UNKNOWN
			});
		} finally {
			setLoading(false);
		}
	};

	const updateDelegate = async () => {
		if (!user || !address) return;
		setLoading(true);
		try {
			setDelegates((prev) => prev.map((d) => (d.address === address ? { ...d, manifesto } : d)));
			await NextApiClientService.updatePADelegate({ address, manifesto });
			queryClient.invalidateQueries({ queryKey: ['delegates'] });
			toast({
				title: 'Delegate updated successfully',
				status: NotificationType.SUCCESS
			});
			setDialogOpen(false);
		} catch (error) {
			queryClient.invalidateQueries({ queryKey: ['delegates'] });

			toast({
				title: 'Error updating delegate',
				status: NotificationType.ERROR,
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
				if (!open) {
					setAddress(user?.defaultAddress || null);
					setManifesto('');
					setIsCurrentAddressDelegate(false);
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					disabled={!user || checkingDelegate}
					onClick={() => setDialogOpen(true)}
					className={`${!user || checkingDelegate ? 'cursor-not-allowed opacity-50' : ''}`}
				>
					{checkingDelegate ? (
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
					) : isCurrentAddressDelegate ? (
						<>
							<TfiPencil />
							Edit
						</>
					) : (
						t('becomeDelegate')
					)}
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-xl p-6'>
				<DialogHeader>
					<DialogTitle>
						{checkingDelegate ? (
							<div className='flex items-center gap-2'>
								<Loader2 className='h-4 w-4 animate-spin' />
								Checking delegate status...
							</div>
						) : isCurrentAddressDelegate ? (
							'Edit Delegate Details'
						) : (
							t('becomeDelegate')
						)}
					</DialogTitle>
				</DialogHeader>
				{checkingDelegate ? (
					<div className='flex h-40 items-center justify-center'>
						<Loader2 className='h-8 w-8 animate-spin' />
					</div>
				) : (
					<div className='flex flex-col gap-y-4'>
						<AddressDropdown
							withBalance
							onChange={(account) => setAddress(account.address)}
						/>
						<div className='flex flex-col gap-y-2'>
							<p className='text-sm text-wallet_btn_text'>
								Your Delegation Manifesto <span className='text-text_pink'>*</span>
							</p>
							<Input
								title='Your Delegation Mandate'
								placeholder='Add message for delegate address '
								className='w-full'
								required
								value={manifesto}
								onChange={(e) => setManifesto(e.target.value)}
							/>
						</div>
						<div className='flex items-center gap-x-2 rounded-md bg-bg_light_blue p-3 text-sm text-text_primary'>
							<AiOutlineInfoCircle className='text-toast_info_border' />
							<span className='flex items-center gap-x-2 text-xs'>
								To add socials to your delegate profile{' '}
								<Link
									href='/set-identity'
									className='flex items-center gap-x-1 text-text_pink'
								>
									<Image
										src={identityIcon}
										alt='Polkassembly'
										width={16}
										height={16}
									/>{' '}
									Set Identity
								</Link>{' '}
								with Polkassembly
							</span>
						</div>

						<Button
							size='lg'
							disabled={loading}
							className='w-full'
							onClick={isCurrentAddressDelegate ? updateDelegate : createDelegate}
						>
							{loading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Confirm'}
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
