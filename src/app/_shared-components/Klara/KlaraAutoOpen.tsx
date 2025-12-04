// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect } from 'react';
import { useKlara } from '@/hooks/useKlara';
import { EChatState } from '@/_shared/types';

export default function KlaraAutoOpen({ referer }: { referer: string | null }) {
	const { chatState, setChatState } = useKlara();

	useEffect(() => {
		try {
			const shouldOpen = referer?.includes('klara.polkassembly.io');
			if (shouldOpen && chatState !== EChatState.EXPANDED) {
				setChatState(EChatState.EXPANDED);
			}
		} catch {
			// no-op
		}
		// Only run once on mount;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return null;
}
