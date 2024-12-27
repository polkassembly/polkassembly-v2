// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@app/_style/globals.scss';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from './_shared-components/Providers';
import { poppinsFont } from './_style/fonts';
import NotificationsContainer from './_shared-components/NotificationsContainer';
import Initializers from './Initializers';
import AppLayout from './_shared-components/AppLayout/AppLayout';
import { CookieService } from '../_shared/_services/cookie_service';

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
	const user = await CookieService.getUserFromCookie();
	const userPreferences = await CookieService.getUserPreferencesFromCookie();

	const messages = await getMessages();
	const locale = await getLocale();

	return (
		<html
			lang={userPreferences.locale}
			className={userPreferences.theme}
			suppressHydrationWarning
		>
			<body className={poppinsFont.className}>
				<Initializers
					userData={user || null}
					userPreferences={userPreferences}
				>
					<Providers
						messages={messages}
						locale={locale}
					>
						{modal}
						<AppLayout>{children}</AppLayout>
						<NotificationsContainer />
					</Providers>
				</Initializers>
			</body>
		</html>
	);
}
