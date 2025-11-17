// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { AAGVideoService } from '@/app/api/_api-services/external_api_service/aag/aag_video_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { IAAGVideoMetadata } from '@/_shared/types';

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ videoId: string }> }): Promise<NextResponse<IAAGVideoMetadata | null>> => {
	const { videoId } = await params;

	if (!videoId?.trim()) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Video ID is required');
	}

	const video = await AAGVideoService.GetAAGVideoMetadata(videoId);

	if (!video) {
		return NextResponse.json(null, { status: StatusCodes.NOT_FOUND });
	}

	const formattedVideo: IAAGVideoMetadata = {
		id: video.id,
		title: video.title,
		description: video.description,
		thumbnail: video.thumbnail,
		url: video.url,
		publishedAt: video.publishedAt,
		duration: video.duration,
		network: video.network,
		viewCount: video.viewCount,
		likeCount: video.likeCount,
		commentCount: video.commentCount,
		agendaUrl: video.agendaUrl,
		aiSummary: video.aiSummary,
		referenda: video.referenda,
		chapters: video.chapters,
		transcript: video.transcript,
		createdAt: video.createdAt,
		updatedAt: video.updatedAt,
		isIndexed: video.isIndexed
	};

	return NextResponse.json(formattedVideo, { status: StatusCodes.OK });
});
