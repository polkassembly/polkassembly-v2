// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@api/_api-utils/apiError';
import { getReqBody } from '@api/_api-utils/getReqBody';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { username } = await getReqBody(req);

	if (!username) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID_PARAMS_ERROR);
	}

	const user = await OffChainDbService.GetUserByUsername(username);

	if (user) return NextResponse.json({ userExists: true, message: 'User Exists, Please Signup with another Username' });

	return NextResponse.json({ userExists: false, message: 'Username is Valid' });
});
