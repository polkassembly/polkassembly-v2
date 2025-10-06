// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { KlaraDatabaseService } from '@/app/api/_api-services/klara/database';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { ValidatorService } from '@/_shared/_services/validator_service';

export const GET = withErrorHandling(async (request: NextRequest) => {
	const zodQuerySchema = z.object({
		userId: z.string().refine((userId) => ValidatorService.isValidUserId(userId), 'Not a valid user ID')
	});

	const { userId } = zodQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

	if (!userId) {
		return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
	}

	const conversations = await KlaraDatabaseService.GetUserConversations(userId);
	return NextResponse.json(conversations);
});
