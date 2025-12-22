// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { dayjs } from '@shared/_utils/dayjsInit';
import Image from 'next/image';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import JudgementIcon from '@assets/icons/judgement-icon.svg';
import RankStar from '@assets/profile/rank-star.svg';
import CopyToClipboard from '@ui/CopyToClipboard/CopyToClipboard';
import { Separator } from '@ui/Separator';
import { Button } from '@ui/Button';
import Address from '@ui/Profile/Address/Address';
import { ShieldPlus, UserIcon, ShieldAlert } from 'lucide-react';
import { IoMdMail } from '@react-icons/all-files/io/IoMdMail';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { FaTelegramPlane } from '@react-icons/all-files/fa/FaTelegramPlane';
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { useUser } from '@/hooks/useUser';
import { isUserBlacklisted } from '@/_shared/_utils/isUserBlacklisted';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { useIdentityService } from '@/hooks/useIdentityService';
import { achievementBadges } from '@/_shared/_constants/achievementBadges';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { ESocial, IFollowEntry, IOnChainIdentity, EUserBadge, IUserBadgeDetails, IMembersDetails } from '@/_shared/types';
import styles from '../../PeopleCard.module.scss';

const SocialIcons: Partial<Record<ESocial, React.ComponentType<React.SVGProps<SVGSVGElement>>>> = {
	[ESocial.EMAIL]: IoMdMail,
	[ESocial.TWITTER]: FaTwitter,
	[ESocial.TELEGRAM]: FaTelegramPlane,
	[ESocial.DISCORD]: FaDiscord,
	[ESocial.GITHUB]: FaGithub
};

