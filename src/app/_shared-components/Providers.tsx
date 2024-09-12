// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NextUIProvider } from '@nextui-org/system';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { Provider } from 'jotai';
import QueryProvider from './QueryProvider';

export function Providers({ children }: { children: ReactNode }) {
	return (
		<NextUIProvider>
			<ThemeProvider
				attribute='class'
				defaultTheme='light'
				themes={['light', 'dark']}
			>
				<Provider>
					<QueryProvider>{children}</QueryProvider>
				</Provider>
			</ThemeProvider>
		</NextUIProvider>
	);
}
