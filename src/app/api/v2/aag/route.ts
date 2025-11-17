// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { AAGVideoService } from '@/app/api/_api-services/external_api_service/aag/aag_video_service';
import { IGenericListingResponse, IAAGVideoSummary } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse<IGenericListingResponse<IAAGVideoSummary>>> => {
	const zodQuerySchema = z.object({
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT)
	});

	const searchParamsObject = Object.fromEntries(req.nextUrl.searchParams);
	const { limit } = zodQuerySchema.parse(searchParamsObject);

	const videos = await AAGVideoService.GetLatestAAGVideos(limit);

	const formattedVideos = videos.map((video) => AAGVideoService.formatAAGVideoSummary(video));

	return NextResponse.json({
		items: formattedVideos,
		totalCount: formattedVideos.length
	});
});
