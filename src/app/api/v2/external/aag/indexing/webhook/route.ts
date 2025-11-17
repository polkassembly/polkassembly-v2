// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { AAGIndexingService } from '@/app/api/_api-services/external_api_service/aag/indexing_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { AAG_YOUTUBE_PLAYLIST_ID } from '@/hooks/useYouTubeData';

interface DailyWebhookRequest {
	secretKey?: string;
	playlistId?: string;
	dryRun?: boolean;
	maxVideos?: number;
}

interface DailyWebhookResponse {
	success: boolean;
	message: string;
	data: {
		newVideos: number;
		updatedVideos: number;
		errors: string[];
		processed: number;
		timestamp: string;
		playlistId: string;
		duration: number;
	};
}

const zodWebhookSchema = z.object({
	secretKey: z.string().optional(),
	playlistId: z.string().optional(),
	dryRun: z.boolean().optional(),
	maxVideos: z.number().optional()
});

const WEBHOOK_SECRET = process.env.VIDEO_INDEXING_WEBHOOK_SECRET || '';

export const POST = withErrorHandling(async (req: NextRequest): Promise<NextResponse<DailyWebhookResponse>> => {
	const startTime = Date.now();
	const timestamp = new Date().toISOString();

	let body: DailyWebhookRequest = {};
	try {
		body = await req.json();
	} catch {
		body = {};
	}

	if (Object.keys(body).length > 0) {
		const validation = zodWebhookSchema.safeParse(body);
		if (!validation.success) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, validation.error.errors[0]?.message || 'Invalid webhook data');
		}
		body = validation.data;
	}

	const providedSecret = body.secretKey || req.headers.get('x-webhook-secret');
	if (process.env.NODE_ENV === 'production' && providedSecret !== WEBHOOK_SECRET) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Invalid webhook secret');
	}

	const playlistId = body.playlistId || AAG_YOUTUBE_PLAYLIST_ID;
	if (!playlistId?.trim()) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'No playlist ID available');
	}

	if (body.dryRun) {
		return NextResponse.json(
			{
				success: true,
				message: 'Dry run completed successfully',
				data: {
					newVideos: 0,
					updatedVideos: 0,
					errors: [],
					processed: 0,
					timestamp,
					playlistId,
					duration: Date.now() - startTime
				}
			},
			{ status: StatusCodes.OK }
		);
	}

	const result = await AAGIndexingService.CheckForNewVideos(playlistId);

	const endTime = Date.now();
	const duration = endTime - startTime;

	const response: DailyWebhookResponse = {
		success: true,
		message: `Daily video check completed: ${result.newVideos} new videos, ${result.updatedVideos} updated videos`,
		data: {
			newVideos: result.newVideos,
			updatedVideos: result.updatedVideos,
			errors: [],
			processed: result.newVideos + result.updatedVideos,
			timestamp,
			playlistId,
			duration
		}
	};

	if (result.newVideos > 0 || result.updatedVideos > 0) {
		console.log('📢 AAG indexing summary:', JSON.stringify(response.data, null, 2));
	} else {
		console.log('😴 No new videos or updates found');
	}

	return NextResponse.json(response);
});

export const GET = withErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
	const { searchParams } = new URL(req.url);
	const dryRun = searchParams.get('dry_run') === 'true';
	const playlistId = searchParams.get('playlist_id');
	const secretKey = searchParams.get('secret') || req.headers.get('x-webhook-secret');

	const requestBody: DailyWebhookRequest = {
		dryRun,
		...(playlistId && { playlistId }),
		...(secretKey && { secretKey })
	};

	const postRequest = new Request(req.url, {
		method: 'POST',
		body: JSON.stringify(requestBody),
		headers: {
			'Content-Type': 'application/json',
			...(secretKey && { 'x-webhook-secret': secretKey })
		}
	});

	return POST(postRequest as NextRequest);
});
