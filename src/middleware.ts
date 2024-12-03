// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
	if (req.method === 'OPTIONS') {
		return new Response('OK', { status: 200 });
	}
	if (req.nextUrl.pathname.startsWith('/_next') || req.nextUrl.pathname.includes('/api/') || PUBLIC_FILE.test(req.nextUrl.pathname)) {
		return NextResponse.next();
	}
	if (req.nextUrl.locale === 'default') {
		const locale = req.cookies.get('NEXT_LOCALE')?.value || 'en';

		return NextResponse.redirect(new URL(`/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: '/api/:path*'
};
