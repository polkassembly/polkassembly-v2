// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EUserBadge, IPublicUser, IUserBadgeDetails } from '@/_shared/types';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { DialogTrigger } from '@radix-ui/react-dialog';
import DecentralisedVoice from '@assets/icons/decentralized-voice-badge.svg';
import Fellow from '@assets/icons/fellow-badge.svg';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import MedalIcon from '@assets/icons/medal-icon.svg';
import { Button } from '../../Button';
import Address from '../Address/Address';
import LinkAddress from './LinkAddress/LinkAddress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';
import classes from './Overview.module.scss';

const badgeImages = {
	[EUserBadge.DECENTRALISED_VOICE]: DecentralisedVoice,
	[EUserBadge.FELLOW]: Fellow,
	[EUserBadge.COUNCIL]: DecentralisedVoice,
	[EUserBadge.ACTIVE_VOTER]: Fellow
};

const achievementBadges = Object.values(EUserBadge).map((badge) => ({
	name: badge,
	label: badge.replace('_', ' '),
	image: badgeImages[`${badge}`]
}));

function Overview({ profileData }: { profileData: IPublicUser }) {
	const [userProfile, setUserProfile] = useState<IPublicUser>(profileData);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const t = useTranslations();
	const { user } = useUser();

	const userBadges = {} as Record<EUserBadge, IUserBadgeDetails>;

	userProfile.profileDetails.achievementBadges.forEach((badge) => {
		userBadges[badge.name] = badge;
	});

	return (
		<div className={classes.overview}>
			<div className={classes.overviewGrid}>
				{/* <div className={classes.overviewCard}>
					<div className={classes.overviewCardHeader}>
						<p className={classes.overviewCardHeaderTitle}>{t('Profile.overview')}</p>
					</div>
				</div> */}
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
							<span className='text-sm'>({achievementBadges.length})</span>
						</p>
						<p className='text-sm'>{t('Profile.badgesDescription')}</p>
					</div>
					<div className={classes.badgesCardContent}>
						{achievementBadges.map((badge) => (
							<div
								key={badge.name}
								className={classes.badgesCardContentItem}
							>
								<Image
									src={badge.image}
									alt={badge.name}
									className={cn(!userBadges[badge.name] && 'grayscale-[85%]')}
								/>
								<p className={classes.badgesCardContentItemTitle}>{badge.label}</p>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className={classes.rightGrid}>
				<div className={classes.onchainIdentityCard}>
					<div className={classes.onchainIdentityCardHeader}>
						<p className={classes.onchainIdentityCardHeaderTitle}>{t('Profile.onchainIdentity')}</p>
						{user && profileData.id === user.id && (
							<Dialog
								open={isModalOpen}
								onOpenChange={setIsModalOpen}
							>
								<DialogTrigger>
									<Button
										variant='secondary'
										leftIcon={<Plus />}
										size='sm'
									>
										{t('Profile.linkAddress')}
									</Button>
								</DialogTrigger>
								<DialogContent className={classes.modal}>
									<DialogHeader>
										<DialogTitle>{t('Profile.linkAddress')}</DialogTitle>
									</DialogHeader>
									<LinkAddress
										onSuccess={(address) => {
											setIsModalOpen(false);
											setUserProfile({
												...userProfile,
												addresses: [...userProfile.addresses, address]
											});
										}}
									/>
								</DialogContent>
							</Dialog>
						)}
					</div>
					<div className={classes.onchainIdentityCardContent}>
						{userProfile.addresses.map((address) => (
							<Address
								key={address}
								address={address}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Overview;
