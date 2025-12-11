// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { dayjs } from '@shared/_utils/dayjsInit';
import Image from 'next/image';
import { ESocial, IDelegateDetails } from '@/_shared/types';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import JudgementIcon from '@assets/icons/judgement-icon.svg';
import RankStar from '@assets/profile/rank-star.svg';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import CopyToClipboard from '@ui/CopyToClipboard/CopyToClipboard';
import { Separator } from '@ui/Separator';
import { Button } from '@ui/Button';
import { useIdentityService } from '@/hooks/useIdentityService';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import Address from '@ui/Profile/Address/Address';
import { ShieldPlus, UserIcon } from 'lucide-react';
import { IoPersonAdd } from '@react-icons/all-files/io5/IoPersonAdd';
import { useUser } from '@/hooks/useUser';
import { IoMdMail } from '@react-icons/all-files/io/IoMdMail';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { FaTelegramPlane } from '@react-icons/all-files/fa/FaTelegramPlane';
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import styles from './PeopleCard.module.scss';

const SocialIcons: Partial<Record<ESocial, React.ComponentType<React.SVGProps<SVGSVGElement>>>> = {
	[ESocial.EMAIL]: IoMdMail,
	[ESocial.TWITTER]: FaTwitter,
	[ESocial.TELEGRAM]: FaTelegramPlane,
	[ESocial.DISCORD]: FaDiscord,
	[ESocial.GITHUB]: FaGithub
};

function DelegateCard({ delegate }: { delegate: IDelegateDetails }) {
	const t = useTranslations();
	const { user } = useUser();
	const network = getCurrentNetwork();

	const { identityService } = useIdentityService();
	const [isReadMoreVisible, setIsReadMoreVisible] = useState(false);

	const isFetching = false;

	const isFollowing = delegate?.publicUser?.following?.some((item) => item.followerUserId === user?.id);

	return (
		<div className={styles.memberCard}>
			<div className='flex items-center justify-between gap-3'>
				<div className='flex items-center gap-2'>
					{(delegate?.publicUser?.addresses?.length ?? 0) > 0 ? (
						<Address
							disableTooltip
							address={delegate?.publicUser?.addresses[0] || ''}
							iconSize={30}
							showIdenticon
							textClassName='text-left text-lg font-semibold'
						/>
					) : (
						<span className='text-xl font-semibold text-text_primary'>{delegate?.publicUser?.username || ''}</span>
					)}
				</div>
				<div className='flex items-center gap-x-2'>
					<Button
						size='sm'
						variant='link'
						className='w-full rounded-3xl text-text_pink sm:w-auto'
						leftIcon={<ShieldPlus />}
						disabled={!user?.id}
					>
						{isFollowing ? t('Profile.unfollow') : t('Profile.follow')}
					</Button>
					<Button
						size='sm'
						className='w-full rounded-3xl sm:w-auto'
						leftIcon={<IoPersonAdd />}
						disabled={!user?.id}
					>
						{t('Delegation.delegate')}
					</Button>
				</div>
			</div>
			<div className='flex items-center justify-between gap-x-4'>
				<div className='flex items-center gap-x-2'>
					{(delegate?.publicUser?.addresses?.length ?? 0) > 0 ? (
						<CopyToClipboard
							label={shortenAddress(delegate?.publicUser?.addresses[0] || '', 5)}
							text={delegate?.publicUser?.addresses[0] || ''}
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
						<span className='text-sm font-medium text-leaderboard_score'>{Math.floor(delegate?.publicUser?.profileScore || 0)}</span>
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
							{t('Profile.judgement')}: <span className='font-medium'>{delegate?.judgements?.[0] || t('Profile.noJudgements')}</span>
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
						{dayjs(delegate?.createdAt).format("Do MMM 'YY")}
					</span>
				</p>

				<Separator
					className='h-4'
					orientation='vertical'
				/>
				<div className={styles.memberFollowing}>
					{t('Profile.following')}: <span className='font-medium text-text_pink'>{delegate?.publicUser?.following?.length || 0}</span>
				</div>
				<Separator
					className='h-4'
					orientation='vertical'
				/>
				<div className={styles.memberFollowing}>
					{t('Profile.followers')}: <span className='font-medium text-text_pink'>{delegate?.publicUser?.followers?.length || 0}</span>
				</div>
			</div>
			<div>
				{delegate?.publicUser?.profileDetails?.bio && (
					<>
						<div className={`${styles.bio} ${isReadMoreVisible ? '' : styles.bioCollapsed} mt-3`}>{delegate?.publicUser?.profileDetails?.bio}</div>
						{(delegate?.publicUser?.profileDetails?.bio?.length ?? 0) > 100 && (
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
				{delegate?.publicUser?.profileDetails.publicSocialLinks?.map((social) => {
					const IconComponent = SocialIcons[social.platform];
					return IconComponent ? (
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
			<div className={styles.delegationCardStats}>
				<div className={styles.delegationCardStatsItem}>
					<div>
						<div className='text-sm text-btn_secondary_text xl:whitespace-nowrap'>
							<span className='font-semibold md:text-2xl'>
								{formatUSDWithUnits(formatBnBalance(delegate?.maxDelegated, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}
							</span>
						</div>
						<span className={styles.delegationCardStatsItemText}>{t('Delegation.maxDelegated')}</span>
					</div>
				</div>
				<div className={styles.delegationCardStatsItem}>
					<div>
						<div className='font-semibold text-btn_secondary_text md:text-2xl'>{delegate?.last30DaysVotedProposalsCount}</div>
						<span className={styles.delegationCardStatsItemText}>{t('Delegation.votedProposals')}</span>
						<span className={styles.delegationCardStatsItemTextPast30Days}>({t('Delegation.past30Days')})</span>
					</div>
				</div>
				<div className='p-5 text-center'>
					<div>
						<div className='font-semibold text-btn_secondary_text md:text-2xl'>{delegate?.delegators?.length || 0}</div>
						<span className={styles.delegationCardStatsItemText}>{t('Delegation.delegators')}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
export default DelegateCard;
