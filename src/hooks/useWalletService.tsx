// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { walletAtom } from '@/app/_atoms/wallet/walletAtom';
import { ENetwork } from '@/_shared/types';
import { PolkadotJSApiService } from '@/app/_client-services/polkadotJS_api_service';
import { usePolkadotApiService } from './usePolkadotApiService';
import { useIdentityService } from './useIdentityService';

export const useWalletService = () => {
	const [walletService, setWalletService] = useAtom(walletAtom);
	const network = getCurrentNetwork();
	const { apiService } = usePolkadotApiService();
	const { identityService } = useIdentityService();

	useEffect(() => {
		// Todo: reload(notification) if service is null;

		const isPolkadot = network === ENetwork.POLKADOT;
		const initWalletService = async () => {
			const service = await WalletClientService.Init(
				network,
				!isPolkadot && apiService instanceof PolkadotJSApiService ? apiService : undefined,
				// isPolkadot && apiService instanceof PolkadotApiService ? apiService : undefined,
				identityService || undefined
			);
			setWalletService(service);
		};

		initWalletService();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiService, identityService]);

	return useMemo(() => {
		return walletService;
	}, [walletService]);
};
