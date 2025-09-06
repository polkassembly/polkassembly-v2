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
import { ENotificationChannel } from '@/_shared/types';

interface IRouteParams {
	params: Promise<{
		id: string;
	}>;
}

export const POST = withErrorHandling(async (request: NextRequest, { params }: IRouteParams): Promise<NextResponse> => {
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

	const { channel } = (await request.json()) as { channel: ENotificationChannel };

	if (!channel || !Object.values(ENotificationChannel).includes(channel)) {
		throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid notification channel');
	}

	const token = await NotificationPreferencesService.GenerateVerificationToken(userId, channel);

	return NextResponse.json({
		data: { token },
		message: 'Verification token generated successfully'
	});
});
