// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { PolkadotApiService } from '@app/_client-services/polkadot_api_service';
import { ENetwork } from '@shared/types';

const polkadotApiAtom = atom<PolkadotApiService | null>(null);

export const usePolkadotApi = (network: ENetwork) => {
	const [api, setApi] = useAtom(polkadotApiAtom);

	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval>;

		const initApi = async () => {
			if (!api) {
				const newApi = await PolkadotApiService.Init(network);
				setApi(newApi);

				intervalId = setInterval(async () => {
					try {
						await newApi.keepAlive();
					} catch {
						await newApi.switchToNewRpcEndpoint();
					}
				}, 6000);
			}
		};

		initApi();

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
			if (api) {
				api.disconnect().then(() => setApi(null));
			}
		};
	}, [api, network, setApi]);

	return api;
};
