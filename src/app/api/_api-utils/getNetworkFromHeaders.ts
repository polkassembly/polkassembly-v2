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
	const xForwardedHost = readonlyHeaders.get('x-forwarded-host');
	const subdomain = host?.split('.')?.[0] || xForwardedHost?.split('.')?.[0];

	// Try to determine network from x-network header or subdomain
	const network = ValidatorService.isValidNetwork(headerNetwork as ENetwork)
		? (headerNetwork as ENetwork)
		: ValidatorService.isValidNetwork(subdomain as ENetwork)
			? (subdomain as ENetwork)
			: null;

	if (network) {
		console.log('Found valid network from headers:', network);
		return network;
	}

	// Check if it is vercel preview link, localhost, or Cloud Run deployment
	const isDevelopmentOrPreviewEnv = NEXT_PUBLIC_APP_ENV !== EAppEnv.PRODUCTION;

	// In development or special environments, use default network
	if (isDevelopmentOrPreviewEnv) {
		console.log('Not production env, using default network:', defaultNetwork);
		return defaultNetwork as ENetwork;
	}

	if (!network) {
		// if still no network found and is vercel (main deployment) link or test link, return default network
		if (host?.includes('.app') || subdomain === 'test') {
			console.log('Vercel link or test link, using default network:', defaultNetwork);
			return defaultNetwork as ENetwork;
		}

		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid network in request headers');
	}

	// If we get here, we couldn't determine a valid network
	console.log('Failed to determine network from headers');
	throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid network in request headers');
}
