// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { identityApiAtom, identityCacheAtom } from '@/app/_atoms/polkadotJsApi/identityApiAtom';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useIdentityService = () => {
	const [api] = useAtom(identityApiAtom);
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
			[formattedAddress]: {
				identity,
				timestamp: now
			}
		}));

		return identity;
	};

	return useMemo(() => {
		return {
			getOnChainIdentity: getCachedIdentity
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, identityCache]);
};
