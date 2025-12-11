// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { NextResponse } from 'next/server';
import { EDelegateSource, IDelegateDetails, IPublicUser } from '@/_shared/types';
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

	const cachedData = await RedisService.GetCommunityMembers(network, page, limit);
	if (cachedData) {
		return NextResponse.json(JSON.parse(cachedData));
	}

	const { items: users, totalCount } = await OffChainDbService.GetPublicUsers(page, limit);

	if (!users || !users.length) {
		return NextResponse.json({ items: [], totalCount: 0 });
	}

	const buildBaseMember = (user: IPublicUser, address: string) =>
		({
			address,
			sources: [EDelegateSource.INDIVIDUAL],
			name: user.username,
			image: user.profileDetails?.image,
			network,
			delegators: [],
			receivedDelegationsCount: 0,
			maxDelegated: '0',
			last30DaysVotedProposalsCount: 0,
			publicUser: user
		}) as IDelegateDetails;

	const membersPromises = users.map(async (user: IPublicUser) => {
		const address = user.addresses?.[0] || '';
		const baseMember = buildBaseMember(user, address);

		if (!address) {
			return baseMember;
		}

		try {
			const delegateDetails = await OnChainDbService.GetDelegateDetails({ network, address });

			return {
				...baseMember,
				delegators: delegateDetails?.delegators || [],
				receivedDelegationsCount: delegateDetails?.receivedDelegationsCount || 0,
				maxDelegated: delegateDetails?.maxDelegated || '0',
				last30DaysVotedProposalsCount: delegateDetails?.last30DaysVotedProposalsCount || 0
			};
		} catch (error) {
			// If on-chain data fetch fails for a user, fall back to base details instead of failing the entire response
			console.error(`Failed to fetch delegate details for address ${address}:`, error);
			return baseMember;
		}
	});

	const items = await Promise.all(membersPromises);

	const result = { items, totalCount };

	await RedisService.SetCommunityMembers(network, result, page, limit);

	return NextResponse.json(result);
});
