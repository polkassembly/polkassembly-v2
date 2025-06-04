// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/app/_shared-components/Skeleton';

function MonthlySpend() {
	const t = useTranslations('GovAnalytics');
	const isLoading = true;

	if (isLoading) {
		return (
			<div className='flex flex-col gap-4 rounded-lg border border-border_grey p-4'>
				<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('monthlySpend')}</h3>
				<div className='flex flex-col gap-2'>
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-4 rounded-lg border border-border_grey p-4'>
			<h3 className='text-blue-light-high dark:text-blue-dark-high text-base font-semibold'>{t('monthlySpend')}</h3>
			<div className='flex flex-col gap-2'>
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
			</div>
		</div>
	);
}

export default MonthlySpend;
