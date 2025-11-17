// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { AAGVideoService } from '@/app/api/_api-services/external_api_service/aag/aag_video_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { IGenericListingResponse, IAAGVideoSummary } from '@/_shared/types';

export const GET = withErrorHandling(
	async (req: NextRequest, { params }: { params: Promise<{ referendaId: string }> }): Promise<NextResponse<IGenericListingResponse<IAAGVideoSummary>>> => {
		const { referendaId } = await params;
		const { searchParams } = new URL(req.url);
		const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

		if (!referendaId?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Referenda ID is required');
		}

		if (!/^\d+$/.test(referendaId)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid referenda ID format');
		}

		const videos = await AAGVideoService.GetAAGVideosByReferenda(referendaId, limit);

		const formattedVideos = videos.map((video) => AAGVideoService.formatAAGVideoSummary(video));

		return NextResponse.json(
			{
				items: formattedVideos,
				totalCount: formattedVideos.length
			},
			{ status: StatusCodes.OK }
		);
	}
);
