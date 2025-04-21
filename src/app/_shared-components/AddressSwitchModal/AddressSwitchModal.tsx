// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { Dialog, DialogContent, DialogTitle } from '@ui/Dialog/Dialog';
import { MdOutlineSync } from 'react-icons/md';
import { EAccountType, IMultisig, IProxy, ISelectedAccount } from '@/_shared/types';
import { useCallback, useEffect, useState } from 'react';
import { MultisigService } from '@/app/_client-services/multisig_proxy_service';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useLinkedAddress } from '@/app/_atoms/linkedAddress/linkedAddressAtom';
import { useTranslations } from 'next-intl';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Balance from '../Balance';
import Address from '../Profile/Address/Address';
import classes from './AddressSwitchModal.module.scss';
import { Button } from '../Button';

function AddressSwitchModal({
	switchModalOpen,
	setSwitchModalOpen,
	onChange,
	accounts
}: {
	switchModalOpen: boolean;
	setSwitchModalOpen: (open: boolean) => void;
	onChange?: (account: ISelectedAccount) => void;
	accounts: InjectedAccount[];
}) {
	const { userPreferences, setUserPreferences } = useUserPreferences();
	const { linkedAddress } = useLinkedAddress();
	const t = useTranslations('AddressDropdown');
	const [expandedMultisigs, setExpandedMultisigs] = useState<Record<string, boolean>>({});

	const [multisigProxyData, setMultisigProxyData] = useState<{
		multisig: Array<IMultisig>;
		proxy: Array<IProxy>;
		proxied: Array<IProxy>;
	}>({ multisig: [], proxy: [], proxied: [] });

	const createSelectedAccount = (address: string, name: string, accountType: EAccountType, parent?: ISelectedAccount, proxyType?: string): ISelectedAccount => {
		let displayName = name;
		if (accountType !== EAccountType.REGULAR) {
			displayName = '';
		}

		return {
			address,
			name: displayName,
			type: undefined,
			accountType,
			wallet: userPreferences?.wallet,
			parent,
			proxyType
		};
	};

	const onAccountChange = (a: ISelectedAccount) => {
		setUserPreferences({ ...userPreferences, address: a });
		onChange?.(a);
	};

	const toggleMultisigExpand = (address: string) => {
		setExpandedMultisigs((prev) => ({
			...prev,
			[address]: !prev[address]
		}));
	};

	const fetchMultisigAndProxyData = useCallback(async () => {
		if (!userPreferences?.address?.address) return;

		try {
			if (linkedAddress && linkedAddress[userPreferences.address.address]) {
				setMultisigProxyData(linkedAddress[userPreferences.address.address]);
			} else {
				const data = await MultisigService.fetchMultisigAndProxyAddresses(userPreferences.address.address);
				setMultisigProxyData(data);
			}
		} catch {
			setMultisigProxyData({ multisig: [], proxy: [], proxied: [] });
		}
	}, [userPreferences?.address?.address, linkedAddress]);

	useEffect(() => {
		if (switchModalOpen) {
			fetchMultisigAndProxyData();
		}
	}, [fetchMultisigAndProxyData, switchModalOpen]);

	const renderAccountItem = (account: ISelectedAccount, isSelected: boolean) => (
		<div className='mr-2'>
			<div className={isSelected ? classes.selectedRadio : classes.accountRadio}>{isSelected && <div className='h-2 w-2 rounded-full bg-bg_modal' />}</div>
		</div>
	);

	const renderRegularAccounts = () => (
		<div className='relative mb-6'>
			<div className='flex justify-end'>
				<div className={classes.balanceInput}>
					{userPreferences?.address?.address && (
						<Balance
							classname='text-btn_primary_text'
							address={userPreferences.address.address}
						/>
					)}
				</div>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger className={classes.dropdownTrigger}>
					<div className='flex items-center'>
						<div className='mr-2'>
							<div className='flex h-5 w-5 items-center justify-center rounded-full bg-text_pink'>
								<div className='h-2 w-2 rounded-full bg-bg_modal' />
							</div>
						</div>
						{userPreferences?.address && (
							<Address
								address={userPreferences.address.address}
								walletAddressName={userPreferences.address.name || ''}
								disableTooltip
								iconSize={25}
								redirectToProfile={false}
							/>
						)}
						{userPreferences?.address && 'accountType' in userPreferences.address && userPreferences.address.accountType !== EAccountType.REGULAR && (
							<span className='ml-2 text-xs text-text_primary'>
								{userPreferences.address.accountType === EAccountType.MULTISIG
									? '(Multisig)'
									: userPreferences.address.proxyType
										? `(${userPreferences.address.proxyType})`
										: '(Proxy)'}
							</span>
						)}
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-4xl max-h-60 overflow-auto'>
					{accounts.map((account) => {
						const selectedAccount: ISelectedAccount = {
							...account,
							accountType: EAccountType.REGULAR,
							wallet: userPreferences?.wallet
						};
						const isSelected = account.address === userPreferences?.address?.address;

						return (
							<DropdownMenuItem
								key={account.address}
								className={isSelected ? classes.selectedAccountItem : classes.accountItem}
								onClick={() => onAccountChange(selectedAccount)}
							>
								{renderAccountItem(selectedAccount, isSelected)}
								<Address
									address={account.address}
									walletAddressName={account.name}
									iconSize={25}
									redirectToProfile={false}
								/>
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);

	const renderMultisigSection = () =>
		multisigProxyData.multisig.length > 0 && (
			<div className='mb-4'>
				<div className='mb-2 border-b border-border_grey pb-1 text-sm font-medium'>{t('multisig')}</div>
				<div className='max-h-[180px] space-y-2 overflow-y-auto pr-1'>
					{multisigProxyData.multisig.map((multisig) => {
						const multisigAccount = createSelectedAccount(multisig.address, 'Multisig', EAccountType.MULTISIG);
						const isSelected = multisig.address === userPreferences?.address?.address;
						const hasProxies = multisig.pureProxy && multisig.pureProxy.length > 0;
						const isExpanded = expandedMultisigs[multisig.address];

						return (
							<div
								key={multisig.address}
								className='mb-4'
							>
								<button
									type='button'
									onClick={() => onAccountChange(multisigAccount)}
									className={isSelected ? classes.selectedAccountBtn : classes.accountBtn}
								>
									{renderAccountItem(multisigAccount, isSelected)}
									<Address
										address={multisig.address}
										walletAddressName=''
										iconSize={25}
										redirectToProfile={false}
									/>
									<span className={classes.multisigBg}>{t('multisigAddress')}</span>
								</button>

								{hasProxies && (
									<div className='ml-6 mt-2'>
										<div className='flex items-center'>
											<button
												type='button'
												onClick={(e) => {
													e.stopPropagation();
													toggleMultisigExpand(multisig.address);
												}}
												className='flex items-center text-xs font-medium hover:text-text_pink'
											>
												{isExpanded ? <FiChevronUp className='mr-1' /> : <FiChevronDown className='mr-1' />}
												{t('proxyaddresses')} ({multisig.pureProxy.length})
											</button>
										</div>

										{isExpanded && (
											<div className='mt-1 border-l border-border_grey pl-4'>
												<div className='max-h-[120px] space-y-2 overflow-y-auto'>
													{multisig.pureProxy.map((proxy) => {
														const proxyAccount = createSelectedAccount(proxy.address, `${proxy.proxyType} Proxy`, EAccountType.PROXY, multisigAccount, proxy.proxyType);
														const isProxySelected = proxy.address === userPreferences?.address?.address;

														return (
															<button
																key={proxy.address}
																type='button'
																onClick={() => onAccountChange(proxyAccount)}
																className={isProxySelected ? classes.selectedAccountBtn : classes.accountBtn}
															>
																{renderAccountItem(proxyAccount, isProxySelected)}
																<Address
																	address={proxy.address}
																	walletAddressName=''
																	iconSize={25}
																	redirectToProfile={false}
																/>
																<span className={classes.pureProxyBg}>{t('pureProxy')}</span>
															</button>
														);
													})}
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		);

	const renderProxiedSection = () =>
		multisigProxyData.proxied.length > 0 && (
			<div>
				<div className='mb-2 border-b border-border_grey pb-1 text-sm font-medium'>{t('proxiedaccounts')}</div>
				<div className='max-h-[180px] space-y-2 overflow-y-auto pr-1'>
					{multisigProxyData.proxied.map((proxied) => {
						const proxiedAccount = createSelectedAccount(proxied.address, proxied.proxyType, EAccountType.PROXY, undefined, proxied.proxyType);
						const isSelected = proxied.address === userPreferences?.address?.address;

						return (
							<button
								key={proxied.address}
								type='button'
								onClick={() => onAccountChange(proxiedAccount)}
								className={isSelected ? classes.selectedAccountBtn : classes.accountBtn}
							>
								{renderAccountItem(proxiedAccount, isSelected)}
								<Address
									address={proxied.address}
									walletAddressName=''
									iconSize={25}
									redirectToProfile={false}
								/>
								<span className={proxied.proxyType === 'Any' ? classes.anyProxyBg : proxied.proxyType === 'Non-Transferrable' ? classes.nonTransferrableBg : classes.proxyTypeBg}>
									{proxied.proxyType.toUpperCase()}
								</span>
							</button>
						);
					})}
				</div>
			</div>
		);

	return (
		<Dialog
			open={switchModalOpen}
			onOpenChange={setSwitchModalOpen}
		>
			<DialogContent className='overflow-hidden p-0 sm:max-w-[500px]'>
				<div className='flex items-center justify-between border-b border-border_grey p-5'>
					<div className='flex items-center gap-x-2'>
						<MdOutlineSync className='h-5 w-5' />
						<DialogTitle className='text-lg font-semibold'>{t('switchAddress')}</DialogTitle>
					</div>
				</div>

				<div className='max-h-[70vh] overflow-y-auto p-5'>
					<div>
						<p className='mb-1 text-sm'>{t('account')}</p>
					</div>

					{renderRegularAccounts()}
					{renderMultisigSection()}
					{renderProxiedSection()}
				</div>

				<div className='flex space-x-2 border-t border-border_grey p-5'>
					<Button
						variant='outline'
						onClick={() => setSwitchModalOpen(false)}
						className='flex-1'
					>
						{t('cancel')}
					</Button>
					<Button
						variant='default'
						className='flex-1 bg-text_pink text-btn_primary_text'
						onClick={() => setSwitchModalOpen(false)}
					>
						{t('confirm')}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default AddressSwitchModal;
