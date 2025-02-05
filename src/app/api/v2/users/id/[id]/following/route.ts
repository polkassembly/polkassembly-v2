// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

// get following
export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const following = await OffChainDbService.GetFollowing(id);

	return NextResponse.json({ following });
});
