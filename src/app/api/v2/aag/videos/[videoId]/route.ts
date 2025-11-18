// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { AAGVideoService } from '@/app/api/_api-services/external_api_service/aag/aag_video_service';
import { IAAGVideoMetadata } from '@/_shared/types';

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ videoId: string }> }): Promise<NextResponse<IAAGVideoMetadata | null>> => {
	const zodParamsSchema = z.object({
		videoId: z.string().min(1, 'Video ID is required')
	});

	const { videoId } = zodParamsSchema.parse(await params);

	const video = await AAGVideoService.GetAAGVideoMetadata(videoId);

	if (!video) {
		return NextResponse.json(null, { status: StatusCodes.NOT_FOUND });
	}

	return NextResponse.json(video);
});
