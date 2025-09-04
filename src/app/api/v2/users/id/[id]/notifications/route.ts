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

interface IRouteParams {
	params: Promise<{
		id: string;
	}>;
}

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

	response.headers.set('Cache-Control', 'private, max-age=600, must-revalidate');
	response.headers.set('ETag', `"${userId}-${Date.now()}"`);

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

	const body = (await request.json()) as IUpdateNotificationPreferencesRequest | { updates: Array<{ section: string; key: string; value: unknown }> };

	if ('updates' in body && Array.isArray(body.updates)) {
		const updatedPreferences = await NotificationPreferencesService.BulkUpdateMultipleSections(userId, body.updates);
		return NextResponse.json({
			data: updatedPreferences,
			message: 'Notification preferences updated successfully'
		});
	}

	const { section, key, value, network } = body as IUpdateNotificationPreferencesRequest;

	if (!section || !key || value === undefined) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Missing required parameters');
	}

	const updatedPreferences = await NotificationPreferencesService.UpdateUserNotificationPreferences(userId, section, key, value, network);

	return NextResponse.json({
		data: updatedPreferences,
		message: 'Notification preferences updated successfully'
	});
});
