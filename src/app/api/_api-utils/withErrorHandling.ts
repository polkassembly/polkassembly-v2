// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { fromZodError } from 'zod-validation-error';
import { APIError } from './apiError';
import { getNetworkFromHeaders } from './getNetworkFromHeaders';
import { consolePretty } from './consolePretty';

export const withErrorHandling = (handler: { (req: NextRequest, context?: any): Promise<NextResponse> }) => {
	return async (req: NextRequest, context?: any) => {
		try {
			// check if network header is valid, throws error if not
			// await Promise.all([getNetworkFromHeaders(), storeApiKeyUsage(req)]);
			await getNetworkFromHeaders();
			return await handler(req, context);
		} catch (error) {
			console.log('Error in API call : ', req.nextUrl.href);

			try {
				consolePretty({ error }, true);
			} catch {
				console.error('Failed to pretty-print error in consolePretty due to nextJS bug\n ');
				console.error('Error stack: ', (error as Error)?.stack);
			}

			let err: APIError;

			if (error instanceof ZodError) {
				err = new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, fromZodError(error).toString());
			} else {
				err = error as APIError;
			}

			return NextResponse.json({ ...err, message: err.message }, { status: err.status });
		}
	};
};
