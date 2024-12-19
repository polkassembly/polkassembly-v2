// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import { InjectedWindow } from '@polkadot/extension-inject/types';

const walletAtom = atom<WalletClientService | null>(null);

export const useWalletService = () => {
	const [walletService, setWalletService] = useAtom(walletAtom);

	useEffect(() => {
		const initWalletService = async () => {
			const injectedWindow = window as Window & InjectedWindow;
			const service = await WalletClientService.Init(injectedWindow);
			setWalletService(service);
		};

		if (document.readyState !== 'loading') {
			initWalletService();
		} else {
			document.addEventListener('DOMContentLoaded', initWalletService);
		}

		return () => {
			document.removeEventListener('DOMContentLoaded', initWalletService);
		};
	}, [setWalletService]);

	return walletService;
};
