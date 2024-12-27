// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { atom, useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { ENetwork, IOnChainIdentity } from '@shared/types';
import { IdentityService } from '../_client-services/identity_service';

interface IIdentityCache {
	[address: string]: {
		identity: IOnChainIdentity;
		timestamp: number;
	};
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const identityApiAtom = atom<IdentityService | null>(null);
const identityCacheAtom = atom<IIdentityCache>({});

export const useIdentityService = (network: ENetwork) => {
	const [api, setApi] = useAtom(identityApiAtom);
	const [identityCache, setIdentityCache] = useAtom(identityCacheAtom);

	const getCachedIdentity = async (address: string) => {
		const formattedAddress = !address.startsWith('0x') ? getSubstrateAddress(address) : address;

		if (!formattedAddress) return null;

		const cachedData = identityCache[String(formattedAddress)];
		const now = Date.now();

		// If we have valid cached data, return it
		if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
			return cachedData.identity;
		}

		// If no valid cache, fetch new data
		if (!api) return null;

		const identity = await api.getOnChainIdentity(formattedAddress);

		// Update cache
		setIdentityCache((prev) => ({
			...prev,
			[address]: {
				identity,
				timestamp: now
			}
		}));

		return identity;
	};

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
		return {
			identityApi: api,
			getOnChainIdentity: getCachedIdentity
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, identityCache]);
};
