// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { atom, useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { ENetwork } from '@shared/types';
import { IdentityService } from '../_client-services/identity_service';

const identityApiAtom = atom<IdentityService | null>(null);

export const useIdentityApi = (network: ENetwork) => {
	const [api, setApi] = useAtom(identityApiAtom);

	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval>;

		const initApi = async () => {
			if (!api) {
				const newApi = await IdentityService.Init(network);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	return useMemo(() => {
		return api;
	}, [api]);
};
