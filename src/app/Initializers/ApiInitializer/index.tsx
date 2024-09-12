// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useApiAtom } from '@app/atoms/ApiAtom';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { networks } from '@shared/_constants/networks';
import { ENetwork } from '@shared/enum';
import { useEffect } from 'react';

// of the Apache-2.0 license. See the LICENSE file for details.
export function ApiInitializer({ network }: { network: ENetwork }) {
	const { setApi } = useApiAtom();
	const setNetworkApi = async () => {
		try {
			const provider = new WsProvider(networks[network].rpcEndpoint);
			const api = new ApiPromise({ provider: provider as WsProvider });
			if (!api) {
				console.log('api not found');
				return;
			}
			await api.isReady;
			console.log(network, 'connected');
			setApi(api);
		} catch (error) {
			console.error(error);
		}
	};
	useEffect(() => {
		setNetworkApi();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return null;
}
