// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest } from 'next/server';

/**
 * Detects if the request is coming from a Mimir iframe context
 * @param req - The Next.js request object
 * @returns boolean indicating if the request is from Mimir iframe
 */
export function isMimirIframeRequest(req: NextRequest): boolean {
	// Method 1: Check for custom header (client can set this)
	const iframeHeader = req.headers.get('x-iframe-context');
	if (iframeHeader === 'mimir') {
		return true;
	}

	// Method 2: Check referer header for app.mimir.global
	const referer = req.headers.get('referer');
	if (referer) {
		try {
			const refererUrl = new URL(referer);
			if (refererUrl.hostname === 'app.mimir.global') {
				return true;
			}
		} catch {
			// Invalid referer URL, ignore
		}
	}

	// Method 3: Check origin header for app.mimir.global
	const origin = req.headers.get('origin');
	if (origin) {
		try {
			const originUrl = new URL(origin);
			if (originUrl.hostname === 'app.mimir.global') {
				return true;
			}
		} catch {
			// Invalid origin URL, ignore
		}
	}

	// Method 4: Check for iframe-specific query parameter
	const url = new URL(req.url);
	return url.searchParams.get('iframe') === 'mimir';
}

/**
 * General iframe detection (for any iframe context)
 * @param req - The Next.js request object
 * @returns boolean indicating if the request is from any iframe
 */
