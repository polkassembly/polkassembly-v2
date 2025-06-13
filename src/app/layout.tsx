// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@app/_style/globals.scss';

import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { DM_Sans as dmSans } from 'next/font/google';
import { getMessages } from 'next-intl/server';
import NextTopLoader from 'nextjs-toploader';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from './_shared-components/Providers';
import Initializers from './Initializers';
import AppLayout from './_shared-components/AppLayout/AppLayout';
import { CookieService } from '../_shared/_services/cookie_service';
import { THEME_COLORS } from './_style/theme';

export const metadata: Metadata = {
	title: OPENGRAPH_METADATA.title,
	description: OPENGRAPH_METADATA.description
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	minimumScale: 1,
	userScalable: false
};

const fontDmSans = dmSans({
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

	const messages = await getMessages({
		locale: userPreferences.locale
	});

	dayjs.locale(userPreferences.locale);

	return (
		<html
			lang={userPreferences.locale}
			className={userPreferences.theme}
			suppressHydrationWarning
		>
			<body className={`${fontDmSans.variable} ${fontDmSans.className} antialiased`}>
				<NextTopLoader
					color={THEME_COLORS.light.navbar_border}
					initialPosition={0.55}
					crawlSpeed={100}
					speed={300}
					showSpinner={false}
				/>
				<Providers
					messages={messages}
					locale={userPreferences.locale}
					userPreferences={userPreferences}
				>
					<Initializers
						userData={user || null}
						userPreferences={userPreferences}
					/>
					{modal}
					<AppLayout>{children}</AppLayout>
				</Providers>
				<SpeedInsights />
			</body>
		</html>
	);
}
