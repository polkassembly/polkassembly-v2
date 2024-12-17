// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';
import NotificationsContainer from './NotificationsContainer';
import Dashboard from './AppLayout/Dashboard/page';
import { SidebarProvider } from './Sidebar/Sidebar';

interface ProvidersProps {
	children: ReactNode;
	locale: string;
	messages: AbstractIntlMessages;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <main>{children}</main>;
	}

	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='light'
			themes={['light', 'dark']}
			enableSystem={false}
		>
			<NextIntlClientProvider
				messages={messages}
				locale={locale}
			>
				<SidebarProvider>
					<Dashboard>{children}</Dashboard>
				</SidebarProvider>
				<NotificationsContainer />
			</NextIntlClientProvider>
		</ThemeProvider>
	);
}
