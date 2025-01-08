// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Image from 'next/image';
import LoginToPaIcon from '@assets/icons/login-to-pa-icon.svg';
import { useTranslations } from 'next-intl';

function HeaderLabel() {
	const t = useTranslations();
	return (
		<p className='flex items-center gap-x-2 text-lg font-semibold text-text_primary sm:text-xl'>
			<Image
				src={LoginToPaIcon}
				alt='login to polkassembly'
				height={24}
				width={24}
			/>
			{t('Profile.loginToPolkassembly')}
		</p>
	);
}

export default HeaderLabel;
