// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useWalletService } from '@/hooks/useWalletService';
import { EAccountType, IMultisigAddress, IProxyAddress } from '@/_shared/types';
import { useUser } from '@/hooks/useUser';
import Address from '../Profile/Address/Address';
import { Skeleton } from '../Skeleton';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../Dialog/Dialog';
import SwitchWalletOrAddress from './SwitchWalletOrAddress';

interface IAddressRadioGroupProps {
	groupName: string;
	addresses: IMultisigAddress[] | IProxyAddress[];
}

function AddressRadioGroup({ groupName, addresses }: IAddressRadioGroupProps) {
	return (
		<>
			<hr className='my-3' />

			<section>
				<h6 className='text-text_secondary capitalize'>{groupName}</h6>
				{!addresses.length && <p className='text-text_secondary text-sm'>No {groupName} found</p>}
				<div>
					{addresses.map((address) => (
						<>
							<p key={address.address}>{address.address}</p>
							{'pureProxies' in address && address.pureProxies.map((pureProxyAddress) => <p className='ml-2'>{pureProxyAddress.address}</p>)}
						</>
					))}
				</div>
			</section>
		</>
	);
}

function AddressSwitchButton() {
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();

	const selectedAddress = userPreferences?.selectedAccount?.address;
	const relationsForSelectedAddress = user?.addressRelations?.find((relations) => relations.address === selectedAddress);

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

				{relationsForSelectedAddress ? (
					<>
						<AddressRadioGroup
							groupName='multisigs'
							addresses={relationsForSelectedAddress?.multisigAddresses || []}
						/>
						<AddressRadioGroup
							groupName='proxies'
							addresses={relationsForSelectedAddress?.proxyAddresses || []}
						/>
					</>
				) : (
					<>
						<Skeleton className='my-3 h-6 w-full' />
						<Skeleton className='my-3 h-6 w-full' />
						<Skeleton className='my-3 h-6 w-full' />
						<Skeleton className='my-3 h-6 w-full' />
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default function AddressRelationsPicker() {
	const { userPreferences, setUserPreferences } = useUserPreferences();
	const walletService = useWalletService();
	const [accountsLoading, setAccountsLoading] = useState(true);

	const getAccounts = useCallback(async () => {
		if (!walletService || !userPreferences?.wallet) return;

		const injectedAccounts = await walletService?.getAddressesFromWallet(userPreferences.wallet);

		if (injectedAccounts.length === 0) {
			setAccountsLoading(false);
			return;
		}

		if (userPreferences?.selectedAccount?.address) {
			setAccountsLoading(false);
			return;
		}

		setUserPreferences({
			...userPreferences,
			selectedAccount: {
				...injectedAccounts[0],
				accountType: EAccountType.REGULAR
			}
		});

		setAccountsLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userPreferences?.wallet, walletService]);

	useEffect(() => {
		getAccounts();
	}, [getAccounts]);

	const selectedAddress = userPreferences?.selectedAccount?.address;
	const walletAddressName = userPreferences?.selectedAccount?.name;

	return (
		<div className='flex items-center gap-2 rounded border border-primary_border p-2'>
			{accountsLoading || !selectedAddress ? (
				<Skeleton className='h-6 w-32' />
			) : (
				<Address
					address={selectedAddress}
					walletAddressName={walletAddressName}
					iconSize={25}
					redirectToProfile={false}
					disableTooltip
					className='w-full px-2'
				/>
			)}
			<AddressSwitchButton />
		</div>
	);
}
