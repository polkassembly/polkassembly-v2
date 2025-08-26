// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EHttpHeaderKey } from '@/_shared/types';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { createHash } from 'crypto';

const zodParamsSchema = z.object({
	id: z.coerce.number().positive()
});

const zodQuerySchema = z.object({
	timePeriod: z.enum(['today', 'week', 'month', 'all']).optional().default('all')
});

// GET - Retrieve profile views
export const GET = withErrorHandling(
	async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse<{ total: number; unique: number; period: string }>> => {
		const { id } = zodParamsSchema.parse(await params);
		const { timePeriod } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

		const [network, readonlyHeaders] = await Promise.all([getNetworkFromHeaders(), headers()]);
		const skipCache = readonlyHeaders.get(EHttpHeaderKey.SKIP_CACHE) === 'true';

		// Try to get from cache first
		let profileViews = await RedisService.GetProfileViews({ userId: id, network, timePeriod });
		if (profileViews && !skipCache) {
			return NextResponse.json(profileViews);
		}

		// Get from database
		profileViews = await OffChainDbService.GetProfileViews({ userId: id, network, timePeriod });

		if (!profileViews) {
			throw new Error('Failed to fetch profile views');
		}

		// Cache the result
		await RedisService.SetProfileViews({ userId: id, network, timePeriod, data: profileViews });

		return NextResponse.json(profileViews);
	}
);

// POST - Increment profile view
export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse<{ message: string }>> => {
	const { id } = zodParamsSchema.parse(await params);
	const network = await getNetworkFromHeaders();

	// Get viewer information
	let viewerId: number | undefined;
	let ipHash: string | undefined;

	try {
		// Try to get authenticated user
		const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
		viewerId = AuthService.GetUserIdFromAccessToken(newAccessToken);
	} catch {
		// User is not authenticated, use IP hash for anonymous tracking
		const forwarded = req.headers.get('x-forwarded-for');
		const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
		ipHash = createHash('sha256').update(ip).digest('hex');
	}

	// Increment profile view
	await OffChainDbService.IncrementProfileView({
		userId: id,
		viewerId,
		network,
		ipHash
	});

	// Clear cache for this user's profile views
	await RedisService.DeleteProfileViews({ userId: id, network });

	return NextResponse.json({ message: 'Profile view incremented successfully' });
});
