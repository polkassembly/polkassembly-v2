// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@shared/_services/validator_service';
import { ENetwork } from '@shared/types';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { ERROR_CODES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { APIError } from './apiError';

export function getNetworkFromHeaders(headers: ReadonlyHeaders) {
	const headerNetwork = headers.get('x-network');
	const host = headers.get('host');
	const subdomain = host?.split('.')?.[0];

	const network = ValidatorService.isValidNetwork(headerNetwork as ENetwork)
		? (headerNetwork as ENetwork)
		: ValidatorService.isValidNetwork(subdomain as ENetwork)
			? (subdomain as ENetwork)
			: null;

	if (!network) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid network in request headers');
	}

	return network;
}
