// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect } from 'react';
import { EWallet } from '@/_shared/types';
import WalletButton from '@ui/WalletsUI/WalletButton/WalletButton';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import { useWalletService } from '@/hooks/useWalletService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import classes from './WalletButtons.module.scss';

function WalletButtons({
	onWalletChange,
	small,
	hidePreference,
	disabled
}: {
	onWalletChange?: (wallet: EWallet | null) => void;
	small?: boolean;
	hidePreference?: boolean;
	disabled?: boolean;
}) {
	const walletService = useWalletService();
	const availableWallets = walletService?.getInjectedWallets();

	const { userPreferences, setUserPreferences } = useUserPreferences();

	useEffect(() => {
		if (userPreferences.wallet || !availableWallets || Object.keys(availableWallets).length === 0) return;

		const walletKeys = Object.keys(availableWallets);
		const preferredWallet = walletKeys.includes(EWallet.POLKADOT) ? EWallet.POLKADOT : (walletKeys[0] as EWallet);

		setUserPreferences({
			...userPreferences,
			wallet: preferredWallet
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [availableWallets]);

	return (
		<div className={`${small ? classes.buttonsAlignmentSmall : classes.buttonsAlignment}`}>
			{!small && <p className={classes.header}>Select a Wallet</p>}
			{Object.values(EWallet).map((wallet) => {
				if (!wallet) return null;
				return (
					<WalletButton
						key={wallet}
						disabled={!availableWallets?.[String(wallet)] || disabled}
						wallet={wallet}
						onClick={onWalletChange}
						label={WalletClientService.getWalletNameLabel(wallet)}
						small={small}
						hidePreference={hidePreference}
					/>
				);
			})}
		</div>
	);
}

export default WalletButtons;
