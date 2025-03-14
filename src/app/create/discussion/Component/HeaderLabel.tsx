// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import DiscussionIcon from '@assets/sidebar/discussion-icon.svg';
import { useTranslations } from 'next-intl';

function HeaderLabel() {
	const t = useTranslations();
	return (
		<p className='flex items-center gap-x-2 text-lg font-semibold text-text_primary sm:text-xl'>
			<Image
				src={DiscussionIcon}
				alt='Create discussion'
				height={26}
				width={26}
			/>
			{t('Create.createDiscussionTitle')}
		</p>
	);
}

export default HeaderLabel;
