// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';

export default function OverviewHeading() {
	const t = useTranslations('Overview');
	return (
		<div className='flex flex-col gap-y-2 bg-bg_modal'>
			<div className='px-4 py-8 lg:px-16'>
				<div className='flex flex-col gap-y-6 md:flex-row md:items-center md:justify-between'>
					<div className='flex flex-col gap-1'>
						<h1 className='text-3xl font-bold text-text_primary'>{t('Overview.headingTitle')}</h1>
						<p className='text-sm font-medium text-wallet_btn_text'>{t('Overview.headingSubtitle')}</p>
					</div>

					<a
						href='https://polkassembly.io'
						target='_blank'
						rel='noreferrer'
						className='flex items-center gap-2 text-sm font-medium text-text_pink'
					>
						{t('Overview.readAnnouncement')} <ExternalLink className='h-4 w-4' />
					</a>
				</div>
			</div>
		</div>
	);
}
