// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest } from 'next/server';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { ENetwork } from '@shared/types';

export async function GET(req: NextRequest) {
	try {
		const network = req.headers.get('x-network');
		if (!network || !Object.values(ENetwork).includes(network as ENetwork)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid network in request header');
		}

		const stats = await OnChainDbService.getBountyUserActivity(network as ENetwork);
		return Response.json(stats);
	} catch (error) {
		console.error('Bounty stats error:', error);
		return Response.json(
			{
				error: error instanceof APIError ? error.message : 'Error while fetching bounty stats'
			},
			{
				status: StatusCodes.INTERNAL_SERVER_ERROR
			}
		);
	}
}
