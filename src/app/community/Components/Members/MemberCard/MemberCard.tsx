// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { dayjs } from '@shared/_utils/dayjsInit';
import Image from 'next/image';
import { ESocial, EUserBadge, IPublicUser, IUserBadgeDetails, EReactQueryKeys } from '@/_shared/types';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import JudgementIcon from '@assets/icons/judgement-icon.svg';
import RankStar from '@assets/profile/rank-star.svg';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { achievementBadges } from '@/_shared/_constants/achievementBadges';
import CopyToClipboard from '@ui/CopyToClipboard/CopyToClipboard';
import { Separator } from '@ui/Separator';
import { Button } from '@ui/Button';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { RegistrationJudgement } from '@polkadot/types/interfaces';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { isUserBlacklisted } from '@/_shared/_utils/isUserBlacklisted';
import Address from '@ui/Profile/Address/Address';
import { ShieldPlus, CircleDollarSign, UserIcon, ShieldAlert } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { IoMdMail } from '@react-icons/all-files/io/IoMdMail';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { FaTelegramPlane } from '@react-icons/all-files/fa/FaTelegramPlane';
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord';
import RiotIcon from '@assets/icons/riot_icon.svg';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import styles from './MemberCard.module.scss';

const SocialIcons = {
	[ESocial.EMAIL]: IoMdMail,
	[ESocial.TWITTER]: FaTwitter,
	[ESocial.TELEGRAM]: FaTelegramPlane,
	[ESocial.DISCORD]: FaDiscord,
	[ESocial.RIOT]: RiotIcon,
	[ESocial.GITHUB]: FaGithub
};

function MemberCard({ member }: { member: IPublicUser }) {
	const t = useTranslations();
	const { user } = useUser();

	const { identityService } = useIdentityService();
	const [isReadMoreVisible, setIsReadMoreVisible] = useState(false);

	const userBadges = {} as Record<EUserBadge, IUserBadgeDetails>;

	member?.profileDetails.achievementBadges?.forEach((badge) => {
		userBadges[badge.name] = badge;
	});

	const isFollowing = member?.following?.some((item) => item.followerUserId === user?.id);

	const getIdentityOfAddresses = useCallback(async () => {
		if (!identityService || !member?.addresses.length) return undefined;
		const identities = await Promise.all(
			member.addresses.map(async (a) => {
				const identity = await identityService.getOnChainIdentity(a);
				if (identity) {
					return { ...identity, address: a };
				}
				return null;
			})
		);
		return identities.filter((i) => i !== null);
	}, [identityService, member?.addresses]);

	const { data: identities, isFetching } = useQuery({
		queryKey: [EReactQueryKeys.PROFILE_IDENTITIES, member?.addresses.join(',')],
		queryFn: getIdentityOfAddresses,
		enabled: !!member?.addresses.length && !!identityService,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const judgements = identities?.[0]?.judgements.filter(([, judgement]: RegistrationJudgement): boolean => !judgement.isFeePaid) || [];

	return (
		<div className={styles.memberCard}>
			<div className='flex items-center justify-between gap-3'>
				<div className='flex items-center gap-2'>
					{member.addresses.length > 0 ? (
						<>
							<Address
								disableTooltip
								address={member?.addresses[0] || ''}
								iconSize={30}
								showIdenticon
								textClassName='text-left text-lg font-semibold'
							/>
							{isUserBlacklisted(member.id) && <ShieldAlert className='h-5 w-5 text-red-500' />}
						</>
					) : (
						<span className='text-xl font-semibold text-text_primary'>{member?.username || ''}</span>
					)}
				</div>
				<div className='flex items-center gap-x-2'>
					<span className='inline-flex items-center gap-x-1 text-sm font-medium text-text_pink'>
						<CircleDollarSign className='h-5 w-5' /> {t('Community.Members.tip')}
					</span>
					<Button
						size='sm'
						className='w-full rounded-3xl sm:w-auto'
						leftIcon={<ShieldPlus />}
						// isLoading={loading}
						// onClick={isFollowing ? unfollowUser : followUser}
						disabled={!user?.id}
					>
						{isFollowing ? t('Profile.unfollow') : t('Profile.follow')}
					</Button>
				</div>
			</div>
			<div className='flex items-center justify-between gap-x-4'>
				<div className='flex items-center gap-x-2'>
					{member.addresses.length > 0 ? (
						<CopyToClipboard
							label={shortenAddress(member?.addresses[0] || '', 5)}
							text={member?.addresses[0] || ''}
							className='text-base'
						/>
					) : null}
					<div className='flex items-center gap-1 rounded-md bg-topic_tag_bg px-1.5 py-1'>
						<UserIcon className='h-4 w-4 text-basic_text' />
						<span className='text-xs text-basic_text'>{t('Community.Members.independent')}</span>
					</div>
					<span className='flex items-center gap-1 rounded-md bg-rank_card_bg px-1.5 py-0.5 font-medium'>
						<Image
							src={RankStar}
							alt='Rank Star'
							width={16}
							height={16}
						/>
						<span className='text-sm font-medium text-leaderboard_score'>{Math.floor(member?.profileScore)}</span>
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
							{t('Profile.judgement')}: <span className='font-medium'>{judgements?.[0]?.[1]?.toString() || t('Profile.noJudgements')}</span>
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
					{t('Profile.following')}: <span className='font-medium text-text_pink'>{member?.following?.length || 0}</span>
				</div>
				<Separator
					className='h-4'
					orientation='vertical'
				/>
				<div className={styles.memberFollowing}>
					{t('Profile.followers')}: <span className='font-medium text-text_pink'>{member?.followers?.length || 0}</span>
				</div>
			</div>
			<div>
				{member?.profileDetails?.bio && (
					<>
						<div className={`${styles.bio} ${isReadMoreVisible ? '' : styles.bioCollapsed} mt-3`}>{member?.profileDetails?.bio}</div>
						{member?.profileDetails?.bio.length > 100 && (
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
				{member?.profileDetails.publicSocialLinks?.map((social) => (
					<a
						key={social.platform}
						href={social.platform === ESocial.EMAIL ? `mailto:${social.url}` : social.url}
						target='_blank'
						className='flex h-8 w-8 items-center justify-center rounded-full bg-social_green'
						rel='noreferrer noopener'
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
			<div className='flex flex-wrap items-center gap-x-3'>
				{Object.keys(userBadges || []).map((badge) => {
					const badgeDetails = userBadges[`${badge}` as EUserBadge];
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
