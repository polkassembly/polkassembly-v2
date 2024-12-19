// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { usePolkadotApi } from '../polkadotJsApiAtom';

const walletAtom = atom<WalletClientService | null>(null);

export const useWalletService = () => {
	const [walletService, setWalletService] = useAtom(walletAtom);
	const network = getCurrentNetwork();
	const apiService = usePolkadotApi(network);

	useEffect(() => {
		// Todo: reload(notification) if service is null;

		const initWalletService = async () => {
			if (apiService) {
				const service = await WalletClientService.Init(network, apiService);
				setWalletService(service);
			}
		};

		initWalletService();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService]);

	return walletService;
};
