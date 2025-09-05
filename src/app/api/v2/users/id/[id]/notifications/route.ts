// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@api/_api-utils/withErrorHandling';
import { APIError } from '@api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '@api/_api-services/auth_service';
import { NotificationPreferencesService } from '@api/_api-services/notification_preferences_service';
import { IUpdateNotificationPreferencesRequest } from '@/_shared/types';
import { getNetworkFromHeaders } from '@api/_api-utils/getNetworkFromHeaders';
import { z } from 'zod';

interface IRouteParams {
	params: Promise<{
		id: string;
	}>;
}

const UpdateSchema = z.union([
	z.object({
		updates: z.array(
			z.object({
				section: z.string(),
				key: z.string(),
				value: z.unknown(),
				network: z.string().optional()
			})
		)
	}),
	z.object({
		section: z.string(),
		key: z.string(),
		value: z.unknown(),
		network: z.string().optional()
	})
]);

export const GET = withErrorHandling(async (request: NextRequest, { params }: IRouteParams): Promise<NextResponse> => {
	const { id } = await params;
	const userId = parseInt(id, 10);

	if (isNaN(userId)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid user ID');
	}

	const network = await getNetworkFromHeaders();

	const url = new URL(request.url);
	const getAllNetworks = url.searchParams.get('allNetworks') === 'true';

	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== userId) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN, 'Unauthorized access');
	}

	const preferences = await NotificationPreferencesService.GetUserNotificationPreferences(userId, getAllNetworks ? undefined : network);

	const response = NextResponse.json({
		data: preferences,
		message: 'Notification preferences retrieved successfully',
		network,
		allNetworks: getAllNetworks
	});

	const etagContent = JSON.stringify(preferences);
	const etag = `"${userId}-${Buffer.from(etagContent).toString('base64').substring(0, 20)}"`;

	response.headers.set('Cache-Control', 'private, max-age=0, must-revalidate');
	response.headers.set('ETag', etag);

	return response;
});

export const PUT = withErrorHandling(async (request: NextRequest, { params }: IRouteParams): Promise<NextResponse> => {
	const { id } = await params;
	const userId = parseInt(id, 10);

	if (isNaN(userId)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid user ID');
	}

	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== userId) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN, 'Unauthorized access');
	}

	const body = UpdateSchema.parse(await request.json());

	if ('updates' in body && Array.isArray(body.updates)) {
		const updates = body.updates as Array<IUpdateNotificationPreferencesRequest>;
		const updatedPreferences = await NotificationPreferencesService.BulkUpdateMultipleSections(userId, updates);
		return NextResponse.json({
			data: updatedPreferences,
			message: 'Notification preferences updated successfully'
		});
	}

	const updateRequest = body as IUpdateNotificationPreferencesRequest;

	if (!updateRequest.section || !updateRequest.key || updateRequest.value === undefined) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Missing required parameters');
	}

	const updatedPreferences = await NotificationPreferencesService.UpdateUserNotificationPreferences(userId, updateRequest);

	return NextResponse.json({
		data: updatedPreferences,
		message: 'Notification preferences updated successfully'
	});
});
