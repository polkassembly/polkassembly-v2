// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { walletAtom } from '@/app/_atoms/wallet/walletAtom';
import { usePolkadotApiService } from './usePolkadotApiService';

export const useWalletService = () => {
	const [walletService, setWalletService] = useAtom(walletAtom);
	const network = getCurrentNetwork();
	const apiService = usePolkadotApiService();

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

	return useMemo(() => {
		return walletService;
	}, [walletService]);
};
