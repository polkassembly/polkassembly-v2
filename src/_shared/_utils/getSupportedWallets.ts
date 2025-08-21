// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ENetwork, EWallet } from '@/_shared/types';
import { ValidatorService } from '@shared/_services/validator_service';

export function getSupportedWallets(network: ENetwork) {
	if (ValidatorService.isValidEthereumNetwork(network)) {
		return [EWallet.METAMASK, EWallet.SUBWALLET, EWallet.TALISMAN];
	}
	return [EWallet.POLKADOT, EWallet.TALISMAN, EWallet.SUBWALLET];
}
