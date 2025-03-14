// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { memo } from 'react';

function UserStats({ followers, following }: { followers?: number; following?: number }) {
	const t = useTranslations();

	return (
		<div className='flex gap-1.5'>
			<p className='whitespace-nowrap text-text_primary'>
				{t('Profile.followers')}: <span className='text-text_pink'>{followers}</span>
			</p>

			<p className='whitespace-nowrap border-l border-border_grey pl-2 text-text_primary'>
				{t('Profile.following')}: <span className='text-text_pink'>{following}</span>
			</p>
		</div>
	);
}

export default memo(UserStats);
