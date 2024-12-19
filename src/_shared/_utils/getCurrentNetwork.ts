// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@shared/_services/validator_service';
import { ENetwork } from '@shared/types';
import { getSharedEnvVars } from './getSharedEnvVars';

const { NEXT_PUBLIC_DEFAULT_NETWORK: defaultNetwork } = getSharedEnvVars();
if (!defaultNetwork || !ValidatorService.isValidNetwork(defaultNetwork)) {
	throw new Error('NEXT_PUBLIC_DEFAULT_NETWORK is not set');
}

export function getCurrentNetwork(): ENetwork {
	if (!global?.window) return defaultNetwork as ENetwork;
	let network = defaultNetwork as ENetwork;

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
