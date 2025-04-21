// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useTranslations } from 'next-intl';
import { useWalletService } from '@/hooks/useWalletService';
import { useCallback, useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { AlertCircle } from 'lucide-react';
import { Button } from '@ui/Button';
import { MdOutlineSync } from 'react-icons/md';
import { EAccountType, ISelectedAccount } from '@/_shared/types';
import classes from './AddressDropdown.module.scss';
import { Alert, AlertDescription } from '../Alert';
import Balance from '../Balance';
import Address from '../Profile/Address/Address';
import { Skeleton } from '../Skeleton';
import AddressSwitchModal from '../AddressSwitchModal/AddressSwitchModal';

function AddressDropdown({
	onChange,
	withBalance,
	disabled,
	multiswitch = false
}: {
	onChange?: (account: ISelectedAccount) => void;
	withBalance?: boolean;
	disabled?: boolean;
	multiswitch?: boolean;
}) {
	const { userPreferences, setUserPreferences } = useUserPreferences();
	const t = useTranslations();
	const walletService = useWalletService();

	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [accountsLoading, setAccountsLoading] = useState(true);
	const [switchModalOpen, setSwitchModalOpen] = useState(false);

	const getAccounts = useCallback(async () => {
		if (!walletService || !userPreferences?.wallet) return;

		setAccountsLoading(true);
		const injectedAccounts = await walletService?.getAddressesFromWallet(userPreferences.wallet);

		setAccounts(injectedAccounts || []);

		if (injectedAccounts?.length > 0) {
			if (!userPreferences.address) {
				const defaultAccount: ISelectedAccount = {
					...injectedAccounts[0],
					wallet: userPreferences.wallet,
					accountType: EAccountType.REGULAR
				};

				setUserPreferences({
					...userPreferences,
					address: defaultAccount
				});
			} else if (userPreferences.address && !('accountType' in userPreferences.address)) {
				const address = userPreferences.address as InjectedAccount;
				const defaultAccount: ISelectedAccount = {
					address: address.address,
					name: address.name,
					type: address.type,
					wallet: userPreferences.wallet,
					accountType: EAccountType.REGULAR
				};

				setUserPreferences({
					...userPreferences,
					address: defaultAccount
				});
			}
		}

		setAccountsLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userPreferences?.wallet, walletService]);

	useEffect(() => {
		getAccounts();
	}, [getAccounts]);

	const onAccountChange = (a: ISelectedAccount) => {
		setUserPreferences({ ...userPreferences, address: a });
		onChange?.(a);
	};

	const getAccountTypeTag = (account: ISelectedAccount | undefined) => {
		if (!account || !('accountType' in account)) return null;

		if (account.accountType === EAccountType.MULTISIG) {
			return <span className='ml-2 rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800'>Multisig Address</span>;
		}
		if (account.accountType === EAccountType.PROXY) {
			if (account.proxyType?.toLowerCase().includes('any')) {
				return <span className='ml-2 rounded-md bg-pink-100 px-2 py-1 text-xs text-pink-800'>ANY</span>;
			}
			if (account.name?.includes('Pure')) {
				return <span className='ml-2 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800'>PURE PROXY</span>;
			}
			return <span className='ml-2 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800'>{account.proxyType}</span>;
		}
		return null;
	};

	const isMultisigAccount = userPreferences?.address && 'accountType' in userPreferences.address && userPreferences.address.accountType === EAccountType.MULTISIG;

	if (!userPreferences.wallet) return <div className={classes.fallbackText}>{t('AddressDropdown.fallbackText')}</div>;
	if (accountsLoading) {
		return (
			<div className='flex flex-col gap-y-2'>
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-5 w-1/2' />
			</div>
		);
	}

	if (!accounts || accounts.length === 0) {
		return (
			<Alert
				variant='info'
				className='flex items-center gap-x-3'
			>
				<AlertCircle className='h-4 w-4' />
				<AlertDescription className=''>
					<h2 className='mb-2 text-base font-medium'>{t('AddressDropdown.noAccountsFound')}</h2>
					<ul className='list-disc pl-4'>
						<li>{t('AddressDropdown.pleaseConnectWallet')}</li>
						<li>{t('AddressDropdown.pleaseCheckConnectedAccounts')}</li>
					</ul>
				</AlertDescription>
			</Alert>
		);
	}

	if (!multiswitch) {
		return (
			<DropdownMenu>
				<div>
					<div className='mb-1 flex items-center justify-between gap-x-12'>
						<p className='text-xs text-wallet_btn_text sm:text-sm'>{t('AddressDropdown.chooseLinkedAccount')}</p>
						{withBalance && <Balance address={userPreferences?.address?.address || ''} />}
					</div>
					<DropdownMenuTrigger
						disabled={disabled}
						className='normal-case'
					>
						<Address
							address={userPreferences?.address?.address || ''}
							walletAddressName={userPreferences?.address?.name || ''}
							iconSize={25}
							redirectToProfile={false}
							disableTooltip
						/>
					</DropdownMenuTrigger>
				</div>
				<DropdownMenuContent className='max-h-[300px] overflow-y-auto border-0'>
					{accounts.map((item) => {
						const selectedAccount: ISelectedAccount = {
							...item,
							accountType: EAccountType.REGULAR,
							wallet: userPreferences?.wallet
						};
						return (
							<DropdownMenuItem key={item.address}>
								<button
									type='button'
									onClick={() => onAccountChange(selectedAccount)}
									className={classes.dropdownOption}
								>
									<Address
										address={item.address}
										walletAddressName={item.name}
										iconSize={25}
										redirectToProfile={false}
										disableTooltip
									/>
								</button>
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<div className='w-full'>
			<div className='mb-1 flex items-center justify-between gap-x-12'>
				<p className='text-xs text-wallet_btn_text sm:text-sm'>{t('AddressDropdown.chooseLinkedAccount')}</p>
				{withBalance && <Balance address={userPreferences?.address?.address || ''} />}
			</div>
			<div className='flex w-full flex-col rounded-md border border-border_grey'>
				<div className='flex items-center justify-between px-4 py-2'>
					<div className='flex items-center'>
						<Address
							address={userPreferences?.address?.address || ''}
							walletAddressName={userPreferences?.address?.name || ''}
							iconSize={25}
							redirectToProfile={false}
							disableTooltip
						/>
						{userPreferences?.address && 'accountType' in userPreferences.address && getAccountTypeTag(userPreferences.address as ISelectedAccount)}
					</div>
					<Button
						className={classes.switchButton}
						onClick={() => setSwitchModalOpen(true)}
					>
						Switch <MdOutlineSync />
					</Button>
				</div>
				<AddressSwitchModal
					switchModalOpen={switchModalOpen}
					setSwitchModalOpen={setSwitchModalOpen}
					onChange={onChange}
					accounts={accounts}
				/>
				{isMultisigAccount && (
					<div className='mb-1 border-t border-border_grey bg-amber-50 px-4 py-1.5 text-xs text-amber-800'>
						<span className='font-medium'>Vote Balance:</span> <span className='font-bold text-text_pink'>1.7 DOT</span>
					</div>
				)}
			</div>
		</div>
	);
}

export default AddressDropdown;
