// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useWalletService } from '@/hooks/useWalletService';
import { EAccountType, IMultisigAddress, IProxyAddress, ISelectedAccount } from '@/_shared/types';
import { useUser } from '@/hooks/useUser';
import { ChevronDown } from 'lucide-react';
import { IoMdSync } from '@react-icons/all-files/io/IoMdSync';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import Address from '../Profile/Address/Address';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../Dialog/Dialog';
import SwitchWalletOrAddress from '../SwitchWalletOrAddress/SwitchWalletOrAddress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../Collapsible';
import { RadioGroup, RadioGroupItem } from '../RadioGroup/RadioGroup';
import { Label } from '../Label';
import AccountTypeBadge from '../AccountTypeBadge/AccountTypeBadge';
import Balance from '../Balance';

interface IAddressRadioGroupProps {
	accountType: EAccountType;
	addresses: IMultisigAddress[] | IProxyAddress[];
	defaultOpen?: boolean;
	closeDialog?: () => void;
	isLoading?: boolean;
}

function AddressRadioGroup({ accountType, addresses, defaultOpen = false, closeDialog, isLoading = true }: IAddressRadioGroupProps) {
	const [selectedAddress, setSelectedAddress] = useState<string>('');
	const { userPreferences, setUserPreferences } = useUserPreferences();
	const t = useTranslations('AddressRelationsPicker');
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

				{isLoading ? (
					<div className='flex flex-col gap-2'>
						<Skeleton className='h-6 w-full light:bg-slate-300 dark:bg-gray-700' />
						<Skeleton className='h-6 w-full light:bg-slate-300 dark:bg-gray-700' />
						<Skeleton className='h-6 w-full light:bg-slate-300 dark:bg-gray-700' />
					</div>
				) : (
					!addresses.length && (
						<p className='text-text_secondary text-sm'>
							{t('noData')} {accountType} {t('found')}
						</p>
					)
				)}

				<RadioGroup
					value={selectedAddress}
					onValueChange={handleAddressChange}
					className='flex flex-col justify-center gap-3'
				>
					{addresses.map((address) => (
						<div
							key={address.address}
							className='flex flex-col gap-2'
						>
							<div className='flex items-center gap-2'>
								<RadioGroupItem
									value={address.address}
									id={address.address}
								/>
								<Label
									htmlFor={address.address}
									className='flex w-full cursor-pointer items-center gap-2'
								>
									<Address
										address={address.address}
										iconSize={25}
										redirectToProfile={false}
										disableTooltip
									/>
									<Balance
										address={address.address}
										classname='ml-auto'
									/>
								</Label>
							</div>

							{'pureProxies' in address &&
								address.pureProxies.map((pureProxyAddress) => (
									<div
										key={pureProxyAddress.address}
										className='flex items-center gap-2 pl-6'
									>
										<RadioGroupItem
											value={pureProxyAddress.address}
											id={pureProxyAddress.address}
										/>
										<Label
											htmlFor={pureProxyAddress.address}
											className='flex w-full cursor-pointer items-center gap-2'
										>
											<Address
												address={pureProxyAddress.address}
												iconSize={25}
												redirectToProfile={false}
												disableTooltip
											/>
											<Balance
												address={pureProxyAddress.address}
												classname='ml-auto'
											/>
											<AccountTypeBadge accountType={EAccountType.PROXY} />
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

	const selectedAddress = useMemo(() => userPreferences?.selectedAccount?.address, [userPreferences?.selectedAccount?.address]);
	const relationsForSelectedAddress = useMemo(() => user?.addressRelations?.find((relations) => relations.address === selectedAddress), [user?.addressRelations, selectedAddress]);

	const t = useTranslations('AddressRelationsPicker');
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
					className='ml-auto flex items-center gap-1 text-xs'
				>
					<IoMdSync /> {t('Switch')}
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-xl p-3 sm:p-6'>
				<DialogHeader className='text-xl font-semibold text-text_primary'>
					<DialogTitle>{t('switchWallet')}</DialogTitle>
				</DialogHeader>

				<SwitchWalletOrAddress
					small
					withRadioSelect
					withBalance
				/>

				<div className='flex max-h-[60vh] flex-col gap-2 overflow-y-auto'>
					<AddressRadioGroup
						accountType={EAccountType.MULTISIG}
						isLoading={!relationsForSelectedAddress}
						addresses={relationsForSelectedAddress?.multisigAddresses || []}
						defaultOpen
						closeDialog={closeDialog}
					/>
					<AddressRadioGroup
						accountType={EAccountType.PROXY}
						isLoading={!relationsForSelectedAddress}
						addresses={relationsForSelectedAddress?.proxyAddresses || []}
						closeDialog={closeDialog}
					/>
				</div>

				<DialogFooter className='mt-6'>
					<Button
						onClick={closeDialog}
						variant='default'
					>
						{t('confirm')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default function AddressRelationsPicker({ withBalance = false }: { withBalance?: boolean }) {
	const { userPreferences, setUserPreferences } = useUserPreferences();
	const walletService = useWalletService();
	const [accountsLoading, setAccountsLoading] = useState(true);

	const selectedAddress = useMemo(() => userPreferences?.selectedAccount?.address, [userPreferences?.selectedAccount?.address]);
	const walletAddressName = useMemo(() => userPreferences?.selectedAccount?.name, [userPreferences?.selectedAccount?.name]);

	const getAccounts = useCallback(async () => {
		if (!walletService || !userPreferences?.wallet) return;

		const injectedAccounts = await walletService?.getAddressesFromWallet(userPreferences.wallet);

		if (injectedAccounts.length === 0) {
			setAccountsLoading(false);
			return;
		}

		const prevPreferredAccount = userPreferences.selectedAccount;

		const selectedAccount =
			prevPreferredAccount?.address && injectedAccounts.some((account) => getSubstrateAddress(account.address) === getSubstrateAddress(prevPreferredAccount.address))
				? prevPreferredAccount
				: injectedAccounts[0];

		setUserPreferences({
			...userPreferences,
			selectedAccount: {
				...selectedAccount,
				accountType: EAccountType.REGULAR
			}
		});

		setAccountsLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userPreferences?.wallet, walletService]);

	useEffect(() => {
		getAccounts();
	}, [getAccounts]);

	return (
		<div className='flex flex-col gap-1'>
			{withBalance && (
				<Balance
					address={userPreferences?.selectedAccount?.address || ''}
					classname='ml-auto'
				/>
			)}

			<div className='flex items-center gap-2 rounded border border-primary_border p-2'>
				{accountsLoading || !selectedAddress ? (
					<Skeleton className='h-6 w-32' />
				) : (
					<div className='flex items-center justify-between gap-2'>
						<Address
							address={selectedAddress}
							walletAddressName={walletAddressName}
							iconSize={25}
							redirectToProfile={false}
							disableTooltip
							className='w-full px-2'
						/>
						<span>
							<AccountTypeBadge accountType={userPreferences?.selectedAccount?.accountType || EAccountType.REGULAR} />
							{userPreferences?.selectedAccount?.parent && <AccountTypeBadge accountType={userPreferences?.selectedAccount?.parent?.accountType || EAccountType.REGULAR} />}
						</span>
					</div>
				)}
				<AddressSwitchButton />
			</div>
		</div>
	);
}
