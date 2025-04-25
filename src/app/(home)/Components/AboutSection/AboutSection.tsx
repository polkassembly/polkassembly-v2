// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import AboutSocialLinks from '../AboutSocialLinks/AboutSocialLinks';
import Gallery from './Gallery/Gallery';

function AboutSection() {
	const t = useTranslations('Overview');
	const [isGalleryOpen, setIsGalleryOpen] = useState(false);
	return (
		<div>
			<div className='p-3'>
				<div className='flex items-center justify-between'>
					<p className='text-xl font-semibold text-btn_secondary_text'>{t('about')}</p>
					<span className='hidden lg:block'>
						<AboutSocialLinks />
					</span>
				</div>
				<p className='mt-5 text-sm text-btn_secondary_text'>
					{t('joinCommunity')}{' '}
					<button
						type='button'
						onClick={() => setIsGalleryOpen(!isGalleryOpen)}
						className='cursor-pointer text-bg_pink'
					>
						{t(isGalleryOpen ? 'minimizeGallery' : 'viewGallery')}
					</button>
				</p>
				<span className='block pt-3 lg:hidden'>
					<AboutSocialLinks />
				</span>
			</div>
			{isGalleryOpen && <Gallery />}
		</div>
	);
}

export default AboutSection;
