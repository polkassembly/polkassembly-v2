// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog/Dialog';
import { useRouter } from 'next/navigation';
import SetIdentity from '@/app/_shared-components/SetIdentity/SetIdentity';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ShieldUser from '@assets/icons/shield-user.svg';

function SetIdentityModal() {
	const t = useTranslations();
	const router = useRouter();

	const handleOpenChange = () => {
		router.back();
	};

	return (
		<Dialog
			defaultOpen
			open
			onOpenChange={handleOpenChange}
		>
			<DialogContent className='max-w-xl p-6'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-x-2 text-xl font-semibold text-text_primary'>
						<Image
							src={ShieldUser}
							alt='logo'
							width={24}
							height={24}
						/>
						{t('SetIdentity.onChainIdentity')}
					</DialogTitle>
				</DialogHeader>
				<div className='flex max-h-[80vh] w-full flex-col overflow-hidden'>
					<SetIdentity />
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default SetIdentityModal;
