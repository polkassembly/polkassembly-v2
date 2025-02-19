// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalStatus, EProposalType, IChildBounty } from '@/_shared/types';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';

interface IOnchainChildBounty {
	index: number;
	reward: string;
	createdAt: Date;
	curator: string;
	payee: string;
	status: EProposalStatus;
}

interface IChildBountiesResponse {
	totalCount: number;
	childBounties: IChildBounty[];
}

const zodParamsSchema = z.object({
	proposalType: z.literal(EProposalType.BOUNTY),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { index, proposalType } = zodParamsSchema.parse(await params);
	const network = await getNetworkFromHeaders();
	const parsedIndex = Number(index);

	const onchainChildBountiesInfo = await OnChainDbService.GetChildBountiesByParentBountyIndex({
		network,
		index: parsedIndex
	});

	if (!onchainChildBountiesInfo?.totalCount) {
		return NextResponse.json<IChildBountiesResponse>({
			totalCount: 0,
			childBounties: []
		});
	}

	const childBountyIndexes = onchainChildBountiesInfo.childBounties.map((childBounty: IOnchainChildBounty) => childBounty.index);

	const offChainChildBounties = await OffChainDbService.GetChildBountiesByIndexes({
		network,
		indexes: childBountyIndexes,
		proposalType
	});

	const childBounties = onchainChildBountiesInfo.childBounties.map((childBounty: IOnchainChildBounty): IChildBounty => {
		const offChainChildBounty = offChainChildBounties?.find((post) => post.index === childBounty.index);

		return {
			title: offChainChildBounty?.title ?? '',
			tags:
				offChainChildBounty?.tags?.map((tag: string) => ({
					value: tag,
					lastUsedAt: new Date(),
					network
				})) ?? [],
			index: childBounty.index,
			reward: childBounty.reward,
			createdAt: childBounty.createdAt,
			curator: childBounty.curator,
			payee: childBounty.payee,
			status: childBounty.status
		};
	});

	return NextResponse.json<IChildBountiesResponse>({
		totalCount: onchainChildBountiesInfo.totalCount,
		childBounties
	});
});
