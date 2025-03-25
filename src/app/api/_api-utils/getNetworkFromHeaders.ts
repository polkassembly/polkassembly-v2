// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use server';

import { ValidatorService } from '@shared/_services/validator_service';
import { EAppEnv, ENetwork } from '@shared/types';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { getSharedEnvVars } from '@/_shared/_utils/getSharedEnvVars';
import { APIError } from './apiError';

export async function getNetworkFromHeaders(): Promise<ENetwork> {
	const readonlyHeaders = await headers();

	const { NEXT_PUBLIC_APP_ENV, NEXT_PUBLIC_DEFAULT_NETWORK: defaultNetwork } = getSharedEnvVars();

	const headerNetwork = readonlyHeaders.get('x-network');
	const host = readonlyHeaders.get('host');
	const subdomain = host?.split('.')?.[0];

	const network = ValidatorService.isValidNetwork(headerNetwork as ENetwork)
		? (headerNetwork as ENetwork)
		: ValidatorService.isValidNetwork(subdomain as ENetwork)
			? (subdomain as ENetwork)
			: null;

	if (network) return network;

	// check if it is vercel preview link or localhost
	const isDevelopmentOrPreviewEnv = NEXT_PUBLIC_APP_ENV !== EAppEnv.PRODUCTION;

	if (isDevelopmentOrPreviewEnv) {
		return defaultNetwork as ENetwork;
	}

	if (!network) {
		// if still no network found and is vercel (main deployment) link or test link, return default network
		if (host?.includes('vercel.app') || subdomain === 'test') {
			return defaultNetwork as ENetwork;
		}

		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid network in request headers');
	}

	return network;
}
