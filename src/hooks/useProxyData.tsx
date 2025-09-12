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
	const [proxyData, setProxyData] = useAtom(allProxiesAtom);
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
				// Wait for API to be fully ready
				await apiService.apiReady();

				const data = await apiService.getProxyRequests({
					page,
					limit: 10,
					search
				});

				if (isMounted) {
					setProxyData({
						items: data?.items ?? [],
						totalCount: data?.totalCount ?? 0
					});
				}
			} catch (err) {
				// Error is handled via error state
				if (isMounted) {
					setError(err instanceof Error ? err.message : 'Failed to fetch proxies');
					setProxyData({
						items: [],
						totalCount: 0
					});
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
	}, [apiService, page, search, network, setProxyData]);

	return {
		items: proxyData.items,
		totalCount: proxyData.totalCount,
		isLoading: !apiService || isLoading,
		error
	};
};
