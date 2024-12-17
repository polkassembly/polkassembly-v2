// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';
import { SidebarProvider } from './Sidebar/Sidebar';
import Dashboard from './AppLayout/Dashboard/page';
import NotificationsContainer from './NotificationsContainer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
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
			<QueryClientProvider client={queryClient}>
				<SidebarProvider>
					<Dashboard>{children}</Dashboard>
					<NotificationsContainer />
				</SidebarProvider>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
			;
		</ThemeProvider>
	);
}
