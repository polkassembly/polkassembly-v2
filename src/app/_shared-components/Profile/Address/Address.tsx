// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IFollowEntry, IOnChainIdentity, IPublicUser } from '@/_shared/types';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUser } from '@/hooks/useUser';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import AddressInline from './AddressInline/AddressInline';
import classes from './AddressInline/AddressInline.module.scss';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../Tooltip';
import AddressTooltipContent from './AddressTooltipContent';

// Type Definitions
interface AddressProps {
	className?: string;
	address: string;
	truncateCharLen?: number;
	iconSize?: number;
	showIdenticon?: boolean;
	walletAddressName?: string;
	textClassName?: string;
}

// Utility Functions
const getUserRedirection = (network: string, address: string, username?: string): string | null => {
	if (!network) return null;
	return username?.length ? `https://${network}.polkassembly.io/user/${username}` : address?.length ? `https://${network}.polkassembly.io/address/${address}` : null;
};

// Main Address Component
const Address = React.memo(({ className, address, truncateCharLen = 5, iconSize = 20, showIdenticon = true, walletAddressName, textClassName }: AddressProps) => {
	const network = getCurrentNetwork();
	const { getOnChainIdentity } = useIdentityService();
	const { user: currentUser } = useUser();
	const queryClient = useQueryClient();
	const [displayText, setDisplayText] = useState<string>(walletAddressName || '');
	const [loading, setLoading] = useState(false);
	const encodedAddress = useMemo(() => getEncodedAddress(address, network) || address, [address, network]);
	const redirectionUrl = useMemo(() => getUserRedirection(network, address, undefined), [network, address]);

	const queryOptions = useMemo(
		() => ({
			refetchInterval: 10000,
			staleTime: 5 * 60 * 1000
		}),
		[]
	);

	const { data: userData } = useQuery<IPublicUser | null>({
		queryKey: ['userData', encodedAddress],
		queryFn: async () => {
			const { data } = await UserProfileClientService.fetchPublicUserByAddress({ address: encodedAddress });
			return data ?? null;
		},
		enabled: !!encodedAddress,
		...queryOptions
	});

	const { data: followingData } = useQuery<{ following: IFollowEntry[] }>({
		queryKey: ['following', userData?.id],
		queryFn: async () => {
			if (!userData?.id) return { following: [] };
			const { data } = await UserProfileClientService.getFollowing({ userId: userData.id });
			return data ?? { following: [] };
		},
		enabled: !!userData?.id,
		...queryOptions
	});

	const { data: followersData } = useQuery<{ followers: IFollowEntry[] }>({
		queryKey: ['followers', userData?.id],
		queryFn: async () => {
			if (!userData?.id) return { followers: [] };
			const { data } = await UserProfileClientService.getFollowers({ userId: userData.id });
			return data ?? { followers: [] };
		},
		enabled: !!userData?.id,
		...queryOptions
	});

	const [identity, setIdentity] = useState<IOnChainIdentity | null>(null);

	const fetchIdentity = async () => {
		setDisplayText(walletAddressName || shortenAddress(encodedAddress, truncateCharLen));
		try {
			const identityInfo = await getOnChainIdentity(encodedAddress);
			setIdentity(identityInfo);
			if (identityInfo?.display) {
				setDisplayText(identityInfo?.display);
			}
		} catch (error) {
			console.error('Error fetching identity:', error);
		}
	};

	useEffect(() => {
		fetchIdentity();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [encodedAddress, network, getOnChainIdentity]);

	const stats = useMemo(
		() => ({
			following: followingData?.following.length || 0,
			followers: followersData?.followers.length || 0
		}),
		[followingData, followersData]
	);

	const isFollowing = useMemo(() => followersData?.followers.some((item) => item.followerUserId === currentUser?.id) || false, [followersData, currentUser]);

	useEffect(() => {
		const newDisplayText = identity?.display || walletAddressName || shortenAddress(encodedAddress, truncateCharLen);
		setDisplayText(newDisplayText);
	}, [encodedAddress, identity, truncateCharLen, walletAddressName]);

	const copyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
	}, []);

	const followUser = useCallback(async () => {
		if (!currentUser?.id || currentUser.id === userData?.id || !userData) return;
		setLoading(true);
		const { data, error } = await UserProfileClientService.followUser({ userId: userData.id });
		setLoading(false);

		if (data && !error) {
			queryClient.setQueryData<{ followers: IFollowEntry[] }>(['followers', userData.id], (oldData) => ({
				followers: [
					...(oldData?.followers || []),
					{
						id: String(userData.id),
						createdAt: userData.createdAt ?? new Date(),
						followerUserId: currentUser.id,
						followedUserId: userData.id,
						updatedAt: new Date()
					}
				]
			}));
		}
	}, [currentUser, userData, queryClient]);

	const unfollowUser = useCallback(async () => {
		if (!currentUser?.id || currentUser.id === userData?.id || !userData) return;
		setLoading(true);
		const { data, error } = await UserProfileClientService.unfollowUser({ userId: userData.id });
		setLoading(false);

		if (data && !error) {
			queryClient.setQueryData<{ followers: IFollowEntry[] }>(['followers', userData.id], (oldData) => ({
				followers: oldData?.followers.filter((item) => item.followerUserId !== currentUser.id) || []
			}));
		}
	}, [currentUser, userData, queryClient]);

	return (
		<div className={classes.tooltipWrapper}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className='relative cursor-pointer'>
							<AddressInline
								className={className}
								address={encodedAddress}
								onChainIdentity={identity ?? undefined}
								addressDisplayText={displayText}
								iconSize={iconSize}
								showIdenticon={showIdenticon}
								textClassName={textClassName}
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent className={classes.tooltipContent}>
						<AddressTooltipContent
							address={address}
							userData={userData ?? undefined}
							identity={identity ?? undefined}
							followers={stats.followers}
							displayText={displayText}
							following={stats.following}
							isFollowing={isFollowing}
							redirectionUrl={redirectionUrl}
							onCopy={copyToClipboard}
							onFollow={followUser}
							onUnfollow={unfollowUser}
							loading={loading}
						/>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
});

export default Address;
