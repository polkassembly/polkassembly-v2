// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { WalletClientService } from '@/app/_client-services/wallet_service';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/DropdownMenu';
import Identicon from '@polkadot/react-identicon';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { EWallet } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { useWalletService } from '@/hooks/useWalletService';
import { useEffect, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import classes from './AddressDropdown.module.scss';
import { WalletIcon } from '../WalletsUI/WalletsIcon';

function AddressDropdown({ onChange }: { onChange?: (account: InjectedAccount) => void }) {
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
	}, [userPreferences?.wallet]);

	const onAccountChange = (a: InjectedAccount) => {
		setUserPreferences({ ...userPreferences, address: a });
		onChange?.(a);
	};

	if (!userPreferences.wallet) return <div className={classes.fallbackText}>{t('AddressDropdown.fallbackText')}</div>;

	if (!accounts) return <div className={classes.fallbackText}>{t('AddressDropdown.noAccountsFound')}</div>;

	return (
		<div>
			<p className={classes.addressHeader}>
				<WalletIcon wallet={userPreferences.wallet} />
				<span className={classes.walletName}>{WalletClientService.getWalletNameLabel(userPreferences.wallet)}</span>
			</p>
			<DropdownMenu>
				<div>
					<p className='mb-1 text-sm text-wallet_btn_text'>{t('AddressDropdown.chooseLinkedAccount')}</p>
					<DropdownMenuTrigger className={classes.dropdownTrigger}>
						<Identicon
							value={userPreferences?.address?.address}
							theme='polkadot'
							size={25}
						/>
						<p className={classes.dropdownTriggerText}>{shortenAddress(userPreferences?.address?.address || '')}</p>
					</DropdownMenuTrigger>
				</div>
				<DropdownMenuContent className='border-0'>
					{accounts.map((item) => (
						<DropdownMenuItem key={item.address}>
							<button
								key={`${item.address}`}
								type='button'
								onClick={() => onAccountChange(item)}
								className={classes.dropdownOption}
							>
								<Identicon
									value={item.address}
									theme='polkadot'
									size={25}
								/>
								<p className={classes.dropdownOptionText}>{item.address}</p>
							</button>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export default AddressDropdown;
