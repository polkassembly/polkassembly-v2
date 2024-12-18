// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { EWallet } from '@/_shared/types';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/DropdownMenu';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { Identicon } from '@polkadot/react-identicon';
import WalletButton from '@ui/WalletsUI/WalletButton/WalletButton';
import { WalletIcon } from '@ui/WalletsUI/WalletsIcon';
import SwitchToWeb2Signup from '@/app/login/Components/SwitchToWeb2Signup/SwitchToWeb2Signup';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import classes from './WalletButtons.module.scss';
import { Button } from '../../Button';

function WalletButtons({
	onWalletChange,
	accounts,
	selectedAddress,
	onAddressChange,
	small,
	selectedWallet,
	getAccounts,
	switchToSignup
}: {
	onWalletChange: (wallet: EWallet | null) => void;
	accounts: InjectedAccount[];
	selectedAddress: string;
	onAddressChange: (a: InjectedAccount) => void;
	small?: boolean;
	selectedWallet?: EWallet;
	getAccounts: (wallet: EWallet) => void;
	switchToSignup: () => void;
}) {
	const availableWallets = WalletClientService.getAvailableWallets();

	return selectedWallet ? (
		accounts && accounts.length > 0 ? (
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
		) : (
			<div>
				<p className={classes.addressHeader}>
					<WalletIcon wallet={selectedWallet} />
					<span className={classes.walletName}>{WalletClientService.getWalletNameLabel(selectedWallet)}</span>
				</p>
				<p className={classes.confirmationText}>For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.</p>
				<SwitchToWeb2Signup
					className='my-4'
					switchToSignup={switchToSignup}
				/>
				<div className={classes.footer}>
					<Button
						size='lg'
						variant='secondary'
						className={classes.signupButton}
						onClick={() => onWalletChange(null)}
					>
						Go Back
					</Button>
					<Button
						size='lg'
						className={classes.signupButton}
						onClick={() => getAccounts(selectedWallet)}
					>
						Got It
					</Button>
				</div>
			</div>
		)
	) : (
		<div className={`${small ? classes.buttonsAlignmentSmall : classes.buttonsAlignment}`}>
			{!small && <p className={classes.header}>Select a Wallet</p>}
			{Object.values(EWallet).map((wallet) => {
				if (!wallet) return null;
				return (
					<WalletButton
						key={wallet}
						disabled={!availableWallets[wallet]}
						wallet={wallet}
						onClick={onWalletChange}
						label={WalletClientService.getWalletNameLabel(wallet)}
						small={small}
					/>
				);
			})}
		</div>
	);
}

export default WalletButtons;
