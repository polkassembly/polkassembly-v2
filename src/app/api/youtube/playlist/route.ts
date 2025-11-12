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
		const playlistUrl = url.searchParams.get('url');
		const includeCaptions = url.searchParams.get('includeCaptions') !== 'false';
		const language = url.searchParams.get('language') || 'en';
		const maxVideosParam = url.searchParams.get('maxVideos');
		const maxVideos = maxVideosParam ? parseInt(maxVideosParam, 10) : undefined;

		if (!playlistUrl) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Playlist URL is required');
		}

		if (maxVideos && (maxVideos < 1 || maxVideos > 200)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'maxVideos must be between 1 and 200');
		}

		const playlistInfo = await ExternalAPIService.getYouTubePlaylistInfo(playlistUrl, {
			includeCaptions,
			language,
			maxVideos
		});

		if (!playlistInfo) {
			return NextResponse.json({ error: 'Playlist not found' }, { status: StatusCodes.NOT_FOUND });
		}

		return NextResponse.json({
			success: true,
			data: playlistInfo
		});
	} catch (error) {
		console.error('Error in YouTube playlist API:', error);

		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
}
