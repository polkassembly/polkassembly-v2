// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ENetwork, EWallet, EFeature } from '@/_shared/types';
import { ValidatorService } from '@shared/_services/validator_service';
import { METAMASK_SUPPORTED_FEATURES } from '../_constants/featureFlags';

export function getSupportedWallets(network: ENetwork, action?: EFeature) {
	if (ValidatorService.isValidEthereumNetwork(network) && METAMASK_SUPPORTED_FEATURES.includes(action!)) {
		return [EWallet.METAMASK, EWallet.SUBWALLET, EWallet.TALISMAN];
	}
	if (ValidatorService.isValidEthereumNetwork(network)) {
		return [EWallet.SUBWALLET, EWallet.TALISMAN];
	}
	return Object.values(EWallet).filter((wallet) => wallet !== EWallet.METAMASK);
}
