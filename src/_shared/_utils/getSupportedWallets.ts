// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ENetwork, EWallet } from '@/_shared/types';

export const isEthNetwork = (network: ENetwork) => [ENetwork.MOONBEAM].includes(network);

export function getSupportedWallets(network: ENetwork) {
	if (isEthNetwork(network)) {
		return [EWallet.METAMASK, EWallet.SUBWALLET, EWallet.TALISMAN];
	}
	return [EWallet.POLKADOT, EWallet.TALISMAN, EWallet.SUBWALLET];
}
