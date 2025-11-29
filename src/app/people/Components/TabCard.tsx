// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';

interface TabCardProps {
	cohortNumber: number;
	delegates: number;
	guardians: number;
	tracks: number;
}

function TabCard({ cohortNumber, delegates, guardians, tracks }: TabCardProps) {
	const t = useTranslations('DecentralizedVoices');

	return (
		<div className='mb-4 w-full bg-bg_modal'>
			<div className='mx-auto grid max-w-7xl grid-cols-1 px-4 py-5 lg:px-16'>
				<p className='text-[28px] font-semibold text-text_primary'>{t('People')}</p>
				<p className='pt-2 text-sm font-medium text-text_primary'>
					{t('PeopleDescription', {
						cohortNumber,
						delegates,
						guardians,
						tracks
					})}
				</p>
			</div>
		</div>
	);
}

export default TabCard;
