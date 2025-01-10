// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { EWallet } from '@/_shared/types';
import { Button } from '@ui/Button';
import { WalletIcon } from '@ui/WalletsUI/WalletsIcon';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import classes from './WalletButton.module.scss';

function WalletButton({ wallet, onClick, disabled, label, small }: { wallet: EWallet; onClick: (wallet: EWallet) => void; disabled?: boolean; label: string; small?: boolean }) {
	const walletName = wallet === EWallet.NOVAWALLET ? EWallet.POLKADOT : wallet;
	const { userPreferences, setUserPreferences } = useUserPreferences();

	const onWalletSelect = (selectedWallet: EWallet) => {
		setUserPreferences({
			...userPreferences,
			wallet: selectedWallet
		});
		onClick(selectedWallet);
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (wallet === EWallet.NOVAWALLET && !(window as any).walletExtension?.isNovaWallet) return null;

	return small ? (
		<Button
			onClick={() => onWalletSelect(walletName)}
			size='icon'
			disabled={disabled}
			variant='outline'
		>
			<WalletIcon wallet={wallet} />
		</Button>
	) : (
		<Button
			onClick={() => onWalletSelect(walletName)}
			variant='outline'
			className={classes.walletButton}
			leftIcon={<WalletIcon wallet={wallet} />}
			disabled={disabled}
			size='lg'
		>
			{label}
		</Button>
	);
}

export default WalletButton;
