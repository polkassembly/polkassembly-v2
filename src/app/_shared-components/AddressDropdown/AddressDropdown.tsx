// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useTranslations } from 'next-intl';
import { useWalletService } from '@/hooks/useWalletService';
import { useCallback, useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { AlertCircle } from 'lucide-react';
import { EAccountType, EReactQueryKeys, EWallet, ISelectedAccount, IVaultScannedAddress } from '@/_shared/types';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUser } from '@/hooks/useUser';
import dynamic from 'next/dynamic';
import classes from './AddressDropdown.module.scss';
import { Alert, AlertDescription } from '../Alert';
import Balance from '../Balance';
import Address from '../Profile/Address/Address';
import { Skeleton } from '../Skeleton';
import { RadioGroup, RadioGroupItem } from '../RadioGroup/RadioGroup';
import { Label } from '../Label';
import AccountTypeBadge from '../AccountTypeBadge/AccountTypeBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../Dialog/Dialog';
import { Button } from '../Button';

const AddVaultAddress = dynamic(() => import('../PolkadotVault/AddressVaultAddress/AddVaultAddress'), { ssr: false });

function AddressDropdown({
	onChange,
	withBalance,
	disabled,
	withRadioSelect,
	onRadioSelect,
	showPeopleChainBalance = false,
	showLinkedAccountBadge = false
}: {
	onChange?: (account: InjectedAccount) => void;
	withBalance?: boolean;
	disabled?: boolean;
	withRadioSelect?: boolean;
	onRadioSelect?: (address: string) => void;
	showPeopleChainBalance?: boolean;
	showLinkedAccountBadge?: boolean;
}) {
	const { userPreferences, setUserPreferences } = useUserPreferences();
	const { user } = useUser();
	const t = useTranslations();
	const walletService = useWalletService();
	const queryClient = useQueryClient();
	const [openVaultModal, setOpenVaultModal] = useState(false);

	const network = getCurrentNetwork();

	const getAccounts = useCallback(async () => {
		if (!walletService || !userPreferences?.wallet) return null;

		if (userPreferences.wallet === EWallet.POLKADOT_VAULT) {
			if (user?.loginWallet === EWallet.POLKADOT_VAULT && user?.loginAddress) {
				setUserPreferences({
					...userPreferences,
					selectedAccount: {
						address: user.loginAddress,
						accountType: EAccountType.REGULAR
					}
				});

				return [{ address: user.loginAddress, name: '' }];
			}

			setUserPreferences({
				...userPreferences,
				selectedAccount: undefined
			});
			return null;
		}

		const injectedAccounts = await walletService?.getAddressesFromWallet(userPreferences.wallet);

		if (injectedAccounts.length === 0) {
			setUserPreferences({
				...userPreferences,
				selectedAccount: undefined
			});
			return null;
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

		return injectedAccounts;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userPreferences?.wallet, walletService]);

	const { data: accounts, isFetching: accountsLoading } = useQuery({
		queryKey: [EReactQueryKeys.ACCOUNTS, userPreferences?.wallet],
		queryFn: getAccounts,
		enabled: !!userPreferences?.wallet && !!walletService,
		retry: true,
		refetchOnMount: true,
		refetchOnWindowFocus: false
	});

	const onVaultAddressScan = (scanned: IVaultScannedAddress): void => {
		if (!scanned.isAddress) return;

		queryClient.setQueryData([EReactQueryKeys.ACCOUNTS, userPreferences?.wallet], (oldData: InjectedAccount[] | undefined) => {
			const newAccount = { address: scanned.content, name: scanned.name };
			const isDuplicate = (oldData || []).some((account) => getSubstrateAddress(account.address) === getSubstrateAddress(newAccount.address));

			if (isDuplicate) {
				return oldData;
			}

			setUserPreferences({
				...userPreferences,
				selectedAccount: {
					...newAccount,
					accountType: EAccountType.REGULAR
				}
			});

			return [newAccount, ...(oldData || [])];
		});

		setOpenVaultModal(false);
	};
	const isLinkedAddress = useCallback((address: string) => user?.addresses.includes(getSubstrateAddress(address || '') || ''), [user]);

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
			name: accounts?.find((account) => account.address === address)?.name || ''
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

	return (
		<div>
			<Dialog
				open={openVaultModal}
				onOpenChange={setOpenVaultModal}
			>
				<DialogContent className='max-w-xl p-4 sm:p-6'>
					<DialogHeader>
						<DialogTitle>{t('PolkadotVault.addVaultAddress')}</DialogTitle>
					</DialogHeader>
					{openVaultModal && (
						<AddVaultAddress
							onScan={onVaultAddressScan}
							onError={(err) => console.log(err)}
						/>
					)}
				</DialogContent>
			</Dialog>
			{!accounts || accounts.length === 0 ? (
				userPreferences.wallet === EWallet.POLKADOT_VAULT ? (
					<div className='flex flex-col gap-y-3 rounded-lg bg-page_background p-3'>
						<h2 className='text-sm font-medium text-text_primary'>{t('AddressDropdown.scanYourAddressQr')}</h2>
						<ul className='list-disc pl-4 text-sm text-wallet_btn_text'>
							<li>{t('AddressDropdown.scanYourAddressQrDescription1')}</li>
							<li>{t('AddressDropdown.scanYourAddressQrDescription2', { network })}</li>
						</ul>
						<Button onClick={() => setOpenVaultModal(true)}>{t('PolkadotVault.scan')}</Button>
					</div>
				) : (
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
				)
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
									{/* Badge for the linked account */}
									{showLinkedAccountBadge && isLinkedAddress(userPreferences?.selectedAccount?.address || '') && (
										<span className='inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium capitalize text-green-700 ring-1 ring-inset ring-green-700/10'>
											{t('AddressDropdown.linkedAccount')}
										</span>
									)}
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
										{showLinkedAccountBadge && isLinkedAddress(item.address) && (
											<span className='inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium capitalize text-green-700 ring-1 ring-inset ring-green-700/10'>
												{t('AddressDropdown.linkedAccount')}
											</span>
										)}
									</div>
								</button>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
			{accounts && accounts.length > 0 && userPreferences.wallet === EWallet.POLKADOT_VAULT && (
				<div className='mt-1 flex justify-end'>
					<Button
						variant='secondary'
						size='sm'
						onClick={() => setOpenVaultModal(true)}
					>
						{t('PolkadotVault.scan')}
					</Button>
				</div>
			)}
		</div>
	);
}

export default AddressDropdown;
