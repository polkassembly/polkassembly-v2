// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { EWallet } from '@/_shared/types';
import { Button } from '@ui/Button';
import { WalletIcon } from '@ui/WalletsUI/WalletsIcon';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { cn } from '@/lib/utils';
import classes from './WalletButton.module.scss';

// Type for the Nova wallet extension
interface NovaWalletExtension {
	isNovaWallet?: boolean;
}

// Extend window with the wallet extension
declare global {
	interface Window {
		walletExtension?: NovaWalletExtension;
	}
}

function WalletButton({
	wallet,
	onClick,
	disabled,
	label,
	small,
	hidePreference
}: {
	wallet: EWallet;
	onClick?: (wallet: EWallet) => void;
	disabled?: boolean;
	label: string;
	small?: boolean;
	hidePreference?: boolean;
}) {
	const walletName = wallet === EWallet.NOVAWALLET ? EWallet.POLKADOT : wallet;
	const { userPreferences, setUserPreferences } = useUserPreferences();

	const onWalletSelect = (selectedWallet: EWallet) => {
		setUserPreferences({
			...userPreferences,
			wallet: selectedWallet
		});
		onClick?.(selectedWallet);
	};

	// If we're server-side rendering or this is a Nova wallet but the extension isn't available, don't render
	const isBrowser = typeof window !== 'undefined';
	if (!isBrowser) {
		// Skip the check during SSR
		// Return the component but it will re-render properly on the client
	} else if (wallet === EWallet.NOVAWALLET && !window.walletExtension?.isNovaWallet) {
		// Only check for Nova wallet if we're in the browser
		return null;
	}

	return small ? (
		<Button
			onClick={() => onWalletSelect(walletName)}
			size='icon'
			disabled={disabled}
			variant='outline'
			type='button'
			className={cn(wallet === userPreferences.wallet && !hidePreference && 'border border-navbar_border', disabled ? 'bg-wallet_disabled_bg' : 'bg-bg_modal')}
		>
			<WalletIcon wallet={wallet} />
		</Button>
	) : (
		<Button
			onClick={() => onWalletSelect(walletName)}
			variant='outline'
			className={cn(
				classes.walletButton,
				wallet === userPreferences.wallet && !hidePreference && 'border border-navbar_border',
				disabled ? 'bg-wallet_disabled_bg' : 'bg-bg_modal'
			)}
			leftIcon={<WalletIcon wallet={wallet} />}
			disabled={disabled}
			size='lg'
			type='button'
		>
			<span>{label}</span>
		</Button>
	);
}

export default WalletButton;
