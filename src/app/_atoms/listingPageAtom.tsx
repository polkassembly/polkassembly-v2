// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPostListing } from '@/_shared/types';
import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';

interface IListingCache {
	[cacheKey: string]: {
		data: IPostListing[];
		totalCount: number;
		timestamp: number;
	};
}

export const listingCacheAtom = atom<IListingCache>({});

const CACHE_DURATION = 5 * 60 * 1000;

export const useFetchListingData = () => {
	const [cache, setCache] = useAtom(listingCacheAtom);

	return useCallback(
		async ({
			proposalType,
			currentPage,
			selectedStatuses,
			selectedTags,
			origins
		}: {
			proposalType: string;
			currentPage: number;
			selectedStatuses: string[];
			selectedTags: string[];
			origins?: string[];
		}) => {
			const cacheKey = JSON.stringify({
				proposalType,
				page: currentPage,
				statuses: selectedStatuses,
				tags: selectedTags,
				origins
			});
			const now = Date.now();

			const cachedData = cache[cacheKey];
			if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
				console.log('Using cached data');
				return {
					data: cachedData.data,
					totalCount: cachedData.totalCount
				};
			}

			const { data, error } = await NextApiClientService.fetchListingDataApi(proposalType, currentPage, selectedStatuses, origins, selectedTags);

			if (error || !data) {
				throw new Error(error?.message || 'Failed to fetch data');
			}

			setCache((prevCache) => ({
				...prevCache,
				[cacheKey]: {
					data: data.posts || [],
					totalCount: data.totalCount || 0,
					timestamp: now
				}
			}));

			return {
				data: data.posts || [],
				totalCount: data.totalCount || 0
			};
		},
		[cache, setCache]
	);
};
