// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { KlaraDatabaseService } from '@/app/api/_api-services/klara/database';
import { z } from 'zod';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';

export const GET = withErrorHandling(async (request: NextRequest) => {
	const zodQuerySchema = z.object({
		conversationId: z.string()
	});

	const { conversationId } = zodQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

	if (!conversationId) {
		return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
	}

	const messages = await KlaraDatabaseService.GetConversationMessages(conversationId);
	return NextResponse.json(messages);
});
