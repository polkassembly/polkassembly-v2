// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { KlaraDatabaseService } from '@/app/api/_api-services/klara/database';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId');

		if (!userId) {
			return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
		}

		const conversations = await KlaraDatabaseService.GetUserConversations(userId);
		return NextResponse.json(conversations);
	} catch (error) {
		console.error('Error fetching conversations:', error);
		return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
	}
}
