// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NEXT_PUBLIC_DEFAULT_NETWORK } from '@shared/_constants/envVars';
import { ValidatorService } from '@shared/_services/validator_service';
import { ENetwork } from '@shared/types';

if (!NEXT_PUBLIC_DEFAULT_NETWORK || !ValidatorService.isValidNetwork(NEXT_PUBLIC_DEFAULT_NETWORK)) {
	throw new Error('NEXT_PUBLIC_DEFAULT_NETWORK is not set');
}

export function getCurrentNetwork(): ENetwork {
	if (!global?.window) return NEXT_PUBLIC_DEFAULT_NETWORK as ENetwork;
	let network = NEXT_PUBLIC_DEFAULT_NETWORK as ENetwork;

	const url = global.window.location.href;

	try {
		const urlNetwork = url.split('//')[1].split('.')[0];
		if (ValidatorService.isValidNetwork(urlNetwork)) {
			network = urlNetwork as ENetwork;
		}
	} catch {
		// do nothing
	}

	return network;
}
