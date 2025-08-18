// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { ProxyService } from '@/app/api/_api-services/proxy_service';
import { IAccessTokenPayload } from '@/_shared/types';
import { z } from 'zod';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { AuthService } from '@/app/api/_api-services/auth_service';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_PUBLIC_KEY } from '@/app/api/_api-constants/apiEnvVars';

const zodQuerySchema = z.object({
	page: z.coerce.number().optional().default(1),
	limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
	search: z.string().optional().default('')
});

export const GET = withErrorHandling(async (req: NextRequest) => {
	const { page, limit, search } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
	const network = await getNetworkFromHeaders();

	// Check authentication
	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();

	// Get user's address from the access token
	const decodedToken = jwt.verify(newAccessToken, ACCESS_TOKEN_PUBLIC_KEY!) as IAccessTokenPayload;
	if (!decodedToken.addresses || decodedToken.addresses.length === 0) {
		return NextResponse.json({ error: 'No address found for user' }, { status: 400 });
	}

	const proxies = await ProxyService.GetMyProxies({
		network,
		page,
		limit,
		search,
		userAddress: decodedToken.defaultAddress || decodedToken.addresses[0]
	});

	return NextResponse.json(proxies);
});
