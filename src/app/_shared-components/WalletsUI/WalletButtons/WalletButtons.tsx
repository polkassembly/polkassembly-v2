// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { getAvailableWallets } from '@/app/_client-utils/getAvailableWallets';
import React from 'react';
import { EWallet } from '@/_shared/types';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { Identicon } from '@polkadot/react-identicon';
import WalletButton from '@ui/WalletsUI/WalletButton/WalletButton';
import { WalletIcon } from '@ui/WalletsUI/WalletsIcon';
import classes from './WalletButtons.module.scss';

const getWalletLabel = (wallet: EWallet) =>
	wallet === EWallet.SUBWALLET ? wallet.charAt(0).toUpperCase() + wallet.slice(1).split('-')[0] : wallet.charAt(0).toUpperCase() + wallet.slice(1).replace('-', '.');

function WalletButtons({
	onWalletChange,
	accounts,
	selectedAddress,
	onAddressChange,
	small,
	selectedWallet
}: {
	onWalletChange: (wallet: EWallet) => void;
	accounts: InjectedAccount[];
	selectedAddress: string;
	onAddressChange: (a: InjectedAccount) => void;
	small?: boolean;
	selectedWallet?: EWallet;
}) {
	const availableWallets = getAvailableWallets();

	return accounts && accounts.length > 0 && selectedWallet ? (
		<div>
			<p className={classes.addressHeader}>
				<WalletIcon wallet={selectedWallet} />
				<span className={classes.walletName}>{getWalletLabel(selectedWallet)}</span>
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
	) : (
		<div className={`${small ? classes.buttonsAlignmentSmall : classes.buttonsAlignment}`}>
			{!small && <p className={classes.header}>Select a Wallet</p>}
			{Object.values(EWallet).map((wallet) => (
				<WalletButton
					key={wallet}
					disabled={!availableWallets[wallet]}
					wallet={wallet}
					onClick={onWalletChange}
					label={getWalletLabel(wallet)}
					small={small}
				/>
			))}
		</div>
	);
}

export default WalletButtons;
