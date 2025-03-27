// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogDescription } from '@ui/Dialog/Dialog';
import { Button } from '@/app/_shared-components/Button';
import AddressInput from '@/app/_shared-components/AddressInput/AddressInput';
import { IoPersonAdd } from 'react-icons/io5';
import { Label } from '@/app/_shared-components/Label';
import BalanceInput from '@/app/_shared-components/BalanceInput/BalanceInput';
import { Separator } from '@/app/_shared-components/Separator';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface DelegateDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	delegate: { address: string };
	children?: ReactNode;
}

function DelegateDialog({ open, setOpen, delegate, children }: DelegateDialogProps) {
	const { user } = useUser();
	const t = useTranslations('Delegation');
	const router = useRouter();

	const handleOpenChange = (isOpen: boolean) => {
		if (!user) {
			router.push('/login');
		} else {
			setOpen(isOpen);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='max-w-2xl p-6'>
				<DialogHeader>
					<div className='flex items-center gap-2 text-btn_secondary_text'>
						<IoPersonAdd />
						<span>{t('delegate')}</span>
					</div>
				</DialogHeader>
				<DialogDescription>
					<div className='flex flex-col gap-4'>
						<Label>Your Address</Label>
						<AddressInput
							disabled
							className='bg-network_dropdown_bg'
							placeholder={user?.defaultAddress}
						/>
						<Label>Delegate To</Label>
						<AddressInput value={delegate.address} />
						<BalanceInput
							showBalance
							label='Balance'
						/>
					</div>
				</DialogDescription>
				<Separator
					className='mt-5 w-full'
					orientation='horizontal'
				/>
				<DialogFooter>
					<Button
						variant='secondary'
						className='btn-cancel'
						onClick={() => setOpen(false)}
					>
						Cancel
					</Button>
					<Button className='btn-delegate'>Delegate</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default DelegateDialog;
