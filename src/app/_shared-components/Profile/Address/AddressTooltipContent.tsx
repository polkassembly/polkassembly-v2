// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IPublicUser, IFollowEntry, IOnChainIdentity } from '@/_shared/types';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { dayjs } from '@shared/_utils/dayjsInit';
import { ShieldPlus } from 'lucide-react';
import ProfileImage from './ProfileImage';
import UserStats from './UserStats';
import SocialLinks from './SocialLinks';
import classes from './AddressInline/AddressInline.module.scss';
import { Button } from '../../Button';
import AddressDisplay from './AddressDisplay';

interface AddressTooltipContentProps {
	address: string;
	redirectionUrl: string | null;
	displayText: string;
	identity?: IOnChainIdentity;
}

const LoadingState = memo(() => (
	<div className='flex w-full items-center justify-center p-4'>
		<div className='h-6 w-6 animate-spin rounded-full border-b-2 border-text_pink' />
		<span className='ml-2 text-sm text-text_primary'>Loading Profile...</span>
	</div>
));

const AddressTooltipContent = memo(({ address, redirectionUrl, displayText, identity }: AddressTooltipContentProps) => {
	const router = useRouter();
	const t = useTranslations();
	const { user: currentUser } = useUser();
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState(false);

	const queryOptions = useMemo(
		() => ({
			refetchInterval: 10000,
			staleTime: 5 * 60 * 1000,
			enabled: true
		}),
		[]
	);

	const { data: userData, isFetching: isUserDataFetching } = useQuery<IPublicUser | null>({
		queryKey: ['userData', address],
		queryFn: async () => {
			const { data } = await UserProfileClientService.fetchPublicUserByAddress({ address });
			return data ?? null;
		},
		...queryOptions
	});

	const { data: followingData, isFetching: isFollowingFetching } = useQuery<{ following: IFollowEntry[] }>({
		queryKey: ['following', userData?.id],
		queryFn: async () => {
			if (!userData?.id) return { following: [] };
			const { data } = await UserProfileClientService.getFollowing({ userId: userData.id });
			return data ?? { following: [] };
		},
		...queryOptions
	});

	const { data: followersData, isFetching: isFollowersFetching } = useQuery<{ followers: IFollowEntry[] }>({
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

	const handleButtonClick = useCallback(() => {
		if (!currentUser?.id) {
			router.push('/login');
		} else if (isFollowing) {
			unfollowUser();
		} else {
			followUser();
		}
	}, [currentUser, isFollowing, router, followUser, unfollowUser]);

	const isLoadingData = isUserDataFetching || isFollowingFetching || isFollowersFetching;

	const renderContent = () => {
		if (isLoadingData) return <LoadingState />;

		const hasUserData = !!userData;
		return (
			<>
				<ProfileImage imageUrl={userData?.profileDetails?.image} />
				<div className={classes.tooltipContentWrapper}>
					<div
						aria-hidden='true'
						className='relative flex flex-col gap-1.5 border-solid pb-2 dark:border-none'
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
						}}
					>
						<div className={`flex flex-col gap-1.5 ${hasUserData ? 'px-2' : 'px-4'}`}>
							<AddressDisplay
								address={address}
								identity={identity}
								displayText={displayText}
								redirectionUrl={redirectionUrl}
								onCopy={copyToClipboard}
							/>
							{hasUserData && userData.createdAt && (
								<span className='flex items-center text-xs tracking-wide text-address_tooltip_text'>
									{t('Profile.since')}: <span className='ml-0.5 text-text_primary'>{dayjs(userData.createdAt).format('MMM DD, YYYY')}</span>
								</span>
							)}
							<div className={cn(hasUserData && userData.id && !isNaN(userData.id) ? 'flex items-center justify-between px-2' : 'flex items-center justify-start')}>
								<UserStats
									followers={stats.followers}
									following={stats.following}
								/>
								{hasUserData && <SocialLinks socialLinks={userData.profileDetails?.publicSocialLinks || []} />}
							</div>
							{hasUserData && (
								<Button
									size='lg'
									className='mt-2 rounded-3xl'
									leftIcon={<ShieldPlus />}
									isLoading={loading}
									onClick={handleButtonClick}
									disabled={!userData.id}
								>
									{isFollowing ? t('Profile.unfollow') : t('Profile.follow')}
								</Button>
							)}
						</div>
					</div>
				</div>
			</>
		);
	};

	return <div>{renderContent()}</div>;
});

export default AddressTooltipContent;
