// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

function ExternalTab() {
	const t = useTranslations();
	return (
		<div>
			<p>{t('CreateProposalDropdownButton.contentWillBeAvailableSoon')}</p>
		</div>
	);
}

export default ExternalTab;
