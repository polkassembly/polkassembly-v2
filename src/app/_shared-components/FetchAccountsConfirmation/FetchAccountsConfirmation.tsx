// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import SwitchToWeb2Signup from '@/app/login/Components/SwitchToWeb2Signup/SwitchToWeb2Signup';
import { useUserPreferences } from '@/app/_atoms/user/userPreferencesAtom';
import { WalletIcon } from '../WalletsUI/WalletsIcon';
import classes from './FetchAccountsConfirmation.module.scss';
import { Button } from '../Button';

function FetchAccountsConfirmation({ switchToSignup, goBack, onConfirm }: { switchToSignup: () => void; goBack: () => void; onConfirm?: () => void }) {
	const [userPreferences] = useUserPreferences();
	if (!userPreferences.wallet) return null;

	return (
		<div>
			<p className={classes.addressHeader}>
				<WalletIcon wallet={userPreferences.wallet} />
				<span className={classes.walletName}>{WalletClientService.getWalletNameLabel(userPreferences.wallet)}</span>
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
					onClick={goBack}
				>
					Go Back
				</Button>
				<Button
					size='lg'
					className={classes.signupButton}
					onClick={() => {
						onConfirm?.();
					}}
				>
					Got It
				</Button>
			</div>
		</div>
	);
}

export default FetchAccountsConfirmation;
