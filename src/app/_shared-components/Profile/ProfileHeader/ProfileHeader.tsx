// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProfileTabs, ESocial, IFollowEntry, IOnChainIdentity, IPublicUser } from '@/_shared/types';
import Identicon from '@polkadot/react-identicon';
import { Pencil, ShieldPlus } from 'lucide-react';
import { THEME_COLORS } from '@/app/_style/theme';
import { useTranslations } from 'next-intl';
import { dayjs } from '@shared/_utils/dayjsInit';
import Image from 'next/image';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import UserIcon from '@assets/profile/user-icon.svg';
import { useUser } from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import EmailIcon from '@assets/icons/email-icon.svg';
import TwitterIcon from '@assets/icons/twitter-icon.svg';
import TelegramIcon from '@assets/icons/telegram-icon.svg';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { cn } from '@/lib/utils';
import { useIdentityService } from '@/hooks/useIdentityService';
import { TabsList, TabsTrigger } from '../../Tabs';
import { Button } from '../../Button';
import classes from './ProfileHeader.module.scss';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import EditProfile from '../EditProfile/EditProfile';
import { Separator } from '../../Separator';
import { Skeleton } from '../../Skeleton';
import Address from '../Address/Address';

const SocialIcons = {
	[ESocial.EMAIL]: EmailIcon,
	[ESocial.TWITTER]: TwitterIcon,
	[ESocial.TELEGRAM]: TelegramIcon,
	[ESocial.DISCORD]: TelegramIcon,
	[ESocial.RIOT]: TelegramIcon,
	[ESocial.GITHUB]: TelegramIcon
};

