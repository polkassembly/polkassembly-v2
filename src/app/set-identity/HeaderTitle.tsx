// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ShieldUser from '@assets/icons/shield-user.svg';

function HeaderTitle() {
	const t = useTranslations();

	return (
		<div className='flex items-center gap-x-2'>
			<Image
				src={ShieldUser}
				alt='logo'
				width={24}
				height={24}
			/>
			<h1 className='text-xl font-semibold text-text_primary'>{t('SetIdentity.onChainIdentity')}</h1>
		</div>
	);
}

export default HeaderTitle;
