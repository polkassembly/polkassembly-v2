// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@app/_style/globals.scss';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from './_shared-components/Providers';
import { poppinsFont } from './_style/fonts';

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
		<html
			lang='en'
			className='dark'
		>
			<body className={`${poppinsFont.className} flex min-h-screen flex-col`}>
				<Providers
					messages={messages}
					locale={locale}
				>
					{children}
				</Providers>
			</body>
		</html>
	);
}
