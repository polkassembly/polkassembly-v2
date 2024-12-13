// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@app/_style/globals.scss';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Providers } from './_shared-components/Providers';
import { poppinsFont } from './_style/fonts';
import NotificationsContainer from './_shared-components/NotificationsContainer';
import { SidebarProvider } from './_shared-components/Sidebar';
import Navbar from './_shared-components/AppLayout/Navbar/Navbar';
import AppSidebar from './_shared-components/AppLayout/AppSidebar/AppSidebar';

export const metadata: Metadata = {
	title: 'Polkassembly',
	description: 'Polkassembly but so much better'
};

export default async function RootLayout({
	children
}: Readonly<{
	children: ReactNode;
}>) {
	const locale = await getLocale();
	const messages = await getMessages();

	return (
		<html lang={locale}>
			<body className={poppinsFont.className}>
				<Providers>
					<NextIntlClientProvider
						messages={messages}
						locale={locale}
					>
						<SidebarProvider open>
							<AppSidebar />
							<main className='w-full'>
								<Navbar />
								{children}
							</main>
							<NotificationsContainer />
						</SidebarProvider>
					</NextIntlClientProvider>
				</Providers>
			</body>
		</html>
	);
}
