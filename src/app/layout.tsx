// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@app/_style/globals.scss';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from './_shared-components/Providers';
import { poppinsFont } from './_style/fonts';
import NotificationsContainer from './_shared-components/NotificationsContainer';
import { SidebarProvider, SidebarInset } from './_shared-components/sidebar';
import Navbar from './_shared-components/AppLayout/Navbar/Navbar';
import { AppSidebar } from './_shared-components/AppLayout/AppSidebar/AppSidebar';

export const metadata: Metadata = {
	title: 'Polkassembly',
	description: 'Polkassembly but so much better'
};

export default function RootLayout({
	children
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${poppinsFont.className} flex min-h-screen flex-col`}>
				<Providers>
					<SidebarProvider>
						<div className='flex flex-1'>
							{/* Sidebar */}
							<AppSidebar />
							{/* Main Content Area */}
							<SidebarInset>
								{/* Navbar */}
								<Navbar />
								{/* Main Content */}
								<main className='flex flex-1 flex-col p-4'>{children}</main>
							</SidebarInset>
						</div>
						{/* Notifications */}
						<NotificationsContainer />
					</SidebarProvider>
				</Providers>
			</body>
		</html>
	);
}
