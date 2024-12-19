// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { EWallet } from '@/_shared/types';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import SwitchToWeb2Signup from '@/app/login/Components/SwitchToWeb2Signup/SwitchToWeb2Signup';
import { WalletIcon } from '../WalletsUI/WalletsIcon';
import classes from './FetchAccountsConfirmation.module.scss';
import { Button } from '../Button';

function FetchAccountsConfirmation({
	selectedWallet,
	switchToSignup,
	onWalletChange,
	getAccounts
}: {
	selectedWallet: EWallet;
	switchToSignup: () => void;
	onWalletChange: (wallet: EWallet | null) => void;
	getAccounts: (wallet: EWallet) => void;
}) {
	return (
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
	);
}

export default FetchAccountsConfirmation;
