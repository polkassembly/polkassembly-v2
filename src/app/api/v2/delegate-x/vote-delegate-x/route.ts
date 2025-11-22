// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { DelegateXService } from '@/app/api/_api-services/external_api_service/delegate_x_service';
import { EProposalType } from '@/_shared/types';

const zodParamsSchema = z.object({
	userId: z.string().refine((userId) => ValidatorService.isValidUserId(userId), 'Invalid user ID'),
	proposalId: z.string().min(1, 'Proposal ID is required'),
	decision: z.number().min(0, 'Decision is required'),
	reason: z.array(z.string()).min(1, 'Reason is required'),
	comment: z.string().min(1, 'Comment is required')
});

export const POST = withErrorHandling(async (req: NextRequest) => {
	const network = await getNetworkFromHeaders();
	const readonlyHeaders = await headers();
	const xPasscode = readonlyHeaders.get('x-passcode');

	if (!xPasscode && xPasscode !== process.env.DELEGATE_X_SECRET) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Unauthorized');
	}

	const { userId, proposalId, decision, reason, comment } = zodParamsSchema.parse(await getReqBody(req));

	const user = await OffChainDbService.GetUserById(Number(userId));
	if (!user) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'User not found');
	}

	const delegateXAccount = await OffChainDbService.GetDelegateXAccountByUserId({ userId: Number(userId), network });
	if (!delegateXAccount) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'delegatex account not found');
	}

	const hash = await DelegateXService.voteOnProposal(delegateXAccount, proposalId, decision);
	const delegateXAccountId = `${delegateXAccount.userId}-${delegateXAccount.network}-${delegateXAccount.address}`;
	// get voting power from delegatex account
	const { votingPower } = delegateXAccount;
	if (!votingPower) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get voting power');
	}
	const vote = await DelegateXService.saveVote(delegateXAccountId, proposalId, hash, decision, reason, comment, EProposalType.REFERENDUM_V2, votingPower);
	if (!vote) {
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to save vote');
	}

	// add comment
	if (comment) {
		await OffChainDbService.AddNewComment({
			userId: Number(userId),
			content: comment,
			network,
			indexOrHash: proposalId,
			proposalType: EProposalType.REFERENDUM_V2,
			authorAddress: delegateXAccount.address,
			isDelegateXVote: true
		});
	}

	return NextResponse.json({ success: true, hash, vote });
});
