// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { consolePretty } from './consolePretty';
import { APIError } from './apiError';
import { storeApiKeyUsage } from './storeApiKeyUsage';
import { getNetworkFromHeaders } from './getNetworkFromHeaders';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const withErrorHandling = (handler: { (req: NextRequest, options?: any): Promise<NextResponse> }) => {
	return async (req: NextRequest, options: object) => {
		try {
			// check if network header is valid, throws error if not
			getNetworkFromHeaders(headers());
			storeApiKeyUsage(req);
			return await handler(req, options);
		} catch (error) {
			const err = error as APIError;
			console.log('Error in API call : ', req.nextUrl);
			consolePretty({ err });
			return NextResponse.json({ ...err, message: err.message }, { status: err.status });
		}
	};
};
