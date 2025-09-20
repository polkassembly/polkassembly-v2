// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { dayjs } from '@shared/_utils/dayjsInit';
import Image from 'next/image';
import { ESocial, EUserBadge } from '@/_shared/types';
import EmailIcon from '@assets/icons/email-icon.svg';
import TwitterIcon from '@assets/icons/twitter-icon.svg';
import TelegramIcon from '@assets/icons/telegram-icon.svg';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import JudgementIcon from '@assets/icons/judgement-icon.svg';
import RankStar from '@assets/profile/rank-star.svg';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { achievementBadges } from '@/_shared/_constants/achievementBadges';
import CopyToClipboard from '@ui/CopyToClipboard/CopyToClipboard';
import { Separator } from '@ui/Separator';
import { Button } from '@ui/Button';
import Address from '@ui/Profile/Address/Address';
import { ShieldPlus, CircleDollarSign, UserIcon, ShieldAlert } from 'lucide-react';
import styles from './MemberCard.module.scss';

const displayAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNonXo';
const SocialIcons = {
	[ESocial.EMAIL]: EmailIcon,
	[ESocial.TWITTER]: TwitterIcon,
	[ESocial.TELEGRAM]: TelegramIcon,
	[ESocial.DISCORD]: TelegramIcon,
	[ESocial.RIOT]: TelegramIcon,
	[ESocial.GITHUB]: TelegramIcon
};

const profileLinks = [
	{
		platform: ESocial.EMAIL,
		url: 'mailto:larry.page@example.com'
	},
	{
		platform: ESocial.TWITTER,
		url: 'https://twitter.com/larrypage'
	},
	{
		platform: ESocial.TELEGRAM,
		url: 'https://t.me/larrypage'
	}
];

function MemberCard() {
	const t = useTranslations();
	const isFollowing = false;
	const isUserBlacklisted = false;

	return (
		<div className={styles.memberCard}>
			<div className='flex items-center justify-between gap-3'>
				<div className='flex items-center gap-2'>
					<Address
						disableTooltip
						redirectToProfile={false}
						address={displayAddress}
						iconSize={26}
						showIdenticon={false}
						textClassName='text-center text-lg font-semibold sm:text-left lg:text-2xl'
					/>
					{isUserBlacklisted && <ShieldAlert className='h-5 w-5 text-red-500' />}
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
						// disabled={!user?.id}
					>
						{isFollowing ? t('Profile.unfollow') : t('Profile.follow')}
					</Button>
				</div>
			</div>
			<div className='flex items-center justify-between gap-x-4'>
				<div className='flex items-center gap-x-2'>
					<div>
						<CopyToClipboard
							label={shortenAddress(displayAddress, 5)}
							text={displayAddress}
							className='text-base'
						/>
					</div>
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
						<span className='text-sm font-medium text-leaderboard_score'>{650}</span>
					</span>
				</div>
				<div className='flex items-center gap-x-1'>
					<Image
						src={JudgementIcon}
						alt='judgement'
						width={14}
						height={14}
					/>
					<span className='text-xs text-basic_text'>
						{t('Community.Members.judgement')}: <span className='font-medium'>Reasonable</span>
					</span>
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
						{dayjs('2022-01-02').format("Do MMM 'YY")}
					</span>
				</p>

				<Separator
					className='h-4'
					orientation='vertical'
				/>
				<div className={styles.memberFollowing}>
					{t('Profile.following')}: <span className='font-medium text-text_pink'>{0}</span>
				</div>
				<Separator
					className='h-4'
					orientation='vertical'
				/>
				<div className={styles.memberFollowing}>
					{t('Profile.followers')}: <span className='font-medium text-text_pink'>{0}</span>
				</div>
			</div>
			<div>
				<p className='mt-3 text-sm text-basic_text'>
					A bit about me: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
				</p>
				<span className='text-sm text-link'>{t('Community.Members.readMore')}</span>
			</div>
			<div className='flex items-center gap-x-4'>
				{profileLinks?.map((social) => (
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
			<div className='flex flex-wrap items-center gap-x-3'>
				{Object.keys(achievementBadges || []).map((badge) => {
					const badgeDetails = achievementBadges[`${badge}` as EUserBadge];
					return (
						<div
							key={badgeDetails.name}
							className={[EUserBadge.COUNCIL, EUserBadge.WHALE].includes(badgeDetails.name) ? 'w-12' : 'w-16'}
						>
							<Image
								src={badgeDetails.image}
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
