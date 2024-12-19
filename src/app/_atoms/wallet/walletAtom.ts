// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import { ENetwork } from '@/_shared/types';

const walletAtom = atom<WalletClientService | null>(null);

export const useWalletService = () => {
	const [walletService, setWalletService] = useAtom(walletAtom);

	useEffect(() => {
		// Todo: reload(notification) if service is null;

		const initWalletService = async () => {
			const service = await WalletClientService.Init(ENetwork.POLKADOT);
			setWalletService(service);
		};

		initWalletService();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return walletService;
};
