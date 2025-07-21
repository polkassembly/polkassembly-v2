// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OFF_CHAIN_PROPOSAL_TYPES } from '@/_shared/_constants/offChainProposalTypes';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { EProposalType } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType).refine((val) => ValidatorService.isValidOffChainProposalType(val), {
		message: `Invalid proposal type. Must be one of: ${OFF_CHAIN_PROPOSAL_TYPES.join(', ')}`
	}),
	index: z.coerce.number(),
	pollId: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string; pollId: string }> }): Promise<NextResponse> => {
	const { proposalType, index, pollId } = zodParamsSchema.parse(await params);

	const network = await getNetworkFromHeaders();

	const votes = await OffChainDbService.GetPollVotes({ network, proposalType, index, pollId });

	return NextResponse.json({ votes });
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string; pollId: string }> }): Promise<NextResponse> => {
	const { proposalType, index, pollId } = zodParamsSchema.parse(await params);

	const zodBodySchema = z.object({
		decision: z.string()
	});

	const { decision } = zodBodySchema.parse(await getReqBody(req));

	// 1. check if user is authenticated
	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	const network = await getNetworkFromHeaders();

	// 2. create poll vote
	const vote = await OffChainDbService.CreatePollVote({ network, proposalType, index, userId, selectedOption: decision, pollId });

	// 3. invalidate cache
	await RedisService.DeletePostData({ network, proposalType, indexOrHash: index.toString() });

	return NextResponse.json({ vote });
});

export const DELETE = withErrorHandling(
	async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string; pollId: string }> }): Promise<NextResponse> => {
		const { proposalType, index, pollId } = zodParamsSchema.parse(await params);

		const network = await getNetworkFromHeaders();

		// 1. check if user is authenticated
		const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();

		// 2. get user id
		const userId = AuthService.GetUserIdFromAccessToken(newAccessToken);

		// 3. delete poll vote
		await OffChainDbService.DeletePollVote({ userId, pollId });

		// 4. invalidate cache
		await RedisService.DeletePostData({ network, proposalType, indexOrHash: index.toString() });

		return NextResponse.json({ message: 'Poll vote deleted successfully' });
	}
);
