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
import classes from './AddressDropdown.module.scss';
import { Alert, AlertDescription } from '../Alert';
import Balance from '../Balance';
import Address from '../Profile/Address/Address';
import { Skeleton } from '../Skeleton';

function AddressDropdown({ onChange, withBalance, disabled }: { onChange?: (account: InjectedAccount) => void; withBalance?: boolean; disabled?: boolean }) {
	const { userPreferences, setUserPreferences } = useUserPreferences();
	const t = useTranslations();
	const walletService = useWalletService();

	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);

	const [accountsLoading, setAccountsLoading] = useState(true);

	const getAccounts = useCallback(async () => {
		if (!walletService || !userPreferences?.wallet) return;
		setAccountsLoading(true);
		const injectedAccounts = await walletService?.getAddressesFromWallet(userPreferences.wallet);

		if (injectedAccounts.length === 0) {
			setAccounts([]);
			return;
		}

		setAccounts(injectedAccounts);
		setUserPreferences({
			...userPreferences,
			address: injectedAccounts[0]
		});
		setAccountsLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userPreferences?.wallet, walletService]);

	useEffect(() => {
		getAccounts();
	}, [getAccounts]);

	const onAccountChange = (a: InjectedAccount) => {
		setUserPreferences({ ...userPreferences, address: a });
		onChange?.(a);
	};

	if (!userPreferences.wallet) return <div className={classes.fallbackText}>{t('AddressDropdown.fallbackText')}</div>;

	if (accountsLoading)
		return (
			<div className='flex flex-col gap-y-2'>
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-5 w-1/2' />
			</div>
		);

	return !accounts || accounts.length === 0 ? (
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
	) : (
		<DropdownMenu>
			<div>
				<div className='mb-1 flex items-center justify-between gap-x-12'>
					<p className='text-sm text-wallet_btn_text'>{t('AddressDropdown.chooseLinkedAccount')}</p>
					{withBalance && <Balance address={userPreferences?.address?.address || ''} />}
				</div>
				<DropdownMenuTrigger
					disabled={disabled}
					className={classes.dropdownTrigger}
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
				{accounts.map((item) => (
					<DropdownMenuItem key={item.address}>
						<button
							key={`${item.address}`}
							type='button'
							onClick={() => onAccountChange(item)}
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
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default AddressDropdown;
