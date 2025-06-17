// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useCallback, ReactNode } from 'react';
import { useAtom } from 'jotai';
import { successModalAtom } from '../app/_atoms/successState/successModalAtom';

export function useSuccessModal() {
	const [state, setState] = useAtom(successModalAtom);

	const setOpen = useCallback(
		(open: boolean) => {
			setState((prev) => ({ ...prev, open }));
		},
		[setState]
	);

	const setContent = useCallback(
		(content: ReactNode) => {
			setState((prev) => ({ ...prev, content }));
		},
		[setState]
	);

	return {
		setOpenSuccessModal: setOpen,
		setSuccessModalContent: setContent,
		open: state.open,
		content: state.content
	};
}
