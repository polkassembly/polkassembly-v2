// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { chatStateAtom } from '@/app/_atoms/klara/chatStateAtom';
import { useAtom } from 'jotai';
import { EChatState } from '@/_shared/types';
import { useCallback } from 'react';

export function useChatState() {
	const [state, setState] = useAtom(chatStateAtom);

	const setChatState = useCallback(
		(value: EChatState | null) => {
			setState(value);
		},
		[setState]
	);

	return {
		chatState: state,
		setChatState
	};
}
