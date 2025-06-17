// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'nextjs-toploader/app';
import { Button } from '@/app/_shared-components/Button';
import { RefreshCw } from 'lucide-react';

export default function OverviewHeading() {
	const t = useTranslations('Overview');
	const router = useRouter();
	return (
		<div className='flex items-center justify-between gap-x-2'>
			<h1 className='text-2xl font-semibold text-btn_secondary_text'>{t('overview')}</h1>
			<Button
				variant='secondary'
				onClick={() => router.push('/activity-feed')}
				rightIcon={<RefreshCw className='hidden h-4 w-4 md:block' />}
				size='sm'
			>
				{t('switchToActivityFeed')}
			</Button>
		</div>
	);
}
