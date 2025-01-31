// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { EProposalType } from '@/_shared/types';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';

const ACTIVITY_FEED_PROPOSAL_TYPE = EProposalType.REFERENDUM_V2;

export const GET = withErrorHandling(async () => {
	let isUserAuthenticated = false;
	let accessToken: string | undefined;
	let userId: number | undefined;

	try {
		const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
		isUserAuthenticated = true;
		accessToken = newAccessToken;
		if (accessToken) {
			userId = AuthService.GetUserIdFromAccessToken(accessToken);
		}
	} catch {
		isUserAuthenticated = false;
	}
	const network = await getNetworkFromHeaders();

	let userAddresses: string[] = [];

	if (isUserAuthenticated && accessToken && userId) {
		userAddresses = (await OffChainDbService.GetAddressesForUserId(userId)).map((a) => a.address);
	}

	const activeProposal = await OnChainDbService.getActiveProposal(network, ACTIVITY_FEED_PROPOSAL_TYPE, 15);
	if (!activeProposal) {
		return NextResponse.json({ activeProposalCount: 0, voteCount: 0 });
	}
	const activeProposalIndexes: number[] = activeProposal?.map((proposal: { index: number }) => proposal?.index) || [];
	const activeProposalCount = activeProposalIndexes.length;
	if (userAddresses.length > 0) {
		const voteCount = await OnChainDbService.getVoteCountFromProposalIndexes(network, activeProposalIndexes, userAddresses, ACTIVITY_FEED_PROPOSAL_TYPE);
		return NextResponse.json({ activeProposalCount, voteCount });
	}

	return NextResponse.json({ activeProposalCount, voteCount: 0 });
});
