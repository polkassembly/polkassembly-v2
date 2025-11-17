// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import { VideoIndexingService } from '@/app/api/_api-services/video_indexing_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { AAG_YOUTUBE_PLAYLIST_ID } from '@/hooks/useYouTubeData';

/**
 * Daily webhook endpoint for checking and indexing new videos
 * This endpoint is designed to be called once per day to:
 * 1. Check for new videos in the AAG playlist
 * 2. Update metadata for existing videos (view counts, etc.)
 * 3. Index any new videos found
 *
 * This can be triggered by:
 * - GitHub Actions cron job
 * - Vercel cron function
 * - External monitoring service
 * - Manual API call
 */

interface DailyWebhookRequest {
	secretKey?: string; // Optional secret for security
	playlistId?: string; // Override default playlist
	dryRun?: boolean; // For testing without actual indexing
	maxVideos?: number; // Limit processing for testing
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
		duration: number; // in milliseconds
	};
}

// Simple webhook secret validation (can be enhanced with proper JWT tokens)
const WEBHOOK_SECRET = process.env.VIDEO_INDEXING_WEBHOOK_SECRET || 'polkassembly-video-indexing-2024';

export async function POST(request: NextRequest): Promise<NextResponse<DailyWebhookResponse>> {
	const startTime = Date.now();
	const timestamp = new Date().toISOString();

	try {
		// Parse request body
		let body: DailyWebhookRequest = {};
		try {
			body = await request.json();
		} catch {
			// Allow empty body for simple GET-like calls
			body = {};
		}

		// Basic security check
		const providedSecret = body.secretKey || request.headers.get('x-webhook-secret');
		if (process.env.NODE_ENV === 'production' && providedSecret !== WEBHOOK_SECRET) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Invalid webhook secret');
		}

		const playlistId = body.playlistId || AAG_YOUTUBE_PLAYLIST_ID;
		if (!playlistId?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'No playlist ID available');
		}

		console.log(`🎬 Daily video indexing webhook started at ${timestamp}`);
		console.log(`📺 Processing playlist: ${playlistId}`);
		console.log(`🔄 Dry run mode: ${body.dryRun || false}`);

		if (body.dryRun) {
			// Dry run mode - just simulate the process
			console.log('🔍 DRY RUN MODE - Simulating video check process...');

			const mockResponse: DailyWebhookResponse = {
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
			};

			return NextResponse.json(mockResponse, { status: StatusCodes.OK });
		}

		// Check for new and updated videos
		const result = await VideoIndexingService.CheckForNewVideos(playlistId);

		const endTime = Date.now();
		const duration = endTime - startTime;

		console.log(`✅ Daily video indexing completed in ${duration}ms`);
		console.log(`📊 Results: ${result.newVideos} new, ${result.updatedVideos} updated`);

		const response: DailyWebhookResponse = {
			success: true,
			message: `Daily video check completed: ${result.newVideos} new videos, ${result.updatedVideos} updated videos`,
			data: {
				newVideos: result.newVideos,
				updatedVideos: result.updatedVideos,
				errors: [], // TODO: Collect errors from the indexing process
				processed: result.newVideos + result.updatedVideos,
				timestamp,
				playlistId,
				duration
			}
		};

		// Log results for monitoring
		if (result.newVideos > 0 || result.updatedVideos > 0) {
			console.log('📢 Video indexing summary:', JSON.stringify(response.data, null, 2));
		} else {
			console.log('😴 No new videos or updates found');
		}

		return NextResponse.json(response, { status: StatusCodes.OK });
	} catch (error) {
		const endTime = Date.now();
		const duration = endTime - startTime;

		console.error('❌ Daily video indexing webhook failed:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		const statusCode = error instanceof APIError ? error.status : StatusCodes.INTERNAL_SERVER_ERROR;

		const errorResponse: DailyWebhookResponse = {
			success: false,
			message: `Daily video indexing failed: ${errorMessage}`,
			data: {
				newVideos: 0,
				updatedVideos: 0,
				errors: [errorMessage],
				processed: 0,
				timestamp,
				playlistId: 'unknown',
				duration
			}
		};

		return NextResponse.json(errorResponse, { status: statusCode });
	}
}

// Also support GET requests for simple health checks and manual triggering
export async function GET(request: NextRequest): Promise<NextResponse> {
	try {
		const { searchParams } = new URL(request.url);
		const dryRun = searchParams.get('dry_run') === 'true';
		const playlistId = searchParams.get('playlist_id');
		const secretKey = searchParams.get('secret') || request.headers.get('x-webhook-secret');

		// Convert GET params to POST body format
		const mockBody: DailyWebhookRequest = {
			dryRun,
			...(playlistId && { playlistId }),
			...(secretKey && { secretKey })
		};

		// Create a mock request to reuse POST logic
		const mockRequest = new Request(request.url, {
			method: 'POST',
			body: JSON.stringify(mockBody),
			headers: {
				'Content-Type': 'application/json',
				...(secretKey && { 'x-webhook-secret': secretKey })
			}
		});

		return POST(mockRequest as NextRequest);
	} catch (error) {
		console.error('GET webhook error:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Webhook GET request failed',
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: StatusCodes.INTERNAL_SERVER_ERROR }
		);
	}
}

/**
 * Health check endpoint to verify webhook is operational
 * GET /api/v2/video-indexing/daily-webhook?health=true
 */
export async function HEAD(): Promise<NextResponse> {
	return NextResponse.json(
		{
			status: 'healthy',
			service: 'video-indexing-webhook',
			timestamp: new Date().toISOString(),
			version: '1.0.0'
		},
		{ status: StatusCodes.OK }
	);
}
