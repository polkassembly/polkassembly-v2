// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { KlaraDatabaseService } from '@/app/api/_api-services/klara/database';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const conversationId = searchParams.get('conversationId');

		if (!conversationId) {
			return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
		}

		const messages = await KlaraDatabaseService.GetConversationMessages(conversationId);
		return NextResponse.json(messages);
	} catch (error) {
		console.error('Error fetching messages:', error);
		return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
	}
}
