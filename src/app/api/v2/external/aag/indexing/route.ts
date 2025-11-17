// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { AAGVideoService } from '@/app/api/_api-services/external_api_service/aag/aag_video_service';
import { YouTubeService } from '@/app/api/_api-services/external_api_service/youtube_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { AAG_YOUTUBE_PLAYLIST_ID } from '@/_shared/_constants/aag_playlist_id';

enum EAAGIndexingAction {
	INDEX_VIDEO = 'index_video',
	BULK_INDEX_PLAYLIST = 'bulk_index_playlist',
	CHECK_NEW_VIDEOS = 'check_new_videos'
}

const zodIndexVideoSchema = z.object({
	action: z.nativeEnum(EAAGIndexingAction),
	videoId: z.string().optional(),
	maxVideos: z.number().min(1).max(200).optional(),
	startFrom: z.number().min(0).optional(),
	includeMetadata: z.boolean().optional(),
	includeCaptions: z.boolean().optional(),
	language: z.string().optional()
});

export const POST = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const requestBody = await getReqBody(req);
	const validation = zodIndexVideoSchema.safeParse(requestBody);
	if (!validation.success) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, validation.error.errors[0]?.message || 'Invalid request data');
	}

	const { action, videoId, maxVideos, startFrom, includeMetadata, includeCaptions, language } = validation.data;

	switch (action) {
		case EAAGIndexingAction.INDEX_VIDEO: {
			if (!videoId?.trim()) {
				throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Valid videoId is required for index_video action');
			}

			const videoData = await YouTubeService.getVideoMetadata(videoId, { includeCaptions: includeCaptions ?? true });
			if (!videoData) {
				throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Video not found');
			}

			const aagVideoData = {
				id: videoData.id,
				title: videoData.title,
				date: videoData.publishedAt,
				duration: videoData.duration,
				thumbnail: videoData.thumbnails?.medium?.url || videoData.thumbnails?.high?.url || '',
				url: videoData.url,
				description: videoData.description,
				referenda: [],
				publishedAt: videoData.publishedAt,
				captions: videoData.captions,
				viewCount: videoData.viewCount,
				likeCount: videoData.likeCount,
				commentCount: videoData.commentCount,
				tags: videoData.tags
			};

			const result = await AAGVideoService.IndexVideoMetadata(aagVideoData);
			return NextResponse.json(
				{
					success: true,
					message: 'Video indexed successfully',
					data: result
				},
				{ status: StatusCodes.OK }
			);
		}

		case EAAGIndexingAction.BULK_INDEX_PLAYLIST: {
			if (!AAG_YOUTUBE_PLAYLIST_ID?.trim()) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'AAG playlist ID is not configured');
			}

			const indexingOptions = {
				maxVideos: maxVideos || 50,
				startFrom: startFrom || 0,
				includeMetadata: includeMetadata ?? true,
				includeCaptions: includeCaptions ?? true,
				language: language || 'en'
			};

			const batch = await AAGVideoService.IndexPlaylistVideos(AAG_YOUTUBE_PLAYLIST_ID, indexingOptions);
			return NextResponse.json(
				{
					success: true,
					message: `Bulk indexing completed. Processed ${batch.videosProcessed || 0} videos`,
					data: batch
				},
				{ status: StatusCodes.OK }
			);
		}

		case EAAGIndexingAction.CHECK_NEW_VIDEOS: {
			if (!AAG_YOUTUBE_PLAYLIST_ID?.trim()) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'AAG playlist ID is not configured');
			}

			const result = await AAGVideoService.CheckForNewVideos(AAG_YOUTUBE_PLAYLIST_ID);
			return NextResponse.json(result);
		}

		default:
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid action specified');
	}
});
