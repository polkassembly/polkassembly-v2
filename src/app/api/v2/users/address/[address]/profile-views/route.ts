// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';

const zodParamsSchema = z.object({
	address: z.string()
});

const zodQuerySchema = z.object({
	timePeriod: z.enum(['today', 'week', 'month', 'all']).optional().default('month')
});

// GET - Retrieve profile views for an address
export const GET = withErrorHandling(
	async (req: NextRequest, { params }: { params: Promise<{ address: string }> }): Promise<NextResponse<{ total: number; unique: number; period: string }>> => {
		const { address } = zodParamsSchema.parse(await params);
		const { timePeriod } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

		const network = await getNetworkFromHeaders();

		// Get from database (no caching for address-based views)
		const profileViews = await OffChainDbService.GetProfileViews({ address, network, timePeriod });

		if (!profileViews) {
			throw new Error('Failed to fetch profile views');
		}

		return NextResponse.json(profileViews);
	}
);

// POST - Increment profile view for an address
export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ address: string }> }): Promise<NextResponse<{ message: string }>> => {
	const { address } = zodParamsSchema.parse(await params);
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
		address,
		viewerId,
		network,
		ipHash
	});

	// No cache clearing for address-based views

	return NextResponse.json({ message: 'Profile view incremented successfully' });
});
