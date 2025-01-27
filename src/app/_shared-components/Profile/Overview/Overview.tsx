// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IPublicUser } from '@/_shared/types';
import React from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Button } from '../../Button';
import Address from '../Address/Address';
import LinkAddress from './LinkAddress/LinkAddress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../Dialog/Dialog';

function Overview({ profileData }: { profileData: IPublicUser }) {
	const t = useTranslations();
	const { user } = useUser();
	return (
		<div className='grid grid-cols-3 gap-4'>
			<div className='col-span-2 rounded-[20px] border-[0.6px] border-border_grey bg-bg_modal p-4 shadow-lg'>
				<div className='flex items-center justify-between'>
					<p className='text-2xl font-semibold'>{t('Profile.overview')}</p>
				</div>
			</div>
			<div className='col-span-1 rounded-xl bg-bg_modal px-5 py-6'>
				<div className='mb-4 flex items-center justify-between'>
					<p className='text-base font-semibold text-text_primary'>Onchain Identity</p>
					{user && profileData.id === user.id && (
						<Dialog>
							<DialogTrigger>
								<Button
									variant='secondary'
									leftIcon={<Plus />}
									size='sm'
								>
									Link Address
								</Button>
							</DialogTrigger>
							<DialogContent className='max-w-xl p-6'>
								<DialogHeader>
									<DialogTitle>Link Address</DialogTitle>
								</DialogHeader>
								<LinkAddress />
							</DialogContent>
						</Dialog>
					)}
				</div>
				<div className='flex flex-col gap-y-2'>
					{profileData.addresses.map((address) => (
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
