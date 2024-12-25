// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { ETheme } from '@/_shared/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { SidebarProvider } from './Sidebar/Sidebar';
import { useUserPreferences } from '../_atoms/user/userPreferencesAtom';

const queryClient = new QueryClient();

export function Providers({ children, messages, locale }: { children: ReactNode; messages: AbstractIntlMessages; locale: string }) {
	const [userPreferences] = useUserPreferences();

	return (
		<NextIntlClientProvider
			messages={messages}
			locale={locale}
		>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider
					attribute='class'
					defaultTheme={userPreferences.theme}
					themes={[ETheme.LIGHT, ETheme.DARK]}
					enableSystem={false}
				>
					<SidebarProvider>{children}</SidebarProvider>
				</ThemeProvider>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</NextIntlClientProvider>
	);
}
