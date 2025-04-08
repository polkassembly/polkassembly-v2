// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
	// Handle preflight OPTIONS request
	if (request.method === 'OPTIONS') {
		return new NextResponse('OK', { status: 200 });
	}

	// For non-OPTIONS requests
	return NextResponse.next();
}

export const config = {
	matcher: '/api/:path*'
};
