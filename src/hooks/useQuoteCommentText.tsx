// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { quoteCommentTextAtom } from '@/app/_atoms/quoteCommentText/quoteCommentTextAtom';
import { useAtom } from 'jotai';
import { useCallback } from 'react';

export function useQuoteCommentText() {
	const [state, setState] = useAtom(quoteCommentTextAtom);

	const setQuoteCommentText = useCallback(
		(value: string) => {
			setState(value);
		},
		[setState]
	);

	return {
		quoteCommentText: state,
		setQuoteCommentText
	};
}