function MemberCard({ member }: { member: IMembersDetails }) {
	const t = useTranslations();
	const { user } = useUser();

	const { getOnChainIdentity, identityService } = useIdentityService();
	const [isReadMoreVisible, setIsReadMoreVisible] = useState(false);
	const [identity, setIdentity] = useState<IOnChainIdentity | null>(null);
	const [isFetching, setIsFetching] = useState(true);
	const [loading, setLoading] = useState(false);

	const queryClient = useQueryClient();

	console.log('member', member);

	const userBadges =
		member?.achievementBadges?.reduce(
			(acc, badge) => {
				acc[badge.name] = badge;
				return acc;
			},
			{} as Partial<Record<EUserBadge, IUserBadgeDetails>>
		) || {};

	// followers
	const fetchFollowers = async () => {
		if (!member) return null;

		const { data, error } = await UserProfileClientService.getFollowers({ userId: member.userId });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}

		return data;
	};

	const { data: followers, isFetching: isFetchingFollowers } = useQuery({
		queryKey: ['followers', member?.userId, user?.id],
		queryFn: () => fetchFollowers(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!member
	});

	// following
	const fetchFollowing = async () => {
		if (!member) return null;

		const { data, error } = await UserProfileClientService.getFollowing({ userId: member.userId });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};

	const { data: following, isFetching: isFetchingFollowing } = useQuery({
		queryKey: ['following', member?.userId, user?.id],
		queryFn: () => fetchFollowing(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		enabled: !!member
	});

	const followUser = async () => {
		if (!member) return;

		if (!user?.id || user.id === member.userId) return;
		setLoading(true);

		const { data, error } = await UserProfileClientService.followUser({ userId: member.userId });

		setLoading(false);

		if (data && !error) {
			queryClient.setQueryData(['followers', member.userId, user?.id], (oldData: { followers: IFollowEntry[] }) => {
				return {
					followers: [
						...(oldData?.followers || []),
						{
							id: member.userId,
							createdAt: member.createdAt,
							followerUserId: user.id,
							followedUserId: member.userId,
							updatedAt: new Date()
						}
					]
				};
			});
		}
	};

	const unfollowUser = async () => {
		if (!member) return;

		if (!user?.id || user.id === member.userId) return;
		setLoading(true);

		const { data, error } = await UserProfileClientService.unfollowUser({ userId: member.userId });

		setLoading(false);

		if (data && !error) {
			queryClient.setQueryData(['followers', member.userId, user?.id], (oldData: { followers: IFollowEntry[] }) => {
				return { ...oldData, followers: oldData.followers.filter((item) => item.followerUserId !== user.id) };
			});
		}
	};

	const isFollowing = followers?.followers.some((item) => item.followerUserId === user?.id);

	useEffect(() => {
		const fetchIdentity = async () => {
			if (!member?.address) {
				setIsFetching(false);
				return;
			}

			try {
				setIsFetching(true);
				const identityInfo = await getOnChainIdentity(member.address);
				if (identityInfo) {
					setIdentity(identityInfo);
				}
			} catch (error) {
				console.error('Error fetching identity:', error);
			} finally {
				setIsFetching(false);
			}
		};

		fetchIdentity();
	}, [member?.address, getOnChainIdentity]);

	const socialLinks = member?.socialLinks?.length
		? member?.socialLinks
		: [
				{ platform: ESocial.EMAIL, url: identity?.email || '' },
				{ platform: ESocial.TWITTER, url: identity?.twitter || '' },
				{ platform: ESocial.DISCORD, url: identity?.discord || '' },
				{ platform: ESocial.GITHUB, url: identity?.github || '' }
			];

	return (
		<div className={styles.memberCard}>
			<div className='flex items-center justify-between gap-3'>
				<div className='flex items-center gap-2'>
					{member.address && member.address !== '' ? (
						<>
							<Address
								disableTooltip
								address={member?.address || ''}
								iconSize={30}
								showIdenticon
								textClassName='text-left text-lg font-semibold'
							/>
							{isUserBlacklisted(member?.userId) && <ShieldAlert className='h-5 w-5 text-red-500' />}
						</>
					) : (
						<span className='text-xl font-semibold text-text_primary'>{identity?.display || identity?.nickname || ''}</span>
					)}
				</div>
				<div className='flex items-center gap-x-2'>
					<Button
						size='sm'
						className='w-full rounded-3xl sm:w-auto'
						leftIcon={<ShieldPlus />}
						isLoading={loading}
						onClick={isFollowing ? unfollowUser : followUser}
						disabled={!user?.id || loading || user?.id === member?.userId}
					>
						{isFollowing ? t('Profile.unfollow') : t('Profile.follow')}
					</Button>
				</div>
			</div>
			<div className='flex items-center justify-between gap-x-4'>
				<div className='flex items-center gap-x-2'>
					{member.address && member.address !== '' ? (
						<CopyToClipboard
							label={shortenAddress(member?.address || '', 5)}
							text={member?.address || ''}
							className='text-base'
						/>
					) : null}
					<div className='flex items-center gap-1 rounded-md bg-topic_tag_bg px-1.5 py-1'>
						<UserIcon className='h-4 w-4 text-basic_text' />
						<span className='text-xs text-basic_text'>{member?.source?.[0] || 'Individual'}</span>
					</div>
					<span className='flex items-center gap-1 rounded-md bg-rank_card_bg px-1.5 py-0.5 font-medium'>
						<Image
							src={RankStar}
							alt='Rank Star'
							width={16}
							height={16}
						/>
						<span className='text-sm font-medium text-leaderboard_score'>{Math.floor(member?.profileScore || 0)}</span>
					</span>
				</div>
				<div className='flex items-center gap-x-1'>
					<Image
						src={JudgementIcon}
						alt='judgement'
						width={14}
						height={14}
					/>
					{isFetching || !identityService ? (
						<Skeleton className='ml-2 h-4 w-16' />
					) : (
						<span className='text-xs text-basic_text'>
							{t('Profile.judgement')}: <span className='font-medium'>{identity?.judgements?.[0]?.[1]?.toString() || t('Profile.noJudgements')}</span>
						</span>
					)}
				</div>
			</div>
			<div className='flex flex-wrap items-center gap-x-2 gap-y-2'>
				<p className={styles.memberSince}>
					<span>{t('Profile.userSince')}: </span>{' '}
					<span className='flex items-center gap-x-1 text-xs'>
						<Image
							src={CalendarIcon}
							alt='calendar'
							width={20}
							height={20}
						/>
						{dayjs(member?.createdAt).format("Do MMM 'YY")}
					</span>
				</p>

				<Separator
					className='h-4'
					orientation='vertical'
				/>
				<div className={styles.memberFollowing}>
					{t('Profile.following')}:
					{isFetchingFollowing ? <Skeleton className='h-4 w-6' /> : <span className='font-medium text-text_pink'>{following?.following?.length || 0}</span>}
				</div>
				<Separator
					className='h-4'
					orientation='vertical'
				/>
				<div className={styles.memberFollowing}>
					{t('Profile.followers')}: {isFetchingFollowers ? <Skeleton className='h-4 w-6' /> : <span className='font-medium text-text_pink'>{followers?.followers?.length}</span>}
				</div>
			</div>
			<div>
				{member?.bio && (
					<>
						<div className={`${styles.bio} ${isReadMoreVisible ? '' : styles.bioCollapsed} mt-3`}>{member?.bio}</div>
						{member?.bio.length > 100 && (
							<Button
								variant='ghost'
								className={styles.readMoreButton}
								onClick={() => setIsReadMoreVisible(!isReadMoreVisible)}
								aria-expanded={isReadMoreVisible ? 'true' : 'false'}
							>
								{isReadMoreVisible ? t('Community.Members.readLess') : t('Community.Members.readMore')}
							</Button>
						)}
					</>
				)}
			</div>
			<div className='flex items-center gap-x-4'>
				{socialLinks.map((social) => {
					const IconComponent = SocialIcons[social.platform];
					return IconComponent && social.url !== '' ? (
						<a
							key={social.platform}
							href={social.platform === ESocial.EMAIL ? `mailto:${social.url}` : social.url}
							target='_blank'
							className='flex h-8 w-8 items-center justify-center rounded-full bg-social_green'
							rel='noreferrer noopener'
						>
							<IconComponent className='text-white' />
						</a>
					) : null;
				})}
			</div>
			<div className='flex flex-wrap items-center gap-x-3'>
				{Object.keys(userBadges || []).map((badge) => {
					const badgeDetails = userBadges[`${badge}` as EUserBadge];
					if (!badgeDetails) return null;
					return (
						<div
							key={badgeDetails.name}
							className={[EUserBadge.COUNCIL, EUserBadge.WHALE].includes(badgeDetails.name) ? 'w-12' : 'w-16'}
						>
							<Image
								src={achievementBadges[badgeDetails.name].image}
								alt={badgeDetails.name}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
export default MemberCard;
