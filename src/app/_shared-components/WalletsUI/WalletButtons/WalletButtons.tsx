// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useMemo } from 'react';
import { EWallet, EFeature } from '@/_shared/types';
import WalletButton from '@ui/WalletsUI/WalletButton/WalletButton';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import { useWalletService } from '@/hooks/useWalletService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getSupportedWallets } from '@/_shared/_utils/getSupportedWallets';
import { ValidatorService } from '@shared/_services/validator_service';
import { METAMASK_SUPPORTED_FEATURES } from '@/_shared/_constants/featureFlags';
import dynamic from 'next/dynamic';
import classes from './WalletButtons.module.scss';

const SignVaultTransaction = dynamic(() => import('../../PolkadotVault/SignVaultTransaction/SignVaultTransaction'), { ssr: false });

function WalletButtons({
	onWalletChange,
	small,
	hidePreference,
	disabled,
	action
}: {
	onWalletChange?: (wallet: EWallet | null) => void;
	small?: boolean;
	hidePreference?: boolean;
	disabled?: boolean;
	action?: EFeature;
}) {
	const { userPreferences, setUserPreferences } = useUserPreferences();
	const network = getCurrentNetwork();

	const walletService = useWalletService();
	const availableWallets = walletService?.getInjectedWallets(network);

	const supportedWallets = useMemo(() => {
		return getSupportedWallets(network, action);
	}, [network, action]);

	useEffect(() => {
		if (userPreferences.wallet || !availableWallets || Object.keys(availableWallets).length === 0) return;

		const walletKeys = Object.keys(availableWallets);
		if (ValidatorService.isValidEthereumNetwork(network)) {
			const getWallet = () => {
				if (walletKeys.includes(EWallet.METAMASK) && METAMASK_SUPPORTED_FEATURES.includes(action!)) {
					return EWallet.METAMASK;
				}

				if (walletKeys.includes(EWallet.SUBWALLET)) {
					return EWallet.SUBWALLET;
				}

				if (walletKeys.includes(EWallet.TALISMAN)) {
					return EWallet.TALISMAN;
				}

				return walletKeys[0] as EWallet;
			};

			const preferredWallet = getWallet();

			setUserPreferences({
				...userPreferences,
				wallet: preferredWallet
			});
			return;
		}
		const preferredWallet = walletKeys.includes(EWallet.POLKADOT) ? EWallet.POLKADOT : (walletKeys[0] as EWallet);

		setUserPreferences({
			...userPreferences,
			wallet: preferredWallet
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [availableWallets]);

	return (
		<>
			<SignVaultTransaction />
			<div className={`${small ? classes.buttonsAlignmentSmall : classes.buttonsAlignment}`}>
				{!small && <p className={classes.header}>Select a Wallet</p>}
				{supportedWallets.map((wallet) => {
					if (!wallet) return null;
					return (
						<WalletButton
							key={wallet}
							// eslint-disable-next-line security/detect-object-injection, @typescript-eslint/no-explicit-any
							disabled={Boolean(!(availableWallets as any)?.[wallet]) || disabled}
							wallet={wallet}
							onClick={onWalletChange}
							label={WalletClientService.getWalletNameLabel(wallet)}
							small={small}
							hidePreference={hidePreference}
						/>
					);
				})}
			</div>
		</>
	);
}

export default WalletButtons;
