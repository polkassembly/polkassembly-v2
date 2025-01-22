// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@app/_style/globals.scss';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { DM_Sans as dmSans } from 'next/font/google';
import { getLocale, getMessages } from 'next-intl/server';
import NextTopLoader from 'nextjs-toploader';
import { Providers } from './_shared-components/Providers';
import NotificationsContainer from './_shared-components/NotificationsContainer';
import Initializers from './Initializers';
import AppLayout from './_shared-components/AppLayout/AppLayout';
import { CookieService } from '../_shared/_services/cookie_service';
import { THEME_COLORS } from './_style/theme';
import { PreloadResources } from './_shared-components/preload-resources';

export const metadata: Metadata = {
	title: 'Polkassembly',
	description: 'Polkassembly but so much better'
};

export const fontDmSans = dmSans({
	adjustFontFallback: false,
	display: 'swap',
	style: ['italic', 'normal'],
	subsets: ['latin'],
	variable: '--font-dmSans',
	weight: ['400', '500', '700']
});

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
			<PreloadResources />

			<body className={`${fontDmSans.variable} ${fontDmSans.className}`}>
				<NextTopLoader color={THEME_COLORS.light.navbar_border} />
				<Initializers
					userData={user || null}
					userPreferences={userPreferences}
				/>
				<Providers
					messages={messages}
					locale={locale}
				>
					{modal}
					<AppLayout>{children}</AppLayout>
					<NotificationsContainer />
				</Providers>
			</body>
		</html>
	);
}
