// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest } from 'next/server';
import type { RequestInit } from 'next/dist/server/web/spec-extension/request';

export async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number }) {
	const { timeout = 15000, ...fetchOptions } = options;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			...fetchOptions,
			signal: controller.signal
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
}

export function normalizeClientIP(request: NextRequest): string {
	let clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

	// Handle multiple IPs in x-forwarded-for
	if (clientIP.includes(',')) {
		clientIP = clientIP.split(',')[0].trim();
	}

	// Handle localhost/development
	if (clientIP === '::1' || clientIP === '127.0.0.1' || clientIP === 'unknown') {
		clientIP = '127.0.0.1';
	}

	// Ensure minimum length for API requirements
	if (clientIP.length < 7) {
		clientIP = '192.168.1.100';
	}

	return clientIP;
}
