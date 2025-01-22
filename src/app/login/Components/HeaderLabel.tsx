// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@ui/Icon';

function HeaderLabel() {
	const t = useTranslations();
	return (
		<p className='flex items-center gap-x-2 text-lg font-semibold text-text_primary sm:text-xl'>
			<Icon
				name='icons/login-to-pa-icon'
				className='h-6 w-6'
			/>
			{t('Profile.loginToPolkassembly')}
		</p>
	);
}

export default HeaderLabel;
