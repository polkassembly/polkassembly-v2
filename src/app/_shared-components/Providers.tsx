// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { ETheme } from '@/_shared/types';
import { SidebarProvider } from './Sidebar/Sidebar';
import { useUserPreferences } from '../_atoms/user/userPreferencesAtom';

export function Providers({ children }: { children: ReactNode }) {
	const [userPreferences] = useUserPreferences();

	return (
		<ThemeProvider
			attribute='class'
			defaultTheme={userPreferences?.theme || ETheme.LIGHT}
			themes={[ETheme.LIGHT, ETheme.DARK]}
			enableSystem={false}
		>
			<SidebarProvider>{children}</SidebarProvider>
		</ThemeProvider>
	);
}
