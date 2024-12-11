// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@app/_style/globals.scss';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from './_shared-components/Providers';
import { poppinsFont } from './_style/fonts';
import NotificationsContainer from './_shared-components/NotificationsContainer';
import { SidebarProvider } from './_shared-components/Sidebar';
import Navbar from './_shared-components/AppLayout/Navbar/Navbar';
import AppSidebar from './_shared-components/AppLayout/AppSidebar/AppSidebar';
import Initializers from './Initializers';
import { getRefreshTokenFromCookie, getUserFromCookie } from './_client-utils/getUserFromCookie';

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

	return (
		<html lang='en'>
			<body className={poppinsFont.className}>
				<Providers>
					<Initializers
						userData={user || null}
						refreshTokenPayload={refreshTokenPayload}
					/>
					<SidebarProvider open>
						<AppSidebar />
						{modal}
						<main className='w-full'>
							<Navbar />
							{children}
						</main>
						<NotificationsContainer />
					</SidebarProvider>
				</Providers>
			</body>
		</html>
	);
}
