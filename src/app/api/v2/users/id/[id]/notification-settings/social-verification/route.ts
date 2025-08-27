// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ENotificationChannel } from '@/_shared/types';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { NotificationService } from '@/app/api/_api-services/notification_service';
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

const zodGenerateTokenSchema = z.object({
	channel: z
		.nativeEnum(ENotificationChannel)
		.refine((val) => [ENotificationChannel.TELEGRAM, ENotificationChannel.DISCORD, ENotificationChannel.SLACK].includes(val), 'Channel must be telegram, discord, or slack')
});

const zodVerifyTokenSchema = z.object({
	channel: z.nativeEnum(ENotificationChannel),
	token: z.string().min(1),
	handle: z.string().min(1)
});

function getVerificationInstructions(channel: ENotificationChannel, username: string, token: string) {
	switch (channel) {
		case ENotificationChannel.TELEGRAM:
			return {
				platform: 'Telegram',
				steps: [
					'1. Click this invite link: https://t.me/PolkassemblyBot',
					'2. Add @PolkassemblyBot to your Telegram chat as a member',
					`3. Send this command to the chat with the bot: /verify ${username} ${token}`
				],
				botHandle: '@PolkassemblyBot',
				command: `/verify ${username} ${token}`
			};

		case ENotificationChannel.DISCORD:
			return {
				platform: 'Discord',
				steps: [
					'1. Click this invite link: https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID',
					'2. Add the Polkassembly bot to your Discord server',
					`3. Send this command to the chat with the bot: !verify ${username} ${token}`
				],
				botHandle: 'PolkassemblyBot',
				command: `!verify ${username} ${token}`
			};

		case ENotificationChannel.SLACK:
			return {
				platform: 'Slack',
				steps: [
					'1. Click this to get invite link: [Contact admin for Slack integration]',
					'2. Add the Polkassembly bot to your Slack workspace',
					`3. Send this command to the chat with the bot: /polkassembly-add ${username} ${token}`
				],
				botHandle: 'PolkassemblyBot',
				command: `/polkassembly-add ${username} ${token}`
			};

		default:
			return {
				platform: channel,
				steps: ['Verification not supported for this platform'],
				command: ''
			};
	}
}

export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);
	const { channel } = zodGenerateTokenSchema.parse(await getReqBody(req));

	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== id) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN);
	}

	const user = await OffChainDbService.GetUserById(id);
	if (!user) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'User not found');
	}

	const verificationToken = await NotificationService.GetChannelVerifyToken({
		channel: channel.toUpperCase(),
		userId: user.id.toString()
	});

	const currentPreferences = user.notificationPreferences || {
		channelPreferences: {},
		triggerPreferences: {}
	};

	const channelPreference = {
		name: channel,
		enabled: false,
		handle: '',
		verified: false
	};

	const updatedPreferences = {
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

	const instructions = getVerificationInstructions(channel, user.username, verificationToken);

	return NextResponse.json({
		verificationToken,
		instructions,
		expiresIn: '24 hours'
	});
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);
	const { channel, token, handle } = zodVerifyTokenSchema.parse(await getReqBody(req));

	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== id) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN);
	}

	const user = await OffChainDbService.GetUserById(id);
	if (!user) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'User not found');
	}

	const currentPreferences = user.notificationPreferences || {
		channelPreferences: {},
		triggerPreferences: {}
	};

	const isVerified = await NotificationService.VerifyChannelToken({
		channel: channel.toUpperCase(),
		userId: user.id.toString(),
		handle,
		token
	});

	if (!isVerified) {
		throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid or expired verification token');
	}

	const existingChannelPref = currentPreferences.channelPreferences?.[channel];
	const updatedChannelPreference = {
		...existingChannelPref,
		name: channel,
		enabled: true,
		verified: true,
		handle
	};

	const updatedPreferences = {
		...currentPreferences,
		channelPreferences: {
			...currentPreferences.channelPreferences,
			[channel]: updatedChannelPreference
		}
	};

	await OffChainDbService.UpdateUserProfile({
		userId: id,
		newProfileDetails: {},
		notificationPreferences: updatedPreferences
	});

	return NextResponse.json({
		message: `${channel} successfully verified and enabled`,
		channel,
		handle,
		verified: true
	});
});
