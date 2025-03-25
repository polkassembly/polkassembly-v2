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
import { useState } from 'react';
import identityIcon from '@assets/icons/identity.svg';
import { useToast } from '@/hooks/useToast';
import { NotificationType } from '@/_shared/types';
import { Loader2 } from 'lucide-react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { TfiPencil } from 'react-icons/tfi';

export default function BecomeDelegateDialog() {
	const { user } = useUser();
	const t = useTranslations('Delegation');
	const { toast } = useToast();
	const [bio, setBio] = useState('');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [address, setAddress] = useState<string | null>(user?.defaultAddress || null);
	const [isDelegated, SetIsDelegated] = useState(false);

	const checkDelegate = async () => {
		if (!address) return;
		const delegate = await NextApiClientService.getDelegateByAddress(address);
		if (delegate.data) {
			SetIsDelegated(true);
			setBio(delegate.data.bio);
		}
	};

	const { isFetching } = useQuery({
		queryKey: ['delegate', address],
		queryFn: checkDelegate,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const createDelegate = async () => {
		if (!user || !address) return;
		setLoading(true);
		if (isDelegated) {
			await NextApiClientService.updateDelegate(address, bio, user.username);
		} else {
			await NextApiClientService.createDelegate(address, bio, user.username);
		}
		toast({
			title: 'Delegate created successfully',
			status: NotificationType.SUCCESS
		});
		setLoading(false);
		setDialogOpen(false);
	};

	return (
		<Dialog
			open={dialogOpen}
			onOpenChange={() => {
				setAddress(user?.defaultAddress || null);
				setBio('');
			}}
		>
			<DialogTrigger asChild>
				<div>
					<Button
						disabled={!user || isFetching}
						onClick={() => setDialogOpen(true)}
						className={`${!user ? 'cursor-not-allowed opacity-50' : ''}`}
					>
						{isDelegated ? (
							<span className='flex items-center gap-x-2 text-text_pink'>
								<TfiPencil />
								Edit
							</span>
						) : (
							t('becomeDelegate')
						)}
					</Button>
				</div>
			</DialogTrigger>
			<DialogContent className='max-w-xl p-6'>
				<DialogHeader>
					<DialogTitle> {isDelegated ? 'Edit Delegate Details' : t('becomeDelegate')}</DialogTitle>
				</DialogHeader>
				<div className='flex flex-col gap-y-4'>
					<AddressDropdown
						withBalance
						onChange={(account) => setAddress(account.address)}
					/>
					<div className='flex flex-col gap-y-2'>
						<p className='text-sm text-wallet_btn_text'>
							Your Delegation Mandate <span className='text-text_pink'>*</span>
						</p>
						<Input
							title='Your Delegation Mandate'
							placeholder='Add message for delegate address '
							className='w-full'
							required
							value={bio}
							onChange={(e) => setBio(e.target.value)}
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
						onClick={createDelegate}
					>
						{loading ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Confirm'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
