// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { tipModalAtom } from '../app/_atoms/tipState/tipModalState';

export function useTipModal() {
	const [state, setState] = useAtom(tipModalAtom);

	const setOpen = useCallback(
		(open: boolean) => {
			setState((prev) => ({ ...prev, open }));
		},
		[setState]
	);

	const setBeneficiaryAddress = useCallback(
		(beneficiaryAddress: string) => {
			setState((prev) => ({ ...prev, beneficiaryAddress }));
		},
		[setState]
	);

	return {
		setOpenTipModal: setOpen,
		setBeneficiaryAddress,
		open: state.open,
		beneficiaryAddress: state.beneficiaryAddress
	};
}
