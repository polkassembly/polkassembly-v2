// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { IYouTubeChapter } from '@/_shared/types';
import { YouTubeService } from '../../_api-services/youtube_service';
import { APIError } from '../../_api-utils/apiError';

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const videoUrl = url.searchParams.get('url');
		const language = url.searchParams.get('language') || 'en';

		if (!videoUrl) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Video URL is required');
		}

		const videoId = YouTubeService.extractVideoId(videoUrl);
		if (!videoId) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid YouTube video URL');
		}

		let chapters: IYouTubeChapter[] = [];

		try {
			const metadata = await YouTubeService.getVideoMetadata(videoUrl, { includeCaptions: false });

			if (metadata?.description) {
				chapters = YouTubeService.extractChaptersFromDescription(metadata.description);
			}
		} catch {
			console.warn('Failed to get video metadata for chapter extraction, will try captions instead');
		}

		if (chapters.length === 0) {
			const captions = await YouTubeService.getVideoCaptions(videoUrl, language);

			if (captions && captions.length > 0) {
				chapters = YouTubeService.extractChaptersFromCaptions(captions);
			}
		}

		if (chapters.length === 0) {
			return NextResponse.json({
				success: true,
				data: {
					chapters: [],
					captionCount: 0,
					language,
					message: 'No chapters found in video description or captions'
				}
			});
		}

		return NextResponse.json({
			success: true,
			data: {
				chapters,
				captionCount: 0,
				language
			}
		});
	} catch (error) {
		console.error('Error in YouTube chapters API:', error);

		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
}
