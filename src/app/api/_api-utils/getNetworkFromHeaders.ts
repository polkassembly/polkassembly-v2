// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@shared/_services/validator_service';
import { getCurrentNetwork } from '@shared/_utils/getCurrentNetwork';
import { ENetwork } from '@shared/types';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

export function getNetworkFromHeaders(headers: ReadonlyHeaders): ENetwork {
	const headerNetwork = headers.get('x-network');
	const host = headers.get('host');
	const subdomain = host?.split('.')?.[0];

	return ValidatorService.isValidNetwork(headerNetwork as ENetwork)
		? (headerNetwork as ENetwork)
		: ValidatorService.isValidNetwork(subdomain as ENetwork)
			? (subdomain as ENetwork)
			: getCurrentNetwork();
}
