// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useWalletService } from '@/hooks/useWalletService';
import { EAccountType, IMultisigAddress, IProxyAddress, ISelectedAccount } from '@/_shared/types';
import { useUser } from '@/hooks/useUser';
import { ChevronDown } from 'lucide-react';
import Address from '../Profile/Address/Address';
import { Skeleton } from '../Skeleton';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../Dialog/Dialog';
import SwitchWalletOrAddress from './SwitchWalletOrAddress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../Collapsible';
import { RadioGroup, RadioGroupItem } from '../RadioGroup/RadioGroup';
import { Label } from '../Label';

interface IAddressRadioGroupProps {
	accountType: EAccountType;
	addresses: IMultisigAddress[] | IProxyAddress[];
	defaultOpen?: boolean;
	closeDialog?: () => void;
}

function AddressRadioGroup({ accountType, addresses, defaultOpen = false, closeDialog }: IAddressRadioGroupProps) {
	const [selectedAddress, setSelectedAddress] = useState<string>('');
	const { userPreferences, setUserPreferences } = useUserPreferences();

	const handleAddressChange = (address: string) => {
		setSelectedAddress(address);

		// First check if it's a regular address in the provided addresses array
		const regularAddress = addresses.find((addr) => addr.address === address);

		if (regularAddress) {
			// Handle regular address selection
			const newSelectedAccount: ISelectedAccount = {
				address: regularAddress.address,
				accountType,
				parent: userPreferences?.selectedAccount,
				...('signatories' in regularAddress && { signatories: regularAddress.signatories }),
				...('threshold' in regularAddress && { threshold: regularAddress.threshold })
			};

			setUserPreferences({
				...userPreferences,
				selectedAccount: newSelectedAccount
			});
		} else {
			// Handle pure proxy selection
			// eslint-disable-next-line no-restricted-syntax
			for (const addr of addresses) {
				if ('pureProxies' in addr) {
					const pureProxy = addr.pureProxies.find((proxy) => proxy.address === address);
					if (pureProxy) {
						// Create parent account for the pure proxy
						const parentAccount: ISelectedAccount = {
							address: addr.address,
							accountType: EAccountType.MULTISIG,
							signatories: addr.signatories,
							threshold: addr.threshold,
							parent: userPreferences?.selectedAccount
						};

						// Create pure proxy account
						const newSelectedAccount: ISelectedAccount = {
							address: pureProxy.address,
							accountType: EAccountType.PROXY,
							parent: parentAccount
						};

						setUserPreferences({
							...userPreferences,
							selectedAccount: newSelectedAccount
						});
						break;
					}
				}
			}
		}

		closeDialog?.();
	};

	return (
		<Collapsible
			defaultOpen={defaultOpen}
			className='rounded-lg border border-border_grey bg-page_background p-4'
		>
			<CollapsibleTrigger asChild>
				<div className='flex cursor-pointer items-center justify-between'>
					<h6 className='text-text_secondary text-sm capitalize'>{accountType}</h6>
					<ChevronDown className='h-4 w-4' />
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<hr className='my-2 border-primary_border' />

				{!addresses.length && <p className='text-text_secondary text-sm'>No {accountType} found</p>}

				<RadioGroup
					value={selectedAddress}
					onValueChange={handleAddressChange}
					className='flex flex-col justify-center gap-3'
				>
					{addresses.map((address) => (
						<div
							key={address.address}
							className='flex flex-col items-center gap-2'
						>
							<div className='flex items-center gap-2'>
								<RadioGroupItem
									value={address.address}
									id={address.address}
								/>
								<Label
									htmlFor={address.address}
									className='flex cursor-pointer items-center gap-2'
								>
									<Address
										address={address.address}
										iconSize={25}
										redirectToProfile={false}
										disableTooltip
									/>
								</Label>
							</div>

							{'pureProxies' in address &&
								address.pureProxies.map((pureProxyAddress) => (
									<div
										key={pureProxyAddress.address}
										className='ml-6 flex items-center gap-2'
									>
										<RadioGroupItem
											value={pureProxyAddress.address}
											id={pureProxyAddress.address}
										/>
										<Label
											htmlFor={pureProxyAddress.address}
											className='flex cursor-pointer items-center gap-2'
										>
											<Address
												address={pureProxyAddress.address}
												iconSize={25}
												redirectToProfile={false}
												disableTooltip
											/>
										</Label>
									</div>
								))}
						</div>
					))}
				</RadioGroup>
			</CollapsibleContent>
		</Collapsible>
	);
}

function AddressSwitchButton() {
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const [isOpen, setisOpen] = useState(false);

	const selectedAddress = userPreferences?.selectedAccount?.address;
	const relationsForSelectedAddress = user?.addressRelations?.find((relations) => relations.address === selectedAddress);

	const closeDialog = () => {
		setisOpen(false);
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setisOpen}
		>
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
							accountType={EAccountType.MULTISIG}
							addresses={relationsForSelectedAddress?.multisigAddresses || []}
							defaultOpen
							closeDialog={closeDialog}
						/>
						<AddressRadioGroup
							accountType={EAccountType.PROXY}
							addresses={relationsForSelectedAddress?.proxyAddresses || []}
							closeDialog={closeDialog}
						/>
					</>
				) : (
					<>
						<Skeleton className='my-1 h-6 w-full' />
						<Skeleton className='mb-1 h-6 w-full' />
						<Skeleton className='mb-1 h-6 w-full' />
						<Skeleton className='mb-1 h-6 w-full' />
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
