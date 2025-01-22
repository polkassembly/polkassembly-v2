// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EWallet } from '@/_shared/types';
import { Icon } from '@ui/Icon';

export function WalletIcon({ wallet, className }: { wallet: EWallet; className?: string }) {
	switch (wallet) {
		case EWallet.POLKADOT:
			return (
				<Icon
					name='wallet-icons/polkadotjs-icon'
					className={`h-6 w-6 sm:h-8 sm:w-8 ${className}`}
				/>
			);
		case EWallet.TALISMAN:
			return (
				<Icon
					name='wallet-icons/talisman-icon'
					className={`h-6 w-6 sm:h-8 sm:w-8 ${className}`}
				/>
			);
		case EWallet.SUBWALLET:
			return (
				<Icon
					name='wallet-icons/subwallet-icon'
					className={`h-6 w-6 sm:h-8 sm:w-8 ${className}`}
				/>
			);
		case EWallet.POLKAGATE:
			return (
				<Icon
					name='wallet-icons/polkagate-icon'
					className={`h-6 w-6 sm:h-8 sm:w-8 ${className}`}
				/>
			);
		case EWallet.NOVAWALLET:
			return (
				<Icon
					name='wallet-icons/nova-wallet-star'
					className={`h-6 w-6 sm:h-8 sm:w-8 ${className}`}
				/>
			);

		default:
			return <div />;
	}
}
