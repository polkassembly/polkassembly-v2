// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import type { IYouTubeCaption } from '@/_shared/types';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { AIService } from '../../_api-services/ai_service';
import { YouTubeService } from '../../_api-services/external_api_service/youtube_service';
import { APIError } from '../../_api-utils/apiError';

interface TranscriptSegment {
	text: string;
	offset: number;
	duration: number;
}

interface TranscriptResponse {
	transcript: TranscriptSegment[];
	summary: string | null;
}

export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	const videoId = url.searchParams.get('videoId');
	const videoUrl = url.searchParams.get('url');
	const generateSummary = url.searchParams.get('summary') !== 'false';
	const lang = url.searchParams.get('lang') || 'en';

	const identifier = videoId || (videoUrl ? (videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1] ?? null) : null);

	if (!identifier) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Video ID or URL is required');
	}

	let rawSubtitles: IYouTubeCaption[];
	try {
		rawSubtitles = await YouTubeService.getVideoCaptions(identifier, lang);
	} catch (error) {
		console.error('Error fetching YouTube transcript:', error);

		const message = error instanceof Error ? error.message : String(error);

		if (message.includes('429')) {
			return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: StatusCodes.TOO_MANY_REQUESTS });
		}

		if (message.includes('disabled') || message.includes('Caption fetch failed')) {
			return NextResponse.json({ error: 'Transcripts are disabled or not available for this video' }, { status: StatusCodes.NOT_FOUND });
		}

		if (message.includes('unavailable')) {
			return NextResponse.json({ error: 'Video is unavailable or transcripts are not available' }, { status: StatusCodes.NOT_FOUND });
		}

		return NextResponse.json({ error: 'Failed to fetch transcript. The video may not have captions available.' }, { status: StatusCodes.NOT_FOUND });
	}

	if (!rawSubtitles || rawSubtitles.length === 0) {
		return NextResponse.json({ error: 'No transcript found for this video' }, { status: StatusCodes.NOT_FOUND });
	}

	const transcript: TranscriptSegment[] = rawSubtitles.map((subtitle) => ({
		text: subtitle.text,
		offset: subtitle.start,
		duration: subtitle.dur
	}));

	let summary: string | null = null;
	if (generateSummary) {
		try {
			summary = await AIService.GenerateYouTubeTranscriptSummary(transcript);
		} catch (error) {
			console.error('Error generating AI summary:', error);

			if (error instanceof APIError) {
				return NextResponse.json({ error: error.message }, { status: error.status });
			}

			return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
		}
	}

	const response: TranscriptResponse = {
		transcript,
		summary
	};

	return NextResponse.json({
		success: true,
		data: response
	});
}
