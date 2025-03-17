// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ECookieNames, ESocial, ENotificationChannel } from '@/_shared/types';
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

const socialLinkSchema = z
	.object({
		platform: z.nativeEnum(ESocial),
		url: z.string()
	})
	.superRefine((data, ctx) => {
		if (data.platform === ESocial.EMAIL) {
			if (!z.string().email().safeParse(data.url).success) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Invalid email for platform EMAIL'
				});
			}
		} else if (!z.string().url().safeParse(data.url).success) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Invalid URL for platform'
			});
		}
	});

const zodEditSchema = z
	.object({
		publicSocialLinks: z.array(socialLinkSchema).optional(),
		email: z.string().email().optional(),
		username: z
			.string()
			.refine((val) => ValidatorService.isValidUsername(val), {
				message: 'Invalid username'
			})
			.optional(),
		bio: z.string().min(3).optional(),
		badges: z.array(z.string().min(1)).min(1).optional(),
		title: z.string().min(1).optional(),
		image: z.string().url().optional(),
		coverImage: z.string().url().optional(),
		notificationPreferences: z
			.object({
				channelPreferences: z.record(
					z.object({
						name: z.nativeEnum(ENotificationChannel),
						enabled: z.boolean(),
						handle: z.string(),
						verified: z.boolean(),
						verification_token: z.string().optional()
					})
				),
				triggerPreferences: z.record(
					z.record(
						z.object({
							name: z.string(),
							enabled: z.boolean()
						})
					)
				)
			})
			.optional()
	})
	.refine(
		(data) =>
			Object.values(data).some((value) => {
				if (Array.isArray(value)) {
					return value.length > 0;
				}
				return value !== undefined && value !== '';
			}),
		{
			message: 'At least one valid field must be provided'
		}
	);

export const GET = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	const user = await OffChainDbService.GetPublicUserById(id);

	if (!user) {
		throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
	}

	return NextResponse.json(user);
});

// update user details
export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
	const { id } = zodParamsSchema.parse(await params);

	let { newAccessToken, newRefreshToken } = await AuthService.ValidateAuthAndRefreshTokens();

	const loggedInUserId = AuthService.GetUserIdFromAccessToken(newAccessToken);

	if (loggedInUserId !== id) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN);
	}

	const { bio, badges, title, image, coverImage, publicSocialLinks, email, username, notificationPreferences } = zodEditSchema.parse(await getReqBody(req));

	// Update profile details
	await OffChainDbService.UpdateUserProfile({
		userId: loggedInUserId,
		newProfileDetails: {
			bio,
			badges,
			title,
			image,
			coverImage,
			...(publicSocialLinks?.length ? { publicSocialLinks } : {})
		},
		notificationPreferences
	});

	if (email) {
		const result = await AuthService.UpdateUserEmail({ accessToken: newAccessToken, email });
		newAccessToken = result.newAccessToken;
		newRefreshToken = result.newRefreshToken;
	}

	if (username) {
		const result = await AuthService.UpdateUserUsername({ accessToken: newAccessToken, username });
		newAccessToken = result.newAccessToken;
		newRefreshToken = result.newRefreshToken;
	}

	const response = NextResponse.json({ message: 'User profile updated successfully' });
	response.headers.append('Set-Cookie', await AuthService.GetAccessTokenCookie(newAccessToken));
	response.headers.append('Set-Cookie', await AuthService.GetRefreshTokenCookie(newRefreshToken));

	return response;
});

// delete account
export const DELETE = withErrorHandling(async (): Promise<NextResponse> => {
	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();

	await AuthService.DeleteUser(newAccessToken);

	// send response with cleared cookies
	const response = NextResponse.json({ message: 'Account deleted successfully' });
	response.cookies.delete(ECookieNames.ACCESS_TOKEN);
	response.cookies.delete(ECookieNames.REFRESH_TOKEN);

	return response;
});
