// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useTheme } from 'next-themes';
import React from 'react';
import { ToastContainer } from 'react-toastify';

function NotificationsContainer() {
	const { theme } = useTheme();

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
			theme={theme === 'light' ? 'light' : 'dark'}
		/>
	);
}

export default NotificationsContainer;
