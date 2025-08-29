// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { OnChainDbService } from '@/app/api/_api-services/onchain_db_service';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { fetchPostData } from '@/app/api/_api-utils/fetchPostData';
import { EProposalStatus, EProposalType } from '@/_shared/types';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { APIError } from '@/app/api/_api-utils/apiError';
import { StatusCodes } from 'http-status-codes';
import { ValidatorService } from '@/_shared/_services/validator_service';

export const GET = withErrorHandling(async (req: NextRequest) => {
	const network = await getNetworkFromHeaders();
	const queryParamsSchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT),
		address: z.preprocess(
			(val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined),
			z.array(
				z.string().refine((val) => ValidatorService.isValidWeb3Address(val), {
					message: ERROR_MESSAGES.INVALID_INPUTS
				})
			)
		),
		proposalStatus: z.preprocess((val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined), z.array(z.nativeEnum(EProposalStatus))).optional()
	});

	const searchParamsObject = Object.fromEntries(Array.from(req.nextUrl.searchParams.entries()).map(([key]) => [key, req.nextUrl.searchParams.getAll(key)]));

	const { page, limit, address: addresses, proposalStatus: proposalStatuses } = queryParamsSchema.parse(searchParamsObject);

	if (!addresses?.length) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
	}
	const encodedAddresses = addresses.map((address) => getEncodedAddress(address, network) || '').filter(Boolean);

	const userVotesResult = await OnChainDbService.GetVotesForAddresses({ network, voters: encodedAddresses, page, limit, proposalStatuses });

	const votesPromises = userVotesResult.items.map(async (vote) => {
		const postData = await fetchPostData({ network, indexOrHash: vote.proposalIndex.toString(), proposalType: vote.proposalType as EProposalType });
		return {
			...vote,
			postDetails: postData
		};
	});
	const votes = await Promise.all(votesPromises);

	return NextResponse.json({
		items: votes,
		totalCount: userVotesResult.totalCount
	});
});
