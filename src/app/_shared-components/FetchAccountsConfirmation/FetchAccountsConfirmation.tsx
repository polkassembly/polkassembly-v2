// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import SwitchToWeb2Signup from '@/app/login/Components/SwitchToWeb2Signup/SwitchToWeb2Signup';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslations } from 'next-intl';
import { WalletIcon } from '../WalletsUI/WalletsIcon';
import classes from './FetchAccountsConfirmation.module.scss';
import { Button } from '../Button';

function FetchAccountsConfirmation({ switchToSignup, goBack, onConfirm }: { switchToSignup: () => void; goBack: () => void; onConfirm?: () => void }) {
	const { userPreferences } = useUserPreferences();
	const t = useTranslations();
	if (!userPreferences.wallet) return <div className='text-center text-text_primary'>{t('AddressDropdown.selectWallet')}</div>;

	return (
		<div>
			<p className={classes.addressHeader}>
				<WalletIcon wallet={userPreferences.wallet} />
				<span className={classes.walletName}>{WalletClientService.getWalletNameLabel(userPreferences.wallet)}</span>
			</p>
			<p className={classes.confirmationText}>{t('AddressDropdown.fetchingAddresses')}</p>
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
					{t('AddressDropdown.goBack')}
				</Button>
				<Button
					size='lg'
					className={classes.signupButton}
					onClick={() => {
						onConfirm?.();
					}}
				>
					{t('AddressDropdown.gotIt')}
				</Button>
			</div>
		</div>
	);
}

export default FetchAccountsConfirmation;
