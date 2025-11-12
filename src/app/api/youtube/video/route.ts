// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import type { IYouTubeChapter, IReferendaItem } from '@/_shared/types';
import { ExternalAPIService } from '../../_api-services/external_api_service';
import { YouTubeService } from '../../_api-services/external_api_service/youtube_service';
import { APIError } from '../../_api-utils/apiError';

interface VideoResponse {
	id: string;
	title: string;
	description: string;
	thumbnails: Record<string, { url: string; width: number; height: number }>;
	publishedAt: string;
	channelId: string;
	channelTitle: string;
	duration: string;
	url: string;
	tags?: string[];
	viewCount?: string;
	likeCount?: string;
	commentCount?: string;
	agendaUrl?: string;
	chapters: IYouTubeChapter[];
	referenda: IReferendaItem[];
}

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const videoUrl = url.searchParams.get('url');
		const videoId = url.searchParams.get('videoId');
		const includeCaptions = url.searchParams.get('includeCaptions') !== 'false';
		const language = url.searchParams.get('language') || 'en';

		const videoIdentifier = videoUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null);

		if (!videoIdentifier) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Video URL or ID is required');
		}

		const videoMetadata = await ExternalAPIService.getYouTubeVideoMetadata(videoIdentifier, {
			includeCaptions,
			language
		});

		if (!videoMetadata) {
			return NextResponse.json({ error: 'Video not found' }, { status: StatusCodes.NOT_FOUND });
		}

		const agendaUrl = YouTubeService.extractAgendaUrl(videoMetadata.description);

		let chapters: IYouTubeChapter[] = [];
		if (videoMetadata.description) {
			chapters = YouTubeService.extractChaptersFromDescription(videoMetadata.description);
		}

		if (chapters.length === 0 && includeCaptions && videoMetadata.captions) {
			chapters = YouTubeService.extractChaptersFromCaptions(videoMetadata.captions);
		}

		let referenda: IReferendaItem[] = [];
		if (agendaUrl) {
			referenda = await YouTubeService.extractReferendaFromSheet(agendaUrl);
		}

		const response: VideoResponse = {
			id: videoMetadata.id,
			title: videoMetadata.title,
			description: videoMetadata.description,
			thumbnails: videoMetadata.thumbnails,
			publishedAt: videoMetadata.publishedAt,
			channelId: videoMetadata.channelId,
			channelTitle: videoMetadata.channelTitle,
			duration: videoMetadata.duration,
			url: videoMetadata.url,
			tags: videoMetadata.tags,
			viewCount: videoMetadata.viewCount,
			likeCount: videoMetadata.likeCount,
			commentCount: videoMetadata.commentCount,
			agendaUrl,
			chapters,
			referenda
		};

		return NextResponse.json({
			success: true,
			data: response
		});
	} catch (error) {
		console.error('Error in YouTube video API:', error);

		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
}
