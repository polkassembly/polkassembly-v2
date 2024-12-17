// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@app/_style/globals.scss';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from './_shared-components/Providers';
import { poppinsFont } from './_style/fonts';
import NotificationsContainer from './_shared-components/NotificationsContainer';
import Initializers from './Initializers';
import { getRefreshTokenFromCookie, getUserFromCookie, getUserPreferencesFromCookie } from './_client-utils/getUserFromCookie';
import AppLayout from './_shared-components/AppLayout/AppLayout';

export const metadata: Metadata = {
	title: 'Polkassembly',
	description: 'Polkassembly but so much better'
};

export default async function RootLayout({
	children,
	modal
}: Readonly<{
	children: ReactNode;
	modal: ReactNode;
}>) {
	const user = await getUserFromCookie();
	const refreshTokenPayload = await getRefreshTokenFromCookie();
	const userPreferences = await getUserPreferencesFromCookie();

	return (
		<html
			lang={userPreferences.locale}
			className={userPreferences.theme}
			suppressHydrationWarning
		>
			<body className={poppinsFont.className}>
				<Initializers
					userData={user || null}
					refreshTokenPayload={refreshTokenPayload}
					userPreferences={userPreferences}
				/>
				<Providers>
					{modal}
					<AppLayout>{children}</AppLayout>
					<NotificationsContainer />
				</Providers>
			</body>
		</html>
	);
}
