// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { ToastContainer } from 'react-toastify';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ETheme } from '@/_shared/types';

function NotificationsContainer() {
	const { userPreferences } = useUserPreferences();

	return (
		<ToastContainer
			position='top-right'
			autoClose={5000}
			hideProgressBar
			newestOnTop
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme={userPreferences.theme === ETheme.LIGHT ? ETheme.LIGHT : ETheme.DARK}
		/>
	);
}

export default NotificationsContainer;
