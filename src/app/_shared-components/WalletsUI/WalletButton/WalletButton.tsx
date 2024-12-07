// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { EWallet } from '@/_shared/types';
import { Button } from '@ui/Button';
import { WalletIcon } from '@ui/WalletsUI/WalletsIcon';
import classes from './WalletButton.module.scss';

function WalletButton({ wallet, onClick, disabled, label, small }: { wallet: EWallet; onClick: (wallet: EWallet) => void; disabled?: boolean; label: string; small?: boolean }) {
	return small ? (
		<Button
			onClick={() => onClick(wallet)}
			size='icon'
			disabled={disabled}
			variant='secondary'
		>
			<WalletIcon wallet={wallet} />
		</Button>
	) : (
		<Button
			onClick={() => onClick(wallet)}
			variant='secondary'
			className={classes.walletButton}
			leftIcon={<WalletIcon wallet={wallet} />}
			disabled={disabled}
			size='lg'
		>
			{label}
			{disabled && <p className={classes.notInstalled}>Not Installed</p>}
		</Button>
	);
}

export default WalletButton;
