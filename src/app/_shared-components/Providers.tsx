// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='light'
			themes={['light', 'dark']}
		>
			{children}
		</ThemeProvider>
	);
}