function ProfileHeader({
	address,
	userProfileData,
	handleUserProfileDataChange
}: {
	address?: string;
	userProfileData?: IPublicUser;
	handleUserProfileDataChange: (data: IPublicUser) => void;
}) {
	const t = useTranslations();
	const { user } = useUser();
	const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false);
	const [loading, setLoading] = useState(false);
	const [identity, setIdentity] = useState<IOnChainIdentity | null>(null);
	const { identityService, getOnChainIdentity } = useIdentityService();

	useEffect(() => {
		if (!address) return;

		const fetchIdentity = async () => {
			const identityLocal = await getOnChainIdentity(address);
			setIdentity(identityLocal);
		};
		fetchIdentity();
	}, [identityService, address, getOnChainIdentity]);

	const queryClient = useQueryClient();

	// followers
	const fetchFollowers = async () => {
		if (!userProfileData) return null;

		const { data, error } = await UserProfileClientService.getFollowers({ userId: userProfileData.id });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}

		return data;
	};

	const { data: followers, isFetching: isFetchingFollowers } = useQuery({
		queryKey: ['followers', userProfileData?.id, user?.id],
		queryFn: () => fetchFollowers(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!userProfileData
	});

	// following
	const fetchFollowing = async () => {
		if (!userProfileData) return null;

		const { data, error } = await UserProfileClientService.getFollowing({ userId: userProfileData.id });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data: following, isFetching: isFetchingFollowing } = useQuery({
		queryKey: ['following', userProfileData?.id, user?.id],
		queryFn: () => fetchFollowing(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!userProfileData
	});

	const followUser = async () => {
		if (!userProfileData) return;

		if (!user?.id || user.id === userProfileData.id) return;
		setLoading(true);

		const { data, error } = await UserProfileClientService.followUser({ userId: userProfileData.id });

		setLoading(false);

		if (data && !error) {
			queryClient.setQueryData(['followers', userProfileData.id, user?.id], (oldData: { followers: IFollowEntry[] }) => {
				return {
					followers: [
						...(oldData?.followers || []),
						{
							id: userProfileData.id,
							createdAt: userProfileData.createdAt,
							followerUserId: user.id,
							followedUserId: userProfileData.id,
							updatedAt: new Date()
						}
					]
				};
			});
		}
	};

	const unfollowUser = async () => {
		if (!userProfileData) return;

		if (!user?.id || user.id === userProfileData.id) return;
		setLoading(true);

		const { data, error } = await UserProfileClientService.unfollowUser({ userId: userProfileData.id });

		setLoading(false);

		if (data && !error) {
			queryClient.setQueryData(['followers', userProfileData.id, user?.id], (oldData: { followers: IFollowEntry[] }) => {
				return { ...oldData, followers: oldData.followers.filter((item) => item.followerUserId !== user.id) };
			});
		}
	};

	const isFollowing = followers?.followers.some((item) => item.followerUserId === user?.id);

	return (
		<div>
			<div className={classes.profileHeaderWrapper}>
				<div className='relative'>
					{userProfileData?.profileDetails.image ? (
						<div className='w-[90px]'>
							<Image
								src={userProfileData?.profileDetails.image}
								alt='profile'
								className='rounded-full border-[5px] border-border_blue'
								width={90}
								height={90}
							/>
						</div>
					) : userProfileData?.addresses?.[0] || address ? (
						<Identicon
							size={!userProfileData ? 70 : 90}
							value={userProfileData?.addresses?.[0] || address}
							theme='polkadot'
							className='rounded-full border-[5px] border-border_blue'
						/>
					) : (
						<div className='w-[90px]'>
							<Image
								src={UserIcon}
								alt='profile'
								className='rounded-full border-[5px] border-border_blue'
							/>
						</div>
					)}

					{userProfileData?.rank && (
						<div className={classes.rankBadge}>
							<span className={classes.rankBadgeText}>
								{t('Profile.rank')}: {userProfileData.rank}
							</span>
						</div>
					)}
				</div>

				<div className='flex w-full flex-col gap-y-2'>
					<div className='flex w-full flex-col justify-between gap-x-2 gap-y-3 sm:flex-row sm:items-start'>
						<div className='mt-2 flex w-full flex-col gap-y-2'>
							{userProfileData?.username && !identity?.displayParent && !identity?.display ? (
								<p className={classes.profileHeaderTextTitle}>{userProfileData.username}</p>
							) : (
								address && (
									<>
										<Address
											disableTooltip
											address={address}
											showIdenticon={false}
											textClassName={cn('text-center text-lg font-semibold sm:text-left lg:text-2xl')}
										/>
										{(identity?.display || identity?.displayParent) && <p className='text-base'>{address}</p>}
									</>
								)
							)}

							{userProfileData && (
								<div className='flex flex-wrap items-center gap-x-2 gap-y-2'>
									{userProfileData?.createdAt && (
										<p className={classes.profileHeaderTextSince}>
											<span>{t('Profile.userSince')}: </span>{' '}
											<span className='flex items-center gap-x-1 text-xs'>
												<Image
													src={CalendarIcon}
													alt='calendar'
													width={20}
													height={20}
												/>
												{dayjs(userProfileData.createdAt).format("Do MMM 'YY")}
											</span>
										</p>
									)}
									<Separator
										className='h-4'
										orientation='vertical'
									/>
									<div className={classes.profileHeaderTextFollowing}>
										{t('Profile.following')}:{' '}
										{isFetchingFollowing ? <Skeleton className='h-4 w-6' /> : <span className='font-medium text-text_pink'>{following?.following?.length || 0}</span>}
									</div>
									<Separator
										className='h-4'
										orientation='vertical'
									/>
									<div className={classes.profileHeaderTextFollowing}>
										{t('Profile.followers')}:{' '}
										{isFetchingFollowers ? <Skeleton className='h-4 w-6' /> : <span className='font-medium text-text_pink'>{followers?.followers?.length || 0}</span>}
									</div>
								</div>
							)}
						</div>
						<div className={classes.profileHeaderButtons}>
							<div className='flex items-center gap-x-4'>
								{userProfileData?.profileDetails.publicSocialLinks?.map((social) => (
									<a
										key={social.platform}
										href={social.platform === ESocial.EMAIL ? `mailto:${social.url}` : social.url}
										target='_blank'
										className='flex h-8 w-8 items-center justify-center rounded-full bg-social_green'
										rel='noreferrer'
									>
										<Image
											src={SocialIcons[social.platform]}
											alt='social green'
											width={16}
											height={16}
										/>
									</a>
								))}
							</div>
							{userProfileData && user?.id === userProfileData?.id ? (
								<Dialog
									open={openEditProfileDialog}
									onOpenChange={setOpenEditProfileDialog}
								>
									<DialogTrigger asChild>
										<Button
											className='w-full rounded-3xl px-6 font-medium sm:w-auto'
											size='lg'
											leftIcon={
												<Pencil
													fill={THEME_COLORS.light.btn_primary_text}
													size={16}
												/>
											}
											onClick={() => setOpenEditProfileDialog(true)}
										>
											{t('Profile.edit')}
										</Button>
									</DialogTrigger>
									<DialogContent className='max-w-2xl p-6'>
										<DialogHeader>
											<DialogTitle>{t('Profile.editProfile')}</DialogTitle>
										</DialogHeader>
										<EditProfile
											userProfileData={userProfileData}
											onSuccess={handleUserProfileDataChange}
											onClose={() => setOpenEditProfileDialog(false)}
										/>
									</DialogContent>
								</Dialog>
							) : (
								user?.id && (
									<Button
										size='lg'
										className='w-full rounded-3xl sm:w-auto'
										leftIcon={<ShieldPlus />}
										isLoading={loading}
										onClick={isFollowing ? unfollowUser : followUser}
										disabled={!user?.id}
									>
										{isFollowing ? t('Profile.unfollow') : t('Profile.follow')}
									</Button>
								)
							)}
						</div>
					</div>
					{userProfileData?.profileDetails.bio && <p className='text-center text-text_primary sm:text-left'>{userProfileData.profileDetails.bio}</p>}
				</div>
			</div>
			<TabsList className='flex w-full overflow-x-auto'>
				<TabsTrigger
					className='uppercase'
					value={EProfileTabs.OVERVIEW}
				>
					{t('Profile.overview')}
				</TabsTrigger>
				<TabsTrigger
					className='uppercase'
					value={EProfileTabs.POSTS}
				>
					{t('Profile.Posts.posts')}
				</TabsTrigger>
				<TabsTrigger
					className='uppercase'
					value={EProfileTabs.ACCOUNTS}
				>
					{t('Profile.accounts')}
				</TabsTrigger>
				{userProfileData && user?.id === userProfileData?.id && (
					<TabsTrigger
						className='uppercase'
						value={EProfileTabs.SETTINGS}
					>
						{t('Profile.settings')}
					</TabsTrigger>
				)}
			</TabsList>
		</div>
	);
}

export default ProfileHeader;
