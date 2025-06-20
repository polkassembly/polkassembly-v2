// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAnalyticsType, EHttpHeaderKey, EPostTilesVotesType, EProposalType, IPostTilesVotes } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { headers } from 'next/headers';
import { RedisService } from '@/app/api/_api-services/redis_service';

const zodParamsSchema = z.object({
	proposalType: z.enum([EProposalType.REFERENDUM_V2, EProposalType.REFERENDUM]),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse<IPostTilesVotes>> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const zodQuerySchema = z.object({
		analyticsType: z.nativeEnum(EAnalyticsType).optional().default(EAnalyticsType.CONVICTIONS),
		votesType: z.nativeEnum(EPostTilesVotesType).default(EPostTilesVotesType.NESTED)
	});

	const { analyticsType, votesType } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));

	const [network, headersList] = await Promise.all([getNetworkFromHeaders(), headers()]);
	const skipCache = headersList.get(EHttpHeaderKey.SKIP_CACHE) === 'true';
	if (!skipCache) {
		const analytics = await RedisService.GetPostTilesVotesData({ network, proposalType, indexOrHash: index, votesType, analyticsType });
		if (analytics) {
			return NextResponse.json(analytics);
		}
	}

	const analytics = await OnChainDbService.getPostTilesVotes({ network, proposalType, index: Number(index), analyticsType, votesType });

	await RedisService.SetPostTilesVotesData({ network, proposalType, indexOrHash: index, data: analytics, votesType, analyticsType });

	return NextResponse.json(analytics);
});
