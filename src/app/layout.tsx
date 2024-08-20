// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '../global/globals.scss';
import type { Metadata } from 'next';
import { Providers } from '@/components/Misc/Providers';
import { poppinsFont } from '@/utils/fonts';
import { ReactNode } from 'react';
import NotificationsContainer from '@/components/Misc/NotificationsContainer';

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
			<body className={`${poppinsFont.className}`}>
				<Providers>
					<main>{children}</main>
					<NotificationsContainer />
				</Providers>
			</body>
		</html>
	);
}
