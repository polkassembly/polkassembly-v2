// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { z } from 'zod';

export const GET = withErrorHandling(async (req: Request) => {
	const network = await getNetworkFromHeaders();
	const { searchParams } = new URL(req.url);
	const page = Number(searchParams.get('page')) || 1;
	const limit = Number(searchParams.get('limit')) || 25;

	const schema = z.object({
		page: z.number().int().positive(),
		limit: z.number().int().positive().max(100)
	});

	const validationResult = schema.safeParse({ page, limit });
	if (!validationResult.success) {
		return NextResponse.json({ message: 'Invalid page or limit' }, { status: 400 });
	}

	const cachedData = await RedisService.GetCommunityCurators(network, page, limit);
	if (cachedData) {
		return NextResponse.json(JSON.parse(cachedData));
	}

	const curatorAddresses = await OnChainDbService.GetAllActiveBountyCurators(network);

	if (!curatorAddresses.length) {
		return NextResponse.json([]);
	}

	const startIndex = (page - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedAddresses = curatorAddresses.slice(startIndex, endIndex);

	const curatorsPromises = paginatedAddresses.map(async (address) => {
		const [publicUser, bountyStats] = await Promise.all([
			OffChainDbService.GetPublicUserByAddress(address),
			(async () => {
				try {
					const curatorStatsArray = await OnChainDbService.GetCuratorStats({ network, curatorAddress: address });

					if (!curatorStatsArray || curatorStatsArray.length === 0) {
						return {
							totalRewarded: '0',
							activeBounties: 0,
							childBountyDisbursed: 0,
							unclaimedAmount: '0',
							bountiesCurated: 0
						};
					}

					return curatorStatsArray[0];
				} catch (error) {
					console.error(`Error fetching bounty stats for curator ${address}:`, error);
					return {
						totalRewarded: '0',
						activeBounties: 0,
						childBountyDisbursed: 0,
						unclaimedAmount: '0',
						bountiesCurated: 0
					};
				}
			})()
		]);

		return {
			address,
			bio: publicUser?.profileDetails?.bio || '',
			createdAt: publicUser?.createdAt,
			sociallinks: publicUser?.profileDetails?.publicSocialLinks || [],
			network,
			curatorStats: bountyStats
		};
	});

	const results = await Promise.all(curatorsPromises);

	results.sort((a, b) => (b.curatorStats?.activeBounties || 0) - (a.curatorStats?.activeBounties || 0));

	await RedisService.SetCommunityCurators(network, results, page, limit);

	return NextResponse.json(results);
});
