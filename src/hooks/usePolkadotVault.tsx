// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { polkadotVaultAtom } from '../app/_atoms/polkadotVault/polkadotVaultAtom';

export function usePolkadotVault() {
	const [state, setState] = useAtom(polkadotVaultAtom);

	const setOpenTransactionModal = useCallback(
		(open: boolean) => {
			setState((prev) => ({ ...prev, open }));
		},
		[setState]
	);

	return {
		setOpenTransactionModal,
		setVaultQrState: setState,
		open: state.open,
		isQrHashed: state.isQrHashed,
		qrAddress: state.qrAddress,
		qrPayload: state.qrPayload,
		qrResolve: state.qrResolve
	};
}
