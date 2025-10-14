// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EUserBadge, IPublicUser, IUserBadgeDetails } from '@/_shared/types';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import MedalIcon from '@assets/icons/medal-icon.svg';
import { LockKeyhole } from 'lucide-react';
import { IoHourglassOutline } from '@react-icons/all-files/io5/IoHourglassOutline';
import { dayjs } from '@shared/_utils/dayjsInit';
import { achievementBadges } from '@/_shared/_constants/achievementBadges';
import classes from './Overview.module.scss';
import ProfileOverview from './ProfileOverview';
import Delegations from '../Delegations/Delegations';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import VotedActiveProposalCard from '../../VotedActiveProposalCard/VotedActiveProposalCard';
import OnchainIdentityCard from './OnchainIdentityCard/OnchainIdentityCard';

function Overview({ address, profileData }: { address?: string; profileData?: IPublicUser }) {
	const [userProfile, setUserProfile] = useState<IPublicUser | undefined>(profileData);
	const t = useTranslations();

	const userBadges = {} as Record<EUserBadge, IUserBadgeDetails>;

	userProfile?.profileDetails.achievementBadges?.forEach((badge) => {
		userBadges[badge.name] = badge;
	});

	const profileAddresses = profileData?.addresses?.length ? profileData?.addresses : address ? [address] : [];

	return (
		<div className={classes.overview}>
			<div className={classes.overviewGrid}>
				<ProfileOverview
					profileData={profileData}
					address={address}
				/>
				{address || profileData?.addresses?.length ? <Delegations addresses={address ? [address] : profileData?.addresses || []} /> : null}
				<div className={classes.badgesCard}>
					<div className={classes.badgesCardHeader}>
						<p className={classes.badgesCardHeaderTitle}>
							<Image
								src={MedalIcon}
								alt='Badge'
								width={24}
								height={24}
							/>
							<span className='text-xl font-semibold'>{t('Profile.badges')}</span>
							<span className='text-sm'>
								({userProfile?.profileDetails.achievementBadges?.length || 0} / {Object.keys(achievementBadges).length})
							</span>
						</p>
					</div>
					<p className='mb-4 text-sm'>{t('Profile.badgesDescription')}</p>
					<div className={classes.badgesCardContent}>
						{Object.keys(achievementBadges || []).map((badge) => {
							const badgeDetails = achievementBadges[`${badge}` as EUserBadge];
							const badgeUnlockedAt = userBadges[badgeDetails.name]?.unlockedAt;

							return (
								<Tooltip key={badgeDetails.name}>
									<TooltipTrigger asChild>
										<div className={classes.badgesCardContentItem}>
											<div className={[EUserBadge.COUNCIL, EUserBadge.WHALE].includes(badgeDetails.name) ? 'w-24' : 'w-32'}>
												<Image
													src={badgeDetails.image}
													alt={badgeDetails.name}
													className={cn(!userBadges[badgeDetails.name] && 'grayscale')}
												/>
											</div>
											<p className={classes.badgesCardContentItemTitle}>{badgeDetails.displayName}</p>
										</div>
									</TooltipTrigger>
									<TooltipContent
										side='top'
										align='center'
										className='bg-tooltip_background text-white'
									>
										{badgeUnlockedAt ? (
											<div className='flex items-center gap-x-1'>
												<IoHourglassOutline className='h-4 w-4' />
												<span>{`${t('Profile.unlocked')} ${t('Profile.on')} ${dayjs(badgeUnlockedAt).format('MMM DD, YYYY')}`}</span>
											</div>
										) : (
											<div className='flex items-center gap-x-2'>
												<LockKeyhole className='text-green_primary h-4 w-4' />
												<span>{t('Profile.locked')}</span>
											</div>
										)}
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</div>
			</div>
			<div className={classes.rightGrid}>
				<OnchainIdentityCard
					userProfile={userProfile}
					setUserProfile={setUserProfile}
					addresses={profileAddresses}
				/>
				{profileAddresses.length > 0 && <VotedActiveProposalCard addresses={profileAddresses} />}
			</div>
		</div>
	);
}

export default Overview;
