// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { allProxiesAtom } from '@/app/_atoms/proxy/proxyAtom';
import { usePolkadotApiService } from './usePolkadotApiService';

export const useProxyData = (page: number = 1, search: string = '') => {
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const [allProxies, setAllProxies] = useAtom(allProxiesAtom);
	const [totalCount, setTotalCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchData = async () => {
			if (!apiService) {
				setIsLoading(true);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const data = await apiService.getProxyRequests({
					page,
					limit: 10,
					search
				});

				if (isMounted) {
					const newItems = data?.items ?? [];
					const newTotalCount = data?.totalCount ?? 0;
					setTotalCount(newTotalCount);
					setAllProxies(newItems);
				}
			} catch (err) {
				// Error is handled via error state
				if (isMounted) {
					setError(err instanceof Error ? err.message : 'Failed to fetch proxies');
					setTotalCount(0);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		fetchData();

		return () => {
			isMounted = false;
		};
	}, [apiService, page, search, network, setAllProxies]);

	return {
		items: allProxies,
		totalCount,
		isLoading: !apiService || isLoading,
		error
	};
};
