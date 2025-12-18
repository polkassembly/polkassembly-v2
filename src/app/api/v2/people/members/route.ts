// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { NextResponse } from 'next/server';
import { IMembersDetails, IPublicUser } from '@/_shared/types';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { z } from 'zod';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';

export const GET = withErrorHandling(async (req: Request) => {
	const network = await getNetworkFromHeaders();
	const { searchParams } = new URL(req.url);
	const page = Number(searchParams.get('page')) || 1;
	const limit = Number(searchParams.get('limit')) || DEFAULT_LISTING_LIMIT;

	const schema = z.object({
		page: z.number().int().positive(),
		limit: z.number().int().positive().max(DEFAULT_LISTING_LIMIT)
	});

	const validationResult = schema.safeParse({ page, limit });
	if (!validationResult.success) {
		return NextResponse.json({ message: 'Invalid page or limit' }, { status: 400 });
	}

	const cachedData = await RedisService.GetCommunityMembers(network, page, limit);
	if (cachedData) {
		return NextResponse.json(JSON.parse(cachedData));
	}

	const { items: users, totalCount } = await OffChainDbService.GetPublicUsers(page, limit);

	if (!users || !users.length) {
		return NextResponse.json({ items: [], totalCount: 0 });
	}

	const membersPromises = users.map(async (user: IPublicUser): Promise<IMembersDetails> => {
		const address = user.addresses?.[0] || '';

		const delegateInfo = await OffChainDbService.GetPolkassemblyDelegateByAddress({ network, address });

		return {
			address,
			profileScore: user?.profileScore || 0,
			achievementBadges: user?.profileDetails?.badges || [],
			network,
			userId: user.id,
			bio: user?.profileDetails?.bio || '',
			createdAt: user.createdAt,
			socialLinks: user?.profileDetails?.publicSocialLinks || [],
			source: delegateInfo?.sources || []
		};
	});

	const items = await Promise.all(membersPromises);

	const result = { items, totalCount };

	await RedisService.SetCommunityMembers(network, result, page, limit);

	return NextResponse.json(result);
});
