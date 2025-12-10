// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { AAGVideoService } from '@/app/api/_api-services/external_api_service/aag/aag_video_service';
import { IGenericListingResponse, IAAGVideoSummary, ENetwork, IAAGVideoMetadata } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse<IGenericListingResponse<IAAGVideoSummary>>> => {
	const zodQuerySchema = z.object({
		page: z.coerce.number().int().min(1).default(1),
		q: z.string().trim().min(3, 'Search query must be at least 3 characters long').optional(),
		limit: z.coerce.number().int().min(1).max(MAX_LISTING_LIMIT).default(DEFAULT_LISTING_LIMIT),
		sort: z.enum(['latest', 'oldest']).optional().default('latest'),
		network: z.nativeEnum(ENetwork).optional().nullable()
	});

	const searchParamsObject = Object.fromEntries(req.nextUrl.searchParams);
	const { q: query, limit, sort: sortBy, network, page } = zodQuerySchema.parse(searchParamsObject);

	let videos: IAAGVideoMetadata[] = [];
	let totalCount = 0;

	if (query) {
		const { data, totalCount: count } = await AAGVideoService.SearchAAGVideosByTitle(query, limit, page, sortBy, network);
		videos = data;
		totalCount = count;
	} else {
		const { data, totalCount: count } = await AAGVideoService.GetLatestAAGVideos(limit, page);
		videos = data;
		totalCount = count;
	}

	const formattedVideos = videos.map((video) => AAGVideoService.formatAAGVideoSummary(video));

	return NextResponse.json({
		items: formattedVideos,
		totalCount
	});
});
