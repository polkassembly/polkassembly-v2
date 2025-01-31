// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IPublicUser } from '@/_shared/types';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Button } from '../../Button';
import Address from '../Address/Address';
import LinkAddress from './LinkAddress/LinkAddress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';
import classes from './Overview.module.scss';

function Overview({ profileData }: { profileData: IPublicUser }) {
	const [userProfile, setUserProfile] = useState<IPublicUser>(profileData);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const t = useTranslations();
	const { user } = useUser();
	return (
		<div className={classes.overview}>
			<div className={classes.overviewCard}>
				<div className={classes.overviewCardHeader}>
					<p className={classes.overviewCardHeaderTitle}>{t('Profile.overview')}</p>
				</div>
			</div>
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
	);
}

export default Overview;
