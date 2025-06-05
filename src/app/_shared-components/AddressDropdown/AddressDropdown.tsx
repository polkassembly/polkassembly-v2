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
import { EAccountType, ISelectedAccount } from '@/_shared/types';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import classes from './AddressDropdown.module.scss';
import { Alert, AlertDescription } from '../Alert';
import Balance from '../Balance';
import Address from '../Profile/Address/Address';
import { Skeleton } from '../Skeleton';
import { RadioGroup, RadioGroupItem } from '../RadioGroup/RadioGroup';
import { Label } from '../Label';
import AccountTypeBadge from '../AccountTypeBadge/AccountTypeBadge';

function AddressDropdown({
	onChange,
	withBalance,
	disabled,
	withRadioSelect,
	onRadioSelect,
	showPeopleChainBalance = false
}: {
	onChange?: (account: InjectedAccount) => void;
	withBalance?: boolean;
	disabled?: boolean;
	withRadioSelect?: boolean;
	onRadioSelect?: (address: string) => void;
	showPeopleChainBalance?: boolean;
}) {
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
			setAccountsLoading(false);
			return;
		}

		setAccounts(injectedAccounts);

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

	const onAccountChange = (a: InjectedAccount) => {
		setUserPreferences({
			...userPreferences,
			selectedAccount: {
				...a,
				accountType: EAccountType.REGULAR
			}
		});
		onChange?.(a);
	};

	const handleRadioChange = (address: string) => {
		const newSelectedAccount: ISelectedAccount = {
			address,
			accountType: EAccountType.REGULAR,
			wallet: userPreferences?.wallet,
			name: accounts.find((account) => account.address === address)?.name || ''
		};

		setUserPreferences({
			...userPreferences,
			selectedAccount: newSelectedAccount
		});

		onRadioSelect?.(address);
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
	) : withRadioSelect ? (
		<RadioGroup
			value={userPreferences?.selectedAccount?.address || ''}
			onValueChange={handleRadioChange}
			className='w-full'
		>
			<DropdownMenu>
				<div>
					<div className='mb-1 flex items-center justify-between gap-x-12'>
						<p className='text-xs text-wallet_btn_text sm:text-sm'>{t('AddressDropdown.chooseLinkedAccount')}</p>
						{withBalance && (
							<Balance
								address={userPreferences?.selectedAccount?.address || ''}
								showPeopleChainBalance={showPeopleChainBalance}
							/>
						)}
					</div>
					<DropdownMenuTrigger
						disabled={disabled}
						className='normal-case'
					>
						<div className='flex items-center gap-2'>
							<Address
								address={userPreferences?.selectedAccount?.address || ''}
								walletAddressName={userPreferences?.selectedAccount?.name || ''}
								iconSize={25}
								redirectToProfile={false}
								disableTooltip
							/>
							<div className='flex items-center gap-1'>
								<AccountTypeBadge accountType={userPreferences?.selectedAccount?.accountType || EAccountType.REGULAR} />
								{userPreferences?.selectedAccount?.parent && <AccountTypeBadge accountType={userPreferences?.selectedAccount?.parent?.accountType || EAccountType.REGULAR} />}
							</div>
						</div>
					</DropdownMenuTrigger>
				</div>
				<DropdownMenuContent className='max-h-[300px] overflow-y-auto border-0'>
					{accounts.map((item) => (
						<DropdownMenuItem key={item.address}>
							<div className='flex w-full items-center gap-2'>
								<RadioGroupItem
									value={item.address}
									id={`radio-${item.address}`}
								/>
								<Label
									htmlFor={`radio-${item.address}`}
									className='flex w-full cursor-pointer items-center gap-2'
								>
									<div className='flex items-center gap-2'>
										<Address
											address={item.address}
											walletAddressName={item.name}
											iconSize={25}
											redirectToProfile={false}
											disableTooltip
										/>
										<div className='flex items-center gap-1'>
											<AccountTypeBadge accountType={EAccountType.REGULAR} />
										</div>
									</div>
								</Label>
							</div>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</RadioGroup>
	) : (
		<DropdownMenu>
			<div>
				<div className='mb-1 flex items-center justify-between gap-x-12'>
					<p className='text-xs text-wallet_btn_text sm:text-sm'>{t('AddressDropdown.chooseLinkedAccount')}</p>
					{withBalance && (
						<Balance
							address={userPreferences?.selectedAccount?.address || ''}
							showPeopleChainBalance={showPeopleChainBalance}
						/>
					)}
				</div>
				<DropdownMenuTrigger
					disabled={disabled}
					className='normal-case'
				>
					<div className='flex items-center gap-2'>
						<Address
							address={userPreferences?.selectedAccount?.address || ''}
							walletAddressName={userPreferences?.selectedAccount?.name || ''}
							iconSize={25}
							redirectToProfile={false}
							disableTooltip
						/>
						<div className='flex items-center gap-1'>
							<AccountTypeBadge accountType={userPreferences?.selectedAccount?.accountType || EAccountType.REGULAR} />
							{userPreferences?.selectedAccount?.parent && <AccountTypeBadge accountType={userPreferences?.selectedAccount?.parent?.accountType || EAccountType.REGULAR} />}
						</div>
					</div>
				</DropdownMenuTrigger>
			</div>
			<DropdownMenuContent className='max-h-[300px] overflow-y-auto border-0'>
				{accounts.map((item) => (
					<DropdownMenuItem key={item.address}>
						<button
							type='button'
							onClick={() => onAccountChange(item)}
							className={classes.dropdownOption}
						>
							<div className='flex items-center gap-2'>
								<Address
									address={item.address}
									walletAddressName={item.name}
									iconSize={25}
									redirectToProfile={false}
									disableTooltip
								/>
								<div className='flex items-center gap-1'>
									<AccountTypeBadge accountType={EAccountType.REGULAR} />
								</div>
							</div>
						</button>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default AddressDropdown;
