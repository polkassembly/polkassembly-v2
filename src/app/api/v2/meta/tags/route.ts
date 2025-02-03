// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '../../../_api-utils/withErrorHandling';
import { OffChainDbService } from '../../../_api-services/offchain_db_service';

export const GET = withErrorHandling(async () => {
	const tags = await OffChainDbService.GetAllTags();
	return NextResponse.json(tags);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
	const zodQuerySchema = z.object({
		tags: z.array(z.string())
	});

	const { tags } = zodQuerySchema.parse(await getReqBody(req));

	await OffChainDbService.CreateTags(tags);
	return NextResponse.json({ message: 'Tags updated successfully' });
});
