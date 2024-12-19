// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EWallet } from '@/_shared/types';
import PolkadotJSIcon from '@assets/wallet-icons/polkadotjs-icon.svg';
import TalismanIcon from '@assets/wallet-icons/talisman-icon.svg';
import SubWalletIcon from '@assets/wallet-icons/subwallet-icon.svg';
import PolkagateIcon from '@assets/wallet-icons/polkagate-icon.svg';
import NovaIcon from '@assets/wallet-icons/nova-wallet-star.svg';
import Image from 'next/image';

export function WalletIcon({ wallet, className }: { wallet: EWallet; className?: string }) {
	switch (wallet) {
		case EWallet.POLKADOT:
			return (
				<Image
					alt=''
					src={PolkadotJSIcon}
					className={`h-6 w-6 sm:h-8 sm:w-8 ${className}`}
				/>
			);
		case EWallet.TALISMAN:
			return (
				<Image
					alt=''
					src={TalismanIcon}
					className={`h-6 w-6 sm:h-8 sm:w-8 ${className}`}
				/>
			);
		case EWallet.SUBWALLET:
			return (
				<Image
					alt=''
					src={SubWalletIcon}
					className={`h-6 w-6 sm:h-8 sm:w-8 ${className}`}
				/>
			);
		case EWallet.POLKAGATE:
			return (
				<Image
					alt=''
					src={PolkagateIcon}
					className={`h-6 w-6 sm:h-8 sm:w-8 ${className}`}
				/>
			);
		case EWallet.NOVAWALLET:
			return (
				<Image
					alt=''
					src={NovaIcon}
					className={`h-6 w-6 sm:h-8 sm:w-8 ${className}`}
				/>
			);

		default:
			return <div />;
	}
}
