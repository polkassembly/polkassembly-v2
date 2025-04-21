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

	const [multisigProxyData, setMultisigProxyData] = useState<{
		multisig: Array<IMultisig>;
		proxy: Array<IProxy>;
		proxied: Array<IProxy>;
	}>({ multisig: [], proxy: [], proxied: [] });

	const fetchMultisigAndProxyData = useCallback(async () => {
		if (!userPreferences?.address?.address) return;

		try {
			const data = await MultisigService.fetchMultisigAndProxyAddresses(userPreferences.address.address);
			setMultisigProxyData(data);
		} catch {
			// Handle error silently or use a logging service instead of console.error
			setMultisigProxyData({ multisig: [], proxy: [], proxied: [] });
		}
	}, [userPreferences?.address?.address]);

	const createSelectedAccount = (address: string, name: string, accountType: EAccountType, parent?: ISelectedAccount, proxyType?: string): ISelectedAccount => {
		return {
			address,
			name,
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

	useEffect(() => {
		fetchMultisigAndProxyData();
	}, [fetchMultisigAndProxyData]);
	return (
		<Dialog
			open={switchModalOpen}
			onOpenChange={setSwitchModalOpen}
		>
			<DialogContent className='overflow-hidden p-0 sm:max-w-[500px]'>
				<div className='flex items-center justify-between border-b border-border_grey p-5'>
					<div className='flex items-center gap-x-2'>
						<MdOutlineSync className='h-5 w-5' />
						<DialogTitle className='text-lg font-semibold'>Switch Address</DialogTitle>
					</div>
				</div>

				<div className='max-h-[70vh] overflow-y-auto p-5'>
					<div className=''>
						<p className='mb-1 text-sm'>Account</p>
					</div>

					<div className='relative mb-6'>
						<div className='flex justify-end'>
							<div className='flex items-center rounded-t-md bg-text_pink px-3 py-1 text-xs font-medium text-btn_primary_text'>
								{userPreferences?.address?.address ? (
									<Balance
										classname='text-btn_primary_text'
										address={userPreferences.address.address}
									/>
								) : (
									'0 DOT'
								)}
							</div>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger className='flex w-full cursor-pointer items-center justify-between rounded-md border p-3'>
								<div className='flex items-center'>
									<div className='mr-2'>
										<div className='flex h-5 w-5 items-center justify-center rounded-full bg-text_pink'>
											<div className='h-2 w-2 rounded-full bg-bg_modal' />
										</div>
									</div>
									{userPreferences?.address && (
										<Address
											address={userPreferences.address.address}
											walletAddressName={userPreferences.address.name}
											disableTooltip
											iconSize={25}
											redirectToProfile={false}
										/>
									)}
									{userPreferences?.address && 'accountType' in userPreferences.address && getAccountTypeTag(userPreferences.address as ISelectedAccount)}
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
											<div className='mr-2'>
												<div className={isSelected ? classes.selectedRadio : classes.accountRadio}>{isSelected && <div className='h-2 w-2 rounded-full bg-bg_modal' />}</div>
											</div>
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

					{multisigProxyData.multisig.length > 0 && (
						<div className='mb-4'>
							<div className='mb-2 border-b border-border_grey pb-1 text-sm font-medium'>Multisig</div>
							<div className='max-h-[180px] space-y-2 overflow-y-auto pr-1'>
								{multisigProxyData.multisig.map((multisig) => {
									const multisigAccount = createSelectedAccount(multisig.address, 'Multisig', EAccountType.MULTISIG);
									const isSelected = multisig.address === userPreferences?.address?.address;

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
												<div className='mr-2'>
													<div className={isSelected ? classes.selectedRadio : classes.accountRadio}>{isSelected && <div className='h-2 w-2 rounded-full bg-bg_modal' />}</div>
												</div>
												<Address
													address={multisig.address}
													walletAddressName='Multisig'
													iconSize={25}
													redirectToProfile={false}
												/>
												<span className='ml-2 rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-800'>Multisig Address</span>
											</button>

											{/* Pure Proxy under multisig */}
											{multisig.pureProxy && multisig.pureProxy.length > 0 && (
												<div className='ml-6 mt-2 border-l border-border_grey pl-4'>
													<div className='mb-1 text-xs font-medium'>Proxy addresses</div>
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
																	<div className='mr-2'>
																		<div className={isProxySelected ? classes.selectedRadio : classes.accountRadio}>
																			{isProxySelected && <div className='h-2 w-2 rounded-full bg-bg_modal' />}
																		</div>
																	</div>
																	<Address
																		address={proxy.address}
																		iconSize={25}
																		redirectToProfile={false}
																	/>
																	<span className='ml-2 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800'>PURE PROXY</span>
																</button>
															);
														})}
													</div>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					)}

					{multisigProxyData.proxy.length > 0 && (
						<div className='mb-4'>
							<div className='mb-2 border-b border-border_grey pb-1 text-sm font-medium'>Proxy address</div>
							<div className='max-h-[180px] space-y-2 overflow-y-auto pr-1'>
								{multisigProxyData.proxy.map((proxy) => {
									const proxyAccount = createSelectedAccount(proxy.address, `${proxy.proxyType} Proxy`, EAccountType.PROXY, undefined, proxy.proxyType);
									const isSelected = proxy.address === userPreferences?.address?.address;

									return (
										<button
											key={proxy.address}
											type='button'
											onClick={() => onAccountChange(proxyAccount)}
											className={isSelected ? classes.selectedAccountBtn : classes.accountBtn}
										>
											<div className='mr-2'>
												<div className={isSelected ? classes.selectedRadio : classes.accountRadio}>{isSelected && <div className='h-2 w-2 rounded-full bg-bg_modal' />}</div>
											</div>
											<Address
												address={proxy.address}
												iconSize={25}
												redirectToProfile={false}
											/>
											<span className='ml-2 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800'>PURE PROXY</span>
										</button>
									);
								})}
							</div>
						</div>
					)}

					{/* Proxied section - now outside the dropdown */}
					{multisigProxyData.proxied.length > 0 && (
						<div>
							<div className='mb-2 border-b border-border_grey pb-1 text-sm font-medium'>Proxied accounts</div>
							<div className='max-h-[180px] space-y-2 overflow-y-auto pr-1'>
								{multisigProxyData.proxied.map((proxied) => {
									const proxiedAccount = createSelectedAccount(proxied.address, `${proxied.proxyType} Proxied`, EAccountType.PROXY, undefined, proxied.proxyType);
									const isSelected = proxied.address === userPreferences?.address?.address;

									return (
										<button
											key={proxied.address}
											type='button'
											onClick={() => onAccountChange(proxiedAccount)}
											className={isSelected ? classes.selectedAccountBtn : classes.accountBtn}
										>
											<div className='mr-2'>
												<div className={isSelected ? classes.selectedRadio : classes.accountRadio}>{isSelected && <div className='h-2 w-2 rounded-full bg-bg_modal' />}</div>
											</div>
											<Address
												address={proxied.address}
												iconSize={25}
												redirectToProfile={false}
											/>
											<span className='ml-2 rounded-md bg-pink-100 px-2 py-1 text-xs text-pink-800'>{proxied.proxyType.toUpperCase()}</span>
										</button>
									);
								})}
							</div>
						</div>
					)}
				</div>

				<div className='flex space-x-2 border-t border-border_grey p-5'>
					<Button
						variant='outline'
						onClick={() => setSwitchModalOpen(false)}
						className='flex-1'
					>
						Cancel
					</Button>
					<Button
						variant='default'
						className='flex-1 bg-text_pink text-btn_primary_text'
						onClick={() => setSwitchModalOpen(false)}
					>
						Confirm
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default AddressSwitchModal;
