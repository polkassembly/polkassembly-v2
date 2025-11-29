// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';

interface TabCardProps {
	cohortNumber: number;
	delegates: number;
	guardians: number;
	tracks: number;
}

function TabCard({ cohortNumber, delegates, guardians, tracks }: TabCardProps) {
	const t = useTranslations('DecentralizedVoices');

	const description =
		guardians > 0
			? t('PeopleDescription', {
					cohortNumber,
					delegates,
					guardians,
					tracks
				})
			: t('PeopleDescriptionNoGuardians', {
					cohortNumber,
					delegates,
					tracks
				});

	return (
		<div className='w-full bg-bg_modal'>
			<div className='mx-auto grid max-w-7xl grid-cols-1 px-4 pt-5 lg:px-16'>
				<p className='text-[28px] font-semibold text-text_primary'>{t('People')}</p>
				<p className='pt-2 text-sm font-medium text-text_primary'>{description}</p>
				<TabsList className='justify-start pt-5'>
					<TabsTrigger value='dv'>{t('DecentralisedVoices')}</TabsTrigger>
				</TabsList>
			</div>
		</div>
	);
}

export default TabCard;
