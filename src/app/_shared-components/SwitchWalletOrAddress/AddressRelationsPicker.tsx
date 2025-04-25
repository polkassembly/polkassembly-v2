// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useEffect } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useWalletService } from '@/hooks/useWalletService';
import { EAccountType } from '@/_shared/types';
import Address from '../Profile/Address/Address';
import { Skeleton } from '../Skeleton';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../Dialog/Dialog';
import SwitchWalletOrAddress from './SwitchWalletOrAddress';

function AddressSwitchButton() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					size='sm'
					className='ml-auto'
				>
					Switch
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-xl p-3 sm:p-6'>
				<DialogHeader className='text-xl font-semibold text-text_primary'>
					<DialogTitle>Switch Wallet</DialogTitle>
				</DialogHeader>
				<SwitchWalletOrAddress small />
			</DialogContent>
		</Dialog>
	);
}

function AddressRelationsPicker() {
	const { userPreferences, setUserPreferences } = useUserPreferences();
	const walletService = useWalletService();

	const getAccounts = useCallback(async () => {
		if (!walletService || !userPreferences?.wallet) return;

		const injectedAccounts = await walletService?.getAddressesFromWallet(userPreferences.wallet);

		if (injectedAccounts.length === 0) {
			return;
		}

		setUserPreferences({
			...userPreferences,
			selectedAccount: {
				...injectedAccounts[0],
				accountType: EAccountType.REGULAR
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userPreferences?.wallet, walletService]);

	useEffect(() => {
		getAccounts();
	}, [getAccounts]);

	const selectedAddress = userPreferences?.selectedAccount?.address;
	const walletAddressName = userPreferences?.selectedAccount?.name;

	return (
		<div className='flex items-center gap-2 rounded border border-primary_border p-2'>
			{selectedAddress ? (
				<Address
					address={selectedAddress}
					walletAddressName={walletAddressName}
					iconSize={25}
					redirectToProfile={false}
					disableTooltip
					className='w-full px-2'
				/>
			) : (
				<Skeleton className='h-6 w-32' />
			)}
			<AddressSwitchButton />
		</div>
	);
}

export default AddressRelationsPicker;
