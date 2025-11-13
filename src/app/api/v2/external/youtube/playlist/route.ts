// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import type { IReferendaItem } from '@/_shared/types';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { YouTubeService } from '@/app/api/_api-services/external_api_service/youtube_service';
import { ExternalAPIService } from '@/app/api/_api-services/external_api_service';
import { APIError } from '@/app/api/_api-utils/apiError';

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const playlistUrl = url.searchParams.get('url');
		const includeCaptions = url.searchParams.get('includeCaptions') !== 'false';
		const language = url.searchParams.get('language') || 'en';
		const maxVideosParam = url.searchParams.get('maxVideos');
		let maxVideos: number | undefined;

		if (maxVideosParam !== null) {
			const parsedMaxVideos = Number.parseInt(maxVideosParam, 10);

			if (Number.isNaN(parsedMaxVideos) || parsedMaxVideos < 1 || parsedMaxVideos > 200) {
				throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'maxVideos must be an integer between 1 and 200');
			}

			maxVideos = parsedMaxVideos;
		}

		if (!playlistUrl) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Playlist URL is required');
		}

		const playlistInfo = await ExternalAPIService.getYouTubePlaylistInfo(playlistUrl, {
			includeCaptions,
			language,
			maxVideos
		});

		if (!playlistInfo) {
			return NextResponse.json({ error: 'Playlist not found' }, { status: StatusCodes.NOT_FOUND });
		}

		const videosWithReferenda = await Promise.all(
			playlistInfo.videos.map(async (video) => {
				const agendaUrl = YouTubeService.extractAgendaUrl(video.description);
				let referenda: IReferendaItem[] = [];

				if (agendaUrl) {
					try {
						referenda = await YouTubeService.extractReferendaFromSheet(agendaUrl);
					} catch (error) {
						console.error(`Error fetching referenda for video ${video.metadata.id}:`, error);
					}
				}

				return {
					...video,
					referenda,
					agendaUrl
				};
			})
		);

		return NextResponse.json({
			success: true,
			data: {
				playlist: playlistInfo.playlist,
				videos: videosWithReferenda
			}
		});
	} catch (error) {
		console.error('Error in YouTube playlist API:', error);

		if (error instanceof APIError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
}
