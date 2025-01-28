// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { ClientError } from '@/app/_client-utils/clientError';
import { withErrorHandling } from '../../../_api-utils/withErrorHandling';
import { OffChainDbService } from '../../../_api-services/offchain_db_service';

export const GET = withErrorHandling(async () => {
	const alltags = await OffChainDbService.GetAllTags();
	const tags = alltags.map((tag) => {
		return { lastUsedAt: tag?.last_used_at?.toDate ? tag.last_used_at.toDate() : tag?.last_used_at, name: tag?.name || '' };
	});

	return NextResponse.json(tags);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
	const { tags } = await req.json();
	if (!tags || tags?.find((tag: string) => typeof tag !== 'string')) throw new ClientError('Tags are required');
	await OffChainDbService.CreateTags(tags);
	return NextResponse.json({ message: 'Tags updated successfully' });
});
