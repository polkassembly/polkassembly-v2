// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@app/_style/globals.scss';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from './_shared-components/Providers';
import { poppinsFont } from './_style/fonts';
import NotificationsContainer from './_shared-components/NotificationsContainer';
import { Initializer } from './Initializers';
import Layout from './_shared-components/Layout';

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
			<body className={poppinsFont.className}>
				<Providers>
					<Initializer />
					<Layout>{children}</Layout>
					<NotificationsContainer />
				</Providers>
			</body>
		</html>
	);
}
