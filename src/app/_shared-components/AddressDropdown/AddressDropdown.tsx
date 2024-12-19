// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { EWallet } from '@/_shared/types';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/DropdownMenu';
import Identicon from '@polkadot/react-identicon';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { WalletIcon } from '../WalletsUI/WalletsIcon';
import classes from './AddressDropdown.module.scss';

function AddressDropdown({
	selectedWallet,
	selectedAddress,
	accounts,
	onAddressChange
}: {
	selectedWallet: EWallet;
	selectedAddress: string;
	accounts: InjectedAccount[];
	onAddressChange: (address: InjectedAccount) => void;
}) {
	return (
		<div>
			<p className={classes.addressHeader}>
				<WalletIcon wallet={selectedWallet} />
				<span className={classes.walletName}>{WalletClientService.getWalletNameLabel(selectedWallet)}</span>
			</p>
			<DropdownMenu>
				<div>
					<p className='mb-1 text-sm text-wallet_btn_text'>Choose Linked Account</p>
					<DropdownMenuTrigger className={classes.dropdownTrigger}>
						<Identicon
							value={selectedAddress}
							theme='polkadot'
							size={25}
						/>
						<p className={classes.dropdownTriggerText}>{shortenAddress(selectedAddress)}</p>
					</DropdownMenuTrigger>
				</div>
				<DropdownMenuContent className='border-0'>
					{accounts.map((item) => (
						<DropdownMenuItem key={item.address}>
							<button
								key={`${item.address}`}
								type='button'
								onClick={() => onAddressChange(item)}
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
