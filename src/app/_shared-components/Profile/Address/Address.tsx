// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IFollowEntry, IOnChainIdentity, IPublicUser } from '@/_shared/types';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import AddressInline from './AddressInline/AddressInline';
import classes from './AddressInline/AddressInline.module.scss';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../Tooltip';
import AddressTooltipContent from './AddressTooltipContent';

interface AddressProps {
	className?: string;
	address: string;
	truncateCharLen?: number;
	iconSize?: number;
	showIdenticon?: boolean;
	walletAddressName?: string;
	textClassName?: string;
	redirectToProfile?: boolean;
}

const getUserRedirection = (network: string, address: string, username?: string): string | null => {
	if (!network) return null;
	return username?.length ? `https://${network}.polkassembly.io/user/${username}` : address?.length ? `https://${network}.polkassembly.io/address/${address}` : null;
};

const Address = memo(({ className, address, truncateCharLen = 5, iconSize = 20, showIdenticon = true, walletAddressName, textClassName, redirectToProfile }: AddressProps) => {
	const network = getCurrentNetwork();
	const { getOnChainIdentity } = useIdentityService();
	const { user: currentUser } = useUser();
	const queryClient = useQueryClient();
	const [displayText, setDisplayText] = useState<string>(walletAddressName || '');
	const [loading, setLoading] = useState(false);
	const [isUserDataFetched, setIsUserDataFetched] = useState(false);
	const [userDataFetchInProgress, setUserDataFetchInProgress] = useState(false);
	const encodedAddress = useMemo(() => getEncodedAddress(address, network) || address, [address, network]);
	const redirectionUrl = useMemo(() => getUserRedirection(network, address, undefined), [network, address]);
	const [identity, setIdentity] = useState<IOnChainIdentity | null>(null);

	useEffect(() => {
		const initializeIdentity = async () => {
			setDisplayText(walletAddressName || shortenAddress(encodedAddress, truncateCharLen));

			try {
				const identityInfo = await getOnChainIdentity(encodedAddress);
				if (identityInfo) {
					setIdentity(identityInfo);
					if (identityInfo?.display) {
						setDisplayText(identityInfo?.display);
					}
				}
			} catch (error) {
				console.error('Error fetching identity:', error);
			}
		};

		initializeIdentity();
	}, [encodedAddress, getOnChainIdentity, truncateCharLen, walletAddressName]);

	const queryOptions = useMemo(
		() => ({
			refetchInterval: 10000,
			staleTime: 5 * 60 * 1000,
			enabled: false
		}),
		[]
	);

	const {
		data: userData,
		refetch: refetchUserData,
		isFetching: isUserDataFetching
	} = useQuery<IPublicUser | null>({
		queryKey: ['userData', encodedAddress],
		queryFn: async () => {
			const { data } = await UserProfileClientService.fetchPublicUserByAddress({ address: encodedAddress });
			return data ?? null;
		},
		...queryOptions
	});

	const {
		data: followingData,
		refetch: refetchFollowing,
		isFetching: isFollowingFetching
	} = useQuery<{ following: IFollowEntry[] }>({
		queryKey: ['following', userData?.id],
		queryFn: async () => {
			if (!userData?.id) return { following: [] };
			const { data } = await UserProfileClientService.getFollowing({ userId: userData.id });
			return data ?? { following: [] };
		},
		...queryOptions
	});

	const {
		data: followersData,
		refetch: refetchFollowers,
		isFetching: isFollowersFetching
	} = useQuery<{ followers: IFollowEntry[] }>({
		queryKey: ['followers', userData?.id],
		queryFn: async () => {
			if (!userData?.id) return { followers: [] };
			const { data } = await UserProfileClientService.getFollowers({ userId: userData.id });
			return data ?? { followers: [] };
		},
		...queryOptions
	});

	const stats = useMemo(
		() => ({
			following: followingData?.following.length,
			followers: followersData?.followers.length
		}),
		[followingData, followersData]
	);

	const isFollowing = useMemo(() => followersData?.followers.some((item) => item.followerUserId === currentUser?.id) || false, [followersData, currentUser]);

	const copyToClipboard = useCallback((text: string) => {
		navigator.clipboard.writeText(text);
		// TODO: Add toast notification
	}, []);

	const followUser = useCallback(async () => {
		if (!currentUser?.id || currentUser.id === userData?.id || !userData) return;
		setLoading(true);

		const { data, error } = await UserProfileClientService.followUser({ userId: userData.id });
		if (!data || error) {
			setLoading(false);
			return;
		}

		queryClient.setQueryData<{ followers: IFollowEntry[] }>(['followers', userData.id], (oldData) => ({
			followers: [
				...(oldData?.followers || []),
				{
					id: String(userData.id),
					createdAt: new Date(),
					followerUserId: currentUser.id,
					followedUserId: userData.id,
					updatedAt: new Date()
				}
			]
		}));
		setLoading(false);
	}, [currentUser, userData, queryClient]);

	const unfollowUser = useCallback(async () => {
		if (!currentUser?.id || currentUser.id === userData?.id || !userData) return;
		setLoading(true);

		const { data, error } = await UserProfileClientService.unfollowUser({ userId: userData.id });
		if (!data || error) {
			setLoading(false);
			return;
		}

		queryClient.setQueryData<{ followers: IFollowEntry[] }>(['followers', userData.id], (oldData) => ({
			followers: oldData?.followers.filter((item) => item.followerUserId !== currentUser.id) || []
		}));
		setLoading(false);
	}, [currentUser, userData, queryClient]);

	const handleMouseEnter = useCallback(async () => {
		if (!isUserDataFetched && !userDataFetchInProgress) {
			setUserDataFetchInProgress(true);
			await refetchUserData();
			setTimeout(async () => {
				if (userData?.id) {
					await Promise.all([refetchFollowing(), refetchFollowers()]);
				}

				setIsUserDataFetched(true);
				setUserDataFetchInProgress(false);
			}, 100);
		}
	}, [isUserDataFetched, userDataFetchInProgress, refetchUserData, refetchFollowing, refetchFollowers, userData?.id]);

	const handleMouseLeave = useCallback(() => {}, []);

	const isLoadingData = userDataFetchInProgress || isUserDataFetching || isFollowingFetching || isFollowersFetching;

	return (
		<div
			className={classes.tooltipWrapper}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className='relative cursor-pointer'>
							<AddressInline
								className={className}
								address={encodedAddress}
								onChainIdentity={identity as IOnChainIdentity}
								addressDisplayText={displayText}
								iconSize={iconSize}
								showIdenticon={showIdenticon}
								textClassName={textClassName}
								redirectToProfile={redirectToProfile}
							/>
						</div>
					</TooltipTrigger>
					<TooltipContent className={cn(classes.tooltipContent, 'bg-address_tooltip_bg w-[340px]')}>
						{isLoadingData ? (
							<div className='flex w-full items-center justify-center p-4'>
								<div className='h-6 w-6 animate-spin rounded-full border-b-2 border-text_pink' />
								<span className='ml-2 text-sm text-text_primary'>Loading Profile...</span>
							</div>
						) : (
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
						)}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
});

export default Address;
