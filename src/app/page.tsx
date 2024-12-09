// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';

export default function Home() {
	const t = useTranslations('HomePage');
	return (
		<div>
			<h1 className='text-center leading-10'>{t('title')}</h1>
		</div>
	);
}
