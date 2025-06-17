// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { ETheme, IUserPreferences } from '@/_shared/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { getTimeZoneForLocale } from '@/_shared/_utils/getTimeZoneForLocale';
import { SidebarProvider } from './Sidebar/Sidebar';
import { ToastProviderWrapper } from './Toaster/ToastProviderWrapper';

const queryClient = new QueryClient();

export function Providers({
	children,
	messages,
	locale,
	userPreferences
}: {
	children: ReactNode;
	messages: AbstractIntlMessages;
	locale: string;
	userPreferences: IUserPreferences;
}) {
	return (
		<JotaiProvider>
			<NextIntlClientProvider
				messages={messages}
				locale={locale}
				timeZone={getTimeZoneForLocale(locale)}
			>
				<QueryClientProvider client={queryClient}>
					<ThemeProvider
						attribute='class'
						defaultTheme={userPreferences.theme}
						themes={[ETheme.LIGHT, ETheme.DARK]}
						enableSystem={false}
					>
						<SidebarProvider>{children}</SidebarProvider>
						<ToastProviderWrapper />
					</ThemeProvider>
				</QueryClientProvider>
			</NextIntlClientProvider>
		</JotaiProvider>
	);
}
