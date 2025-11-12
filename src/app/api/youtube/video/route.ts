// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ExternalAPIService } from '../../_api-services/external_api_service';
import { APIError } from '../../_api-utils/apiError';

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const videoUrl = url.searchParams.get('url');
		const includeCaptions = url.searchParams.get('includeCaptions') !== 'false';
		const language = url.searchParams.get('language') || 'en';

		if (!videoUrl) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Video URL is required');
		}

		const videoMetadata = await ExternalAPIService.getYouTubeVideoMetadata(videoUrl, {
			includeCaptions,
			language
		});

		if (!videoMetadata) {
			return NextResponse.json({ error: 'Video not found' }, { status: StatusCodes.NOT_FOUND });
		}

		return NextResponse.json({
			success: true,
			data: videoMetadata
		});
	} catch (error) {
		console.error('Error in YouTube video API:', error);

		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
}
