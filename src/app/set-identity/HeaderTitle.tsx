// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';

function HeaderTitle() {
	const t = useTranslations();

	return (
		<div>
			<h1 className='text-lg font-semibold text-text_primary'>{t('SetIdentity.onChainIdentity')}</h1>
		</div>
	);
}

export default HeaderTitle;
