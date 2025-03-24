// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { APIError } from '@/app/api/_api-utils/apiError';
import { StatusCodes } from 'http-status-codes';
import { ITag } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { OffChainDbService } from '../../../_api-services/offchain_db_service';
import { withErrorHandling } from '../../../_api-utils/withErrorHandling';

export const GET = withErrorHandling(async () => {
	const network = await getNetworkFromHeaders();
	const tags = await OffChainDbService.GetAllTags(network);
	return NextResponse.json(tags);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
	const zodBodySchema = z.object({
		tags: z.array(z.custom<ITag>())
	});

	const { tags } = zodBodySchema.parse(await getReqBody(req));

	if (!tags.length || tags.some((tag) => !ValidatorService.isValidTag(tag.value))) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST);
	}

	await OffChainDbService.CreateTags(tags);
	return NextResponse.json({ message: 'Tags updated successfully' });
});
