// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ECustomNotificationFilters } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

const zodQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
	filterBy: z.nativeEnum(ECustomNotificationFilters).optional().default(ECustomNotificationFilters.ALL)
});

const zodMarkAsReadSchema = z
	.object({
		notificationId: z.string().optional(),
		markAllAsRead: z.boolean().optional()
	})
	.refine((data) => (data.notificationId && !data.markAllAsRead) || (!data.notificationId && data.markAllAsRead), {
		message: 'Either notificationId or markAllAsRead must be provided, but not both'
	});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);
	const { searchParams } = new URL(req.url);
	const { page, limit } = zodQuerySchema.parse({
		page: searchParams.get('page'),
		limit: searchParams.get('limit'),
		filterBy: searchParams.get('filterBy')
	});

	const network = await getNetworkFromHeaders();
	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== id) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN);
	}

	const notifications = await OffChainDbService.GetNotificationsByUserId({
		userId: id,
		network,
		page,
		limit
	});

	return NextResponse.json({
		notifications,
		pagination: {
			page,
			limit,
			hasMore: notifications.length === limit
		}
	});
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);
	const { notificationId, markAllAsRead } = zodMarkAsReadSchema.parse(await getReqBody(req));

	const network = await getNetworkFromHeaders();
	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== id) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN);
	}

	if (markAllAsRead) {
		await OffChainDbService.MarkAllNotificationsAsRead({ userId: id, network });
		return NextResponse.json({ message: 'All notifications marked as read' });
	}

	if (notificationId) {
		await OffChainDbService.MarkNotificationAsRead(notificationId);
		return NextResponse.json({ message: 'Notification marked as read' });
	}

	throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid request');
});
