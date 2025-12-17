// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { IDelegateDetails, IOnChainIdentity, IFollowEntry, IPublicUser } from '@/_shared/types';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUser } from '@/hooks/useUser';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import styles from './PeopleCard.module.scss';
import DelegateProfileInfo from './DelegateCardParts/DelegateProfileInfo';
import DelegateBioAndSocials from './DelegateCardParts/DelegateBioAndSocials';
import DelegateStats from './DelegateCardParts/DelegateStats';

interface DelegateCardProps {
	delegate: IDelegateDetails;
	publicUser?: IPublicUser;
	followers?: { followers: IFollowEntry[] };
	following?: { following: IFollowEntry[] };
}

function DelegateCard({ delegate, publicUser: publicUserProp, followers: followersProp, following: followingProp }: DelegateCardProps) {
	const t = useTranslations();
	const { user } = useUser();
	const network = getCurrentNetwork();

	const { getOnChainIdentity } = useIdentityService();
	const [identity, setIdentity] = useState<IOnChainIdentity | null>(null);
	const [isIdentityFetching, setIsIdentityFetching] = useState(true);

	const [publicUser, setPublicUser] = useState<IPublicUser | undefined>(publicUserProp || delegate.publicUser);

	const queryClient = useQueryClient();

	useEffect(() => {
		if (publicUserProp) {
			setPublicUser(publicUserProp);
		}
	}, [publicUserProp]);

	useEffect(() => {
		const fetchPublicUser = async () => {
			if (!publicUser && !publicUserProp && delegate.address) {
				const { data, error } = await UserProfileClientService.fetchPublicUserByAddress({ address: delegate.address });
				if (data && !error) {
					setPublicUser(data);
				}
			}
		};
		fetchPublicUser();
	}, [publicUser, publicUserProp, delegate.address]);

	useEffect(() => {
		const fetchIdentity = async () => {
			if (!delegate?.address) {
				setIsIdentityFetching(false);
				return;
			}

			try {
				setIsIdentityFetching(true);
				const identityInfo = await getOnChainIdentity(delegate.address);
				if (identityInfo) {
					setIdentity(identityInfo);
				}
			} catch (error) {
				console.error('Error fetching identity:', error);
			} finally {
				setIsIdentityFetching(false);
			}
		};

		fetchIdentity();
	}, [delegate?.address, getOnChainIdentity]);

	const fetchFollowers = async () => {
		if (!publicUser?.id) return { followers: [] };
		const { data, error } = await UserProfileClientService.getFollowers({ userId: publicUser.id });
		if (error) {
			return { followers: [] };
		}
		return data;
	};

	const { data: followers, isFetching: isFetchingFollowers } = useQuery({
		queryKey: ['followers', publicUser?.id, user?.id],
		queryFn: () => fetchFollowers(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!publicUser?.id && !followersProp,
		initialData: followersProp
	});

	const fetchFollowing = async () => {
		if (!publicUser?.id) return { following: [] };
		const { data, error } = await UserProfileClientService.getFollowing({ userId: publicUser.id });
		if (error) {
			return { following: [] };
		}
		return data;
	};

	const { data: following, isFetching: isFetchingFollowing } = useQuery({
		queryKey: ['following', publicUser?.id, user?.id],
		queryFn: () => fetchFollowing(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!publicUser?.id && !followingProp,
		initialData: followingProp
	});

	const isFollowing = followers?.followers.some((item) => item.followerUserId === user?.id);

	const followUser = async () => {
		if (!publicUser?.id || !user?.id || user.id === publicUser.id) return;

		queryClient.setQueryData(['followers', publicUser.id, user?.id], (oldData: { followers: IFollowEntry[] } | undefined) => ({
			followers: [
				...(oldData?.followers || []),
				{
					id: publicUser?.id || 0,
					createdAt: new Date(),
					followerUserId: user.id,
					followedUserId: publicUser?.id || 0,
					updatedAt: new Date()
				}
			]
		}));

		const { data, error } = await UserProfileClientService.followUser({ userId: publicUser.id });

		if (!data || error) {
			queryClient.invalidateQueries({ queryKey: ['followers', publicUser.id, user?.id] });
		}
	};

	const unfollowUser = async () => {
		if (!publicUser?.id || !user?.id || user.id === publicUser.id) return;

		queryClient.setQueryData(['followers', publicUser.id, user?.id], (oldData: { followers: IFollowEntry[] } | undefined) => ({
			...oldData,
			followers: (oldData?.followers || []).filter((item) => item.followerUserId !== user.id)
		}));

		const { data, error } = await UserProfileClientService.unfollowUser({ userId: publicUser.id });

		if (!data || error) {
			queryClient.invalidateQueries({ queryKey: ['followers', publicUser.id, user?.id] });
		}
	};

	return (
		<div className={styles.memberCard}>
			<DelegateProfileInfo
				delegate={delegate}
				publicUser={publicUser}
				identity={identity}
				isFollowing={!!isFollowing}
				followersCount={followers?.followers?.length || 0}
				followingCount={following?.following?.length || 0}
				isFetchingFollowers={isFetchingFollowers}
				isFetchingFollowing={isFetchingFollowing}
				isIdentityFetching={isIdentityFetching}
				onFollow={followUser}
				onUnfollow={unfollowUser}
			/>

			<DelegateBioAndSocials
				delegate={delegate}
				publicUser={publicUser}
			/>

			<DelegateStats
				delegate={delegate}
				network={network}
				t={t}
			/>
		</div>
	);
}
export default DelegateCard;
