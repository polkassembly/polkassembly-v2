// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';

function setCorsHeaders(headers: Headers, origin: string) {
	headers.set('Access-Control-Allow-Origin', origin);
	headers.set('Access-Control-Allow-Credentials', 'true');

	headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
	headers.set(
		'Access-Control-Allow-Headers',
		'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-network, x-api-key, x-forwarded-host'
	);
	headers.set('Access-Control-Max-Age', '86400');
}

export function middleware(request: NextRequest) {
	const origin = request.headers.get('origin') || '*';

	// Handle preflight OPTIONS request
	if (request.method === 'OPTIONS') {
		const response = new NextResponse('OK', { status: 200 });
		setCorsHeaders(response.headers, origin);
		return response;
	}

	// For non-OPTIONS requests
	const response = NextResponse.next();
	setCorsHeaders(response.headers, origin);
	return response;
}

export const config = {
	matcher: '/api/:path*'
};
