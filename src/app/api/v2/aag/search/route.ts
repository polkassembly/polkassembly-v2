// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { AAGVideoService } from '@/app/api/_api-services/external_api_service/aag/aag_video_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { IGenericListingResponse, IAAGVideoSummary, ENetwork } from '@/_shared/types';

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse<IGenericListingResponse<IAAGVideoSummary>>> => {
	const { searchParams } = new URL(req.url);
	const query = searchParams.get('q')?.trim();
	const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
	const sortBy = (searchParams.get('sort') as 'latest' | 'oldest') || 'latest';
	const networkParam = searchParams.get('network');

	if (!query) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Search query (q) is required');
	}

	if (query.length < 3) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Search query must be at least 3 characters long');
	}

	// Validate sort parameter
	if (sortBy && !['latest', 'oldest'].includes(sortBy)) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Sort parameter must be either "latest" or "oldest"');
	}

	// Validate network parameter
	let network: ENetwork | null = null;
	if (networkParam) {
		if (!Object.values(ENetwork).includes(networkParam as ENetwork)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, `Invalid network. Supported networks: ${Object.values(ENetwork).join(', ')}`);
		}
		network = networkParam as ENetwork;
	}

	const videos = await AAGVideoService.SearchAAGVideosByTitle(query, limit, sortBy, network);

	const formattedVideos = videos.map((video) => AAGVideoService.formatAAGVideoSummary(video));

	return NextResponse.json(
		{
			items: formattedVideos,
			totalCount: formattedVideos.length
		},
		{ status: StatusCodes.OK }
	);
});
