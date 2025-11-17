// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { VideoIndexingService } from '@/app/api/_api-services/video_indexing_service';
import { YouTubeService } from '@/app/api/_api-services/external_api_service/youtube_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { AAG_YOUTUBE_PLAYLIST_ID } from '@/hooks/useYouTubeData';

interface IndexVideoRequest {
	action: 'index_video' | 'index_playlist' | 'check_new_videos';
	videoId?: string;
	playlistId?: string;
	options?: {
		skipExisting?: boolean;
		maxVideos?: number;
		startFromVideo?: string;
	};
}

export async function POST(request: NextRequest) {
	try {
		const body: IndexVideoRequest = await request.json();

		const { action, videoId, playlistId, options } = body;

		if (!action) {
			throw new APIError(ERROR_CODES.MISSING_REQUIRED_FIELDS, StatusCodes.BAD_REQUEST, 'Action is required');
		}

		switch (action) {
			case 'index_video': {
				if (!videoId?.trim()) {
					throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Valid videoId is required for index_video action');
				}

				const videoData = await YouTubeService.getVideoMetadata(videoId, { includeCaptions: true });
				if (!videoData) {
					throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Video not found');
				}

				const aagVideoData = await VideoIndexingService.ConvertYouTubeVideoToAAGFormat(videoData);

				const result = await VideoIndexingService.IndexVideoMetadata(aagVideoData);

				return NextResponse.json(
					{
						message: result.success ? 'Video indexed successfully' : 'Failed to index video',
						data: result
					},
					{ status: result.success ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR }
				);
			}

			case 'index_playlist': {
				const targetPlaylistId = playlistId || AAG_YOUTUBE_PLAYLIST_ID;

				if (!targetPlaylistId?.trim()) {
					throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Valid playlistId is required for index_playlist action');
				}

				const batch = await VideoIndexingService.IndexPlaylistVideos(targetPlaylistId, options);

				return NextResponse.json(
					{
						message: 'Playlist indexing completed',
						data: {
							batchId: batch.batchId,
							videosProcessed: batch.videosProcessed,
							videosSuccessful: batch.videosSuccessful,
							videosFailed: batch.videosFailed,
							status: batch.status,
							errors: batch.errors.slice(0, 10) // Limit errors in response
						}
					},
					{ status: StatusCodes.OK }
				);
			}

			case 'check_new_videos': {
				const targetPlaylistId = playlistId || AAG_YOUTUBE_PLAYLIST_ID;

				if (!targetPlaylistId?.trim()) {
					throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Valid playlistId is required for check_new_videos action');
				}

				const result = await VideoIndexingService.CheckForNewVideos(targetPlaylistId);

				return NextResponse.json(
					{
						message: 'New videos check completed',
						data: result
					},
					{ status: StatusCodes.OK }
				);
			}

			default:
				throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid action. Supported actions: index_video, index_playlist, check_new_videos');
		}
	} catch (error) {
		console.error('Video indexing API error:', error);

		if (error instanceof APIError) {
			return NextResponse.json({ message: error.message }, { status: error.status });
		}

		return NextResponse.json({ message: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const action = searchParams.get('action');
		const videoId = searchParams.get('videoId');
		const batchId = searchParams.get('batchId');

		switch (action) {
			case 'get_video_metadata': {
				if (!videoId?.trim()) {
					throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Valid videoId is required');
				}

				const metadata = await VideoIndexingService.GetAAGVideoMetadata(videoId);

				if (!metadata) {
					throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Video not found');
				}

				return NextResponse.json(
					{
						message: 'Video metadata retrieved',
						data: metadata
					},
					{ status: StatusCodes.OK }
				);
			}

			case 'get_batch_status': {
				if (!batchId?.trim()) {
					throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Valid batchId is required');
				}

				const batch = await VideoIndexingService.GetIndexingBatch(batchId);

				if (!batch) {
					throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Batch not found');
				}

				return NextResponse.json(
					{
						message: 'Batch status retrieved',
						data: batch
					},
					{ status: StatusCodes.OK }
				);
			}

			default:
				throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid action. Supported actions: get_video_metadata, get_batch_status');
		}
	} catch (error) {
		console.error('Video indexing API error:', error);

		if (error instanceof APIError) {
			return NextResponse.json({ message: error.message }, { status: error.status });
		}

		return NextResponse.json({ message: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
	}
}
