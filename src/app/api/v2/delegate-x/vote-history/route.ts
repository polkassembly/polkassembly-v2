// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { MAX_LISTING_LIMIT, DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { z } from 'zod';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { EProposalStatus } from '@/_shared/types';

const zodQuerySchema = z.object({
	page: z.coerce.number().optional().default(1),
	limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT)
});

export const GET = withErrorHandling(async (req: NextRequest) => {
	const network = await getNetworkFromHeaders();
	const { page, limit } = zodQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	if (!newAccessToken) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Unauthorized');
	}
	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);
	if (!userId) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Unauthorized');
	}
	const delegateXAccount = await OffChainDbService.GetDelegateXAccountByUserId({ userId, network });
	if (!delegateXAccount) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'DelegateX account not found');
	}
	const voteData = await OffChainDbService.GetVoteDataByDelegateXAccountId({
		delegateXAccountId: `${delegateXAccount.userId}-${delegateXAccount.network}-${delegateXAccount.address}`,
		page,
		limit
	});

	const votesWithStatus = await Promise.all(
		(voteData?.votes || []).map(async (vote) => {
			const onChainPostInfo = await OnChainDbService.GetOnChainPostInfo({
				network,
				indexOrHash: vote.proposalId,
				proposalType: vote.proposalType
			});
			return {
				...vote,
				status: onChainPostInfo?.status || EProposalStatus.Active
			};
		})
	);

	return NextResponse.json({ success: true, voteData: votesWithStatus, totalCount: voteData?.totalCount || 0 });
});
