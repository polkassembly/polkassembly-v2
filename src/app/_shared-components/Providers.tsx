// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';

export function Providers({ children }: { children: ReactNode }) {
	const [mounted, setMounted] = useState(false);
	const [messages, setMessages] = useState<AbstractIntlMessages | null>(null);

	useEffect(() => {
		setMounted(true);
		const fetchMessages = async () => {
			const msgs = await getMessages();
			setMessages(msgs);
		};
		fetchMessages();
	}, []);

	if (!mounted || !messages) {
		return <main>{children}</main>;
	}

	return (
		<ThemeProvider
			attribute='class'
			defaultTheme='light'
			themes={['light', 'dark']}
			enableSystem={false}
		>
			<NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
		</ThemeProvider>
	);
}
