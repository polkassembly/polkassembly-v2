// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { EHttpHeaderKey, EProposalType, IContentSummary } from '@/_shared/types';
import { AIService } from '@/app/api/_api-services/ai_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { SubsquareOffChainService } from '@/app/api/_api-services/offchain_db_service/subsquare_offchain_service';
import { RedisService } from '@/app/api/_api-services/redis_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 300;

const zodParamsSchema = z.object({
	proposalType: z.nativeEnum(EProposalType),
	index: z.string()
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ proposalType: string; index: string }> }): Promise<NextResponse> => {
	const { proposalType, index } = zodParamsSchema.parse(await params);

	const [network, headersList] = await Promise.all([getNetworkFromHeaders(), headers()]);
	const skipCache = headersList.get(EHttpHeaderKey.SKIP_CACHE) === 'true';

	let contentSummary: IContentSummary | null = null;

	// Try to get from cache first
	let cachedData = null;
	if (!skipCache) {
		cachedData = await RedisService.GetContentSummary({ network, indexOrHash: index, proposalType });
	}

	contentSummary = cachedData;

	if (!cachedData) {
		contentSummary = await OffChainDbService.GetContentSummary({ network, indexOrHash: index, proposalType });
	}

	if (!contentSummary?.postSummary) {
		// try and generate content summary
		contentSummary = await AIService.GenerateAndUpdatePostSummary({ network, proposalType, indexOrHash: index });
	}

	if (!contentSummary?.commentsSummary) {
		const newContentSummary = await AIService.UpdatePostCommentsSummary({ network, proposalType, indexOrHash: index });
		if (newContentSummary) {
			contentSummary = newContentSummary;
		}
	}

	if (!contentSummary) {
		const subsquareContentSummary = await SubsquareOffChainService.GetContentSummary({ network, proposalType, indexOrHash: index });
		if (subsquareContentSummary) {
			contentSummary = subsquareContentSummary;
		}
	}

	if (!contentSummary) {
		throw new APIError(ERROR_CODES.CONTENT_SUMMARY_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
	}

	// Cache the response
	await RedisService.SetContentSummary({ network, indexOrHash: index, proposalType, data: contentSummary });

	return NextResponse.json(contentSummary);
});
