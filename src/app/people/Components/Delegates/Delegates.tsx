// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import useDelegateFiltering from '@/hooks/useDelegateFiltering';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { delegatesAtom } from '@/app/_atoms/delegation/delegationAtom';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useState, useEffect, useRef, RefObject } from 'react';
import MembersStats from '../Stats/MembersStats';
import DelegateCard from '../PeopleCards/DelegateCard';

function CommunityDelegates({ page }: { page: number }) {
	const [delegates, setDelegates] = useAtom(delegatesAtom);
	const { identityService } = useIdentityService();
	const [verifiedCount, setVerifiedCount] = useState<number>(0);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const fetchDelegates = async () => {
		const { data, error } = await NextApiClientService.fetchDelegates();
		if (error || !data) {
			return [];
		}

		setDelegates(data);
		return data;
	};

	const { isLoading } = useQuery({
		queryKey: ['delegates'],
		queryFn: fetchDelegates,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const fetchAllPublicUsers = async () => {
		const delegatesNeedingPublicUser = delegates.filter((d) => !d.publicUser && d.address);
		const publicUsersMap = new Map();
		const BATCH_SIZE = 10;

		const batches: (typeof delegatesNeedingPublicUser)[] = [];
		for (let i = 0; i < delegatesNeedingPublicUser.length; i += BATCH_SIZE) {
			batches.push(delegatesNeedingPublicUser.slice(i, i + BATCH_SIZE));
		}

		await batches.reduce(async (previousPromise, batch) => {
			await previousPromise;
			const results = await Promise.allSettled(batch.map((d) => UserProfileClientService.fetchPublicUserByAddress({ address: d.address })));
			results.forEach((result, index) => {
				if (result.status === 'fulfilled' && result.value.data) {
					const { address } = batch[index];
					publicUsersMap.set(address, result.value.data);
				}
			});
		}, Promise.resolve());

		return publicUsersMap;
	};

	const { data: publicUsersMap = new Map() } = useQuery({
		queryKey: ['delegatesPublicUsers', delegates.length],
		queryFn: fetchAllPublicUsers,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: delegates.length > 0
	});

	const allUserIds = delegates.map((d) => d.publicUser?.id || publicUsersMap.get(d.address)?.id).filter((id): id is number => id !== undefined);
	const uniqueUserIds = Array.from(new Set(allUserIds));

	const fetchAllFollowersAndFollowing = async () => {
		const followersMap = new Map();
		const followingMap = new Map();
		const BATCH_SIZE = 10;

		const batches: number[][] = [];
		for (let i = 0; i < uniqueUserIds.length; i += BATCH_SIZE) {
			batches.push(uniqueUserIds.slice(i, i + BATCH_SIZE));
		}

		const batchResults = await Promise.all(
			batches.map((batchIds) =>
				Promise.all([
					Promise.allSettled(batchIds.map((userId) => UserProfileClientService.getFollowers({ userId }))),
					Promise.allSettled(batchIds.map((userId) => UserProfileClientService.getFollowing({ userId })))
				])
			)
		);

		batchResults.forEach(([followersResults, followingResults], batchIndex) => {
			const batchIds = batches[batchIndex];

			followersResults.forEach((result, index) => {
				if (result.status === 'fulfilled' && result.value.data) {
					followersMap.set(batchIds[index], result.value.data);
				}
			});

			followingResults.forEach((result, index) => {
				if (result.status === 'fulfilled' && result.value.data) {
					followingMap.set(batchIds[index], result.value.data);
				}
			});
		});

		return { followersMap, followingMap };
	};

	const { data: socialData } = useQuery({
		queryKey: ['delegatesSocialData', uniqueUserIds.join(',')],
		queryFn: fetchAllFollowersAndFollowing,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: uniqueUserIds.length > 0
	});

	useEffect(() => {
		const fetchIdentities = async () => {
			if (!delegates.length || !identityService) return;

			try {
				const addresses = delegates.map((d) => d.address);
				const identities = await identityService.getIdentities(addresses);
				const verified = identities.filter((identity) => identity.isVerified).length;
				setVerifiedCount(verified);
			} catch (error) {
				console.error('Error fetching identities:', error);
				setVerifiedCount(0);
			}
		};

		fetchIdentities();
	}, [delegates, identityService]);

	const { filteredDelegates, totalDelegates, searchQuery, handleSearchChange, selectedSources, handleSourceChange, sortBy, handleSortChange } = useDelegateFiltering(
		delegates,
		page
	);

	return (
		<div>
			<MembersStats
				totalMembers={delegates.length}
				verifiedMembers={verifiedCount}
				searchQuery={searchQuery}
				handleSearchChange={handleSearchChange}
				selectedSources={selectedSources}
				handleSourceChange={handleSourceChange}
				sortBy={sortBy}
				handleSortChange={handleSortChange}
				searchInputRef={searchInputRef as RefObject<HTMLInputElement>}
			/>
			{isLoading ? (
				<div className='relative mt-20'>
					<LoadingLayover />
				</div>
			) : (
				<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6'>
					{filteredDelegates.map((delegate) => {
						const publicUser = delegate.publicUser || publicUsersMap.get(delegate.address);
						const userId = publicUser?.id;
						const followers = userId && socialData?.followersMap ? socialData.followersMap.get(userId) : undefined;
						const following = userId && socialData?.followingMap ? socialData.followingMap.get(userId) : undefined;

						return (
							<DelegateCard
								key={delegate.id}
								delegate={delegate}
								publicUser={publicUser}
								followers={followers}
								following={following}
							/>
						);
					})}
				</div>
			)}
			{totalDelegates > DEFAULT_LISTING_LIMIT && (
				<div className='mt-5 w-full'>
					<PaginationWithLinks
						page={page}
						pageSize={DEFAULT_LISTING_LIMIT}
						totalCount={totalDelegates}
						pageSearchParam='page'
					/>
				</div>
			)}
		</div>
	);
}

export default CommunityDelegates;
