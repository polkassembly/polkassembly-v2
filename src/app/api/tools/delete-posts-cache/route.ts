// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { RedisService } from '../../_api-services/redis_service';
import { withErrorHandling } from '../../_api-utils/withErrorHandling';
import { getNetworkFromHeaders } from '../../_api-utils/getNetworkFromHeaders';
import { APIError } from '../../_api-utils/apiError';
import { TOOLS_PASSPHRASE } from '../../_api-constants/apiEnvVars';

export const DELETE = withErrorHandling(async (): Promise<NextResponse> => {
	const readonlyHeaders = await headers();
	const passphrase = readonlyHeaders.get('x-tools-passphrase');

	if (!passphrase?.trim() || passphrase !== TOOLS_PASSPHRASE) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Unauthorized');
	}

	const network = await getNetworkFromHeaders();

	await RedisService.ClearCacheForAllPostsForNetwork(network);

	return NextResponse.json({ message: 'Posts cache cleared' });
});
