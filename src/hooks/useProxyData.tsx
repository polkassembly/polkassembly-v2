// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { allProxiesAtom } from '@/app/_atoms/proxy/proxyAtom';
import { IProxyRequest } from '@/_shared/types';
import { SortDirection } from '@tanstack/react-table';
import { usePolkadotApiService } from './usePolkadotApiService';

type ProxyDataReturn = {
	items: IProxyRequest[];
	totalCount: number;
	isLoading: boolean;
	error: string | null;
};

type UseProxyDataParams = {
	sortBy?: string;
	sortDirection?: SortDirection | null;
	page?: number;
	search?: string;
	filterTypes?: string[];
};

export const useProxyData = ({ page = 1, sortBy, sortDirection, search = '', filterTypes = [] }: UseProxyDataParams): ProxyDataReturn => {
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const [proxyData, setProxyData] = useAtom(allProxiesAtom);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Helper function to check if a proxy has any of the selected proxy types
	const filterProxiesByType = (proxies: IProxyRequest[], types: string[]): IProxyRequest[] => {
		if (!types.length) return proxies;

		return proxies.filter((proxy) => {
			return proxy.individualProxies?.some((ip) => types.includes(ip.proxyType)) || false;
		});
	};

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

				let data = await apiService.getProxyRequests({
					page,
					limit: 10,
					search
				});

				// Apply client-side filtering by proxy types if any types are selected
				if (filterTypes.length > 0 && data?.items?.length) {
					const filteredItems = filterProxiesByType(data.items, filterTypes);

					data = {
						items: filteredItems,
						// keep server-provided totalCount to avoid broken pagination UI
						totalCount: data.totalCount
					};
				}
				// Apply client-side sorting if sortBy and sortDirection are provided
				if (sortBy === 'proxies' && sortDirection && data?.items?.length) {
					const sortedItems = [...data.items].sort((a, b) => {
						const aProxyCount = typeof a.proxies === 'number' ? a.proxies : a.proxyAddresses?.length || 0;
						const bProxyCount = typeof b.proxies === 'number' ? b.proxies : b.proxyAddresses?.length || 0;

						return sortDirection === 'asc' ? aProxyCount - bProxyCount : bProxyCount - aProxyCount;
					});

					data = {
						items: sortedItems,
						totalCount: data.totalCount
					};
				}

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
	}, [apiService, page, search, sortBy, sortDirection, filterTypes, network, setProxyData]);

	return {
		items: proxyData.items || [],
		totalCount: proxyData.totalCount || 0,
		isLoading: !apiService || isLoading,
		error
	};
};
