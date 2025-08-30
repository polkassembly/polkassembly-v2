// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ENotificationChannel, IUserNotificationSettings, ENetwork } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const zodParamsSchema = z.object({
	id: z.coerce.number().refine((val) => ValidatorService.isValidUserId(val), 'Invalid user ID')
});

const USER_NOT_FOUND = 'User not found';

const zodChannelPreferencesSchema = z.object({
	channel: z.nativeEnum(ENotificationChannel),
	enabled: z.boolean(),
	handle: z.string().optional()
});

const zodTriggerPreferencesSchema = z.object({
	networks: z.array(z.nativeEnum(ENetwork)),
	triggerPreferences: z.record(
		z.object({
			name: z.string(),
			enabled: z.boolean(),
			post_types: z.array(z.string()).optional(),
			tracks: z.array(z.number()).optional(),
			sub_triggers: z.array(z.string()).optional(),
			mention_types: z.array(z.string()).optional(),
			pip_types: z.array(z.string()).optional()
		})
	)
});

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== id) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN);
	}

	const user = await OffChainDbService.GetUserById(id);
	if (!user) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND);
	}

	return NextResponse.json({
		notificationPreferences: user.notificationPreferences || {
			channelPreferences: {},
			triggerPreferences: {}
		}
	});
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);
	const { channel, enabled, handle } = zodChannelPreferencesSchema.parse(await getReqBody(req));

	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== id) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN);
	}

	const user = await OffChainDbService.GetUserById(id);
	if (!user) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND);
	}

	const currentPreferences = user.notificationPreferences || {
		channelPreferences: {},
		triggerPreferences: {}
	};

	const existingChannelPref = currentPreferences.channelPreferences?.[channel];
	let channelPreference = {
		name: channel,
		enabled,
		handle: handle || user.username || '',
		verified: existingChannelPref?.verified ?? false
	};

	if (channel === ENotificationChannel.IN_APP) {
		channelPreference = {
			...channelPreference,
			handle: user.id.toString(),
			verified: enabled
		};
	}

	const updatedPreferences: IUserNotificationSettings = {
		...currentPreferences,
		channelPreferences: {
			...currentPreferences.channelPreferences,
			[channel]: channelPreference
		}
	};

	await OffChainDbService.UpdateUserProfile({
		userId: id,
		newProfileDetails: {},
		notificationPreferences: updatedPreferences
	});

	return NextResponse.json({
		message: `${channel} notifications ${enabled ? 'enabled' : 'disabled'}`,
		channelPreferences: updatedPreferences.channelPreferences
	});
});

export const PUT = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);
	const { networks, triggerPreferences } = zodTriggerPreferencesSchema.parse(await getReqBody(req));

	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== id) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN);
	}

	const user = await OffChainDbService.GetUserById(id);
	if (!user) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, USER_NOT_FOUND);
	}

	const currentPreferences = user.notificationPreferences || {
		channelPreferences: {},
		triggerPreferences: {}
	};

	type TriggerPreferencesType = z.infer<typeof zodTriggerPreferencesSchema>['triggerPreferences'];

	const networkTriggerPreferences: Record<string, TriggerPreferencesType> = {};
	networks.forEach((network) => {
		networkTriggerPreferences[network] = triggerPreferences;
	});

	const updatedPreferences: IUserNotificationSettings = {
		...currentPreferences,
		triggerPreferences: {
			...currentPreferences.triggerPreferences,
			...networkTriggerPreferences
		}
	};

	await OffChainDbService.UpdateUserProfile({
		userId: id,
		newProfileDetails: {},
		notificationPreferences: updatedPreferences
	});

	return NextResponse.json({
		message: 'Trigger preferences updated successfully',
		triggerPreferences: updatedPreferences.triggerPreferences
	});
});
