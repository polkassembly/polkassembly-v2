// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

function DashboardHeader() {
	const t = useTranslations();
	return <span className='font-pixelify text-3xl font-bold text-btn_secondary_text'>{t('Bounty.dashboard')}</span>;
}

export default DashboardHeader;
