// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
	// Handle preflight OPTIONS request
	if (request.method === 'OPTIONS') {
		return new NextResponse('OK', { status: 200 });
	}

	// Forward the request pathname as a header so server components (e.g. AppLayout)
	// can read it and skip the OpenGov chrome on bare routes like /ecosystem-dashboard.
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set('x-pathname', request.nextUrl.pathname);

	return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
	// Match every page + api route except Next internals and static assets.
	matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)']
};
