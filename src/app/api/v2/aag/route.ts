// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { AAGVideoService } from '@/app/api/_api-services/external_api_service/aag/aag_video_service';
import { IGenericListingResponse, IAAGVideoSummary } from '@/_shared/types';

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse<IGenericListingResponse<IAAGVideoSummary>>> => {
	const { searchParams } = new URL(req.url);
	const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);

	const videos = await AAGVideoService.GetLatestAAGVideos(limit);

	const formattedVideos = videos.map((video) => AAGVideoService.formatAAGVideoSummary(video));

	return NextResponse.json(
		{
			items: formattedVideos,
			totalCount: formattedVideos.length
		},
		{ status: StatusCodes.OK }
	);
});
