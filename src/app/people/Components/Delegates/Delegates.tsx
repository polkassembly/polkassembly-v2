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
		const results = await Promise.allSettled(delegatesNeedingPublicUser.map((d) => UserProfileClientService.fetchPublicUserByAddress({ address: d.address })));

		const publicUsersMap = new Map();
		results.forEach((result, index) => {
			if (result.status === 'fulfilled' && result.value.data) {
				const { address } = delegatesNeedingPublicUser[index];
				publicUsersMap.set(address, result.value.data);
			}
		});

		return publicUsersMap;
	};

	const { data: publicUsersMap = new Map() } = useQuery({
		queryKey: ['delegatesPublicUsers', delegates.length],
		queryFn: fetchAllPublicUsers,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: delegates.length > 0
	});

	const allUserIds = delegates.map((d) => d.publicUser?.id || publicUsersMap.get(d.address)?.id).filter((id): id is number => id !== undefined);

	const fetchAllFollowersAndFollowing = async () => {
		const [followersResults, followingResults] = await Promise.all([
			Promise.allSettled(allUserIds.map((userId) => UserProfileClientService.getFollowers({ userId }))),
			Promise.allSettled(allUserIds.map((userId) => UserProfileClientService.getFollowing({ userId })))
		]);

		const followersMap = new Map();
		const followingMap = new Map();

		followersResults.forEach((result, index) => {
			if (result.status === 'fulfilled' && result.value.data) {
				followersMap.set(allUserIds[index], result.value.data);
			}
		});

		followingResults.forEach((result, index) => {
			if (result.status === 'fulfilled' && result.value.data) {
				followingMap.set(allUserIds[index], result.value.data);
			}
		});

		return { followersMap, followingMap };
	};

	const { data: socialData } = useQuery({
		queryKey: ['delegatesSocialData', allUserIds.join(',')],
		queryFn: fetchAllFollowersAndFollowing,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: allUserIds.length > 0
	});

	useEffect(() => {
		const fetchIdentities = async () => {
			if (!delegates.length || !identityService) return;

			const addresses = delegates.map((d) => d.address);
			const identities = await identityService.getIdentities(addresses);
			const verified = identities.filter((identity) => identity.isVerified).length;
			setVerifiedCount(verified);
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
