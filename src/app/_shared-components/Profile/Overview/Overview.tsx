// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EUserBadge, IPublicUser, IUserBadgeDetails } from '@/_shared/types';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { DialogTrigger } from '@radix-ui/react-dialog';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import MedalIcon from '@assets/icons/medal-icon.svg';
import { achievementBadges } from '@/_shared/_constants/achievementBadges';
import { Button } from '../../Button';
import Address from '../Address/Address';
import LinkAddress from './LinkAddress/LinkAddress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';
import classes from './Overview.module.scss';
import Delegations from '../Delegations/Delegations';

function Overview({ address, profileData }: { address?: string; profileData?: IPublicUser }) {
	const [userProfile, setUserProfile] = useState<IPublicUser | undefined>(profileData);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const t = useTranslations();
	const { user } = useUser();

	const userBadges = {} as Record<EUserBadge, IUserBadgeDetails>;

	userProfile?.profileDetails.achievementBadges?.forEach((badge) => {
		userBadges[badge.name] = badge;
	});

	return (
		<div className={classes.overview}>
			<div className={classes.overviewGrid}>
				{address || profileData?.addresses?.length ? <Delegations addresses={address ? [address] : profileData?.addresses || []} /> : null}
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
							<span className='text-sm'>
								({userProfile?.profileDetails.achievementBadges?.length || 0} / {Object.keys(achievementBadges).length})
							</span>
						</p>
						<p className='text-sm'>{t('Profile.badgesDescription')}</p>
					</div>
					<div className={classes.badgesCardContent}>
						{Object.keys(achievementBadges || []).map((badge) => {
							const badgeDetails = achievementBadges[`${badge}` as EUserBadge];
							return (
								<div
									key={badgeDetails.name}
									className={classes.badgesCardContentItem}
								>
									<div className={[EUserBadge.COUNCIL, EUserBadge.WHALE].includes(badgeDetails.name) ? 'w-24' : 'w-32'}>
										<Image
											src={badgeDetails.image}
											alt={badgeDetails.name}
											className={cn(!userBadges[badgeDetails.name] && 'grayscale')}
										/>
									</div>
									<p className={classes.badgesCardContentItemTitle}>{badgeDetails.displayName}</p>
								</div>
							);
						})}
					</div>
				</div>
			</div>
			<div className={classes.rightGrid}>
				<div className={classes.onchainIdentityCard}>
					<div className={classes.onchainIdentityCardHeader}>
						<p className={classes.onchainIdentityCardHeaderTitle}>{t('Profile.onchainIdentity')}</p>
						{user && userProfile && userProfile?.id === user.id && (
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
										onSuccess={(a) => {
											setIsModalOpen(false);
											setUserProfile({
												...userProfile,
												addresses: [...userProfile.addresses, a]
											});
										}}
									/>
								</DialogContent>
							</Dialog>
						)}
					</div>
					<div className={classes.onchainIdentityCardContent}>
						{userProfile?.addresses.map((a) => (
							<Address
								key={a}
								address={a}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Overview;
