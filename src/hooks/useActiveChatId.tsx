// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { activeChatIdAtom } from '@/app/_atoms/klara/activeChatAtom';
import { useAtom } from 'jotai';
import { useCallback } from 'react';

export function useActiveChatId() {
	const [state, setState] = useAtom(activeChatIdAtom);

	const setActiveChatId = useCallback(
		(value: string | null) => {
			setState(value);
		},
		[setState]
	);

	return {
		activeChatId: state,
		setActiveChatId
	};
}
