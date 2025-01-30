// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { EWallet } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useWalletService } from '@/hooks/useWalletService';
import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { AlertCircle } from 'lucide-react';
import classes from './AddressDropdown.module.scss';
import { Alert, AlertDescription } from '../Alert';
import Balance from '../Balance';
import Address from '../Profile/Address/Address';

function AddressDropdown({ onChange, withBalance }: { onChange?: (account: InjectedAccount) => void; withBalance?: boolean }) {
	const { userPreferences, setUserPreferences } = useUserPreferences();
	const t = useTranslations();
	const walletService = useWalletService();

	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);

	const getAccounts = async (chosenWallet: EWallet): Promise<undefined> => {
		if (!walletService) return;
		const injectedAccounts = await walletService?.getAddressesFromWallet(chosenWallet);

		if (injectedAccounts.length === 0) {
			return;
		}

		setAccounts(injectedAccounts);
		setUserPreferences({
			...userPreferences,
			address: injectedAccounts[0]
		});
	};

	useEffect(() => {
		if (userPreferences?.wallet) getAccounts(userPreferences.wallet);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userPreferences?.wallet, walletService]);

	const onAccountChange = (a: InjectedAccount) => {
		setUserPreferences({ ...userPreferences, address: a });
		onChange?.(a);
	};

	if (!userPreferences.wallet) return <div className={classes.fallbackText}>{t('AddressDropdown.fallbackText')}</div>;

	if (!accounts) return <div className={classes.fallbackText}>{t('AddressDropdown.noAccountsFound')}</div>;

	return !accounts || accounts.length === 0 ? (
		<Alert
			variant='info'
			className='flex items-center gap-x-3'
		>
			<AlertCircle className='h-4 w-4' />
			<AlertDescription className=''>
				<h2 className='mb-2 text-base font-medium'>No Accounts Found</h2>
				<ul className='list-disc pl-4'>
					<li>Please connect your wallet to Polkassembly.</li>
					<li>Please check the connected wallets in extension.</li>
				</ul>
			</AlertDescription>
		</Alert>
	) : (
		<DropdownMenu>
			<div>
				<div className='mb-1 flex items-center justify-between'>
					<p className='text-sm text-wallet_btn_text'>{t('AddressDropdown.chooseLinkedAccount')}</p>
					{withBalance && <Balance address={userPreferences?.address?.address || ''} />}
				</div>
				<DropdownMenuTrigger className={classes.dropdownTrigger}>
					<Address
						address={userPreferences?.address?.address || ''}
						walletAddressName={userPreferences?.address?.name || ''}
						iconSize={25}
					/>
				</DropdownMenuTrigger>
			</div>
			<DropdownMenuContent className='max-h-[300px] min-w-[500px] overflow-y-auto border-0'>
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
							/>
						</button>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default AddressDropdown;
