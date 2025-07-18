// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EHttpHeaderKey, EProposalStatus, EProposalType, IPostAnalytics } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { headers } from 'next/headers';
import { RedisService } from '@/app/api/_api-services/redis_service';

const zodParamsSchema = z.object({
	proposalType: z.enum([EProposalType.REFERENDUM_V2, EProposalType.REFERENDUM]),
	index: z.coerce.number()
});

export const GET = withErrorHandling(
	async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse<IPostAnalytics | null>> => {
		const { proposalType, index } = zodParamsSchema.parse(await params);

		const [network, headersList] = await Promise.all([getNetworkFromHeaders(), headers()]);
		const skipCache = headersList.get(EHttpHeaderKey.SKIP_CACHE) === 'true';

		if (!skipCache) {
			const analytics = await RedisService.GetPostAnalyticsData({ network, proposalType, index });
			if (analytics) {
				return NextResponse.json(analytics);
			}
		}

		const analytics = await OnChainDbService.GetPostAnalytics({ network, proposalType, index });

		if (analytics?.proposal?.index === index) {
			await RedisService.SetPostAnalyticsData({ network, proposalType, index, data: analytics, proposalStatus: analytics.proposal.status as EProposalStatus });
		}

		return NextResponse.json(analytics);
	}
);
