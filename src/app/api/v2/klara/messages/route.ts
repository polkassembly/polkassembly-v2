// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextRequest, NextResponse } from 'next/server';
import { KlaraDatabaseService } from '@/app/api/_api-services/klara/database';
import { z } from 'zod';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';

export const GET = withErrorHandling(async (request: NextRequest) => {
	const zodQuerySchema = z.object({
		conversationId: z.string()
	});

	const { conversationId } = zodQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));

	// Validate auth and get user from access token
	const { newAccessToken } = await AuthService.ValidateAuthAndRefreshTokens();
	const user = await AuthService.GetUserWithAccessToken(newAccessToken);

	if (!user || !ValidatorService.isValidUserId(user.id)) {
		throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'User not found');
	}

	// Verify the requesting user owns the conversation
	const owns = await KlaraDatabaseService.verifyConversationOwnership(conversationId, user.id.toString());
	if (!owns) {
		throw new APIError(ERROR_CODES.FORBIDDEN, StatusCodes.FORBIDDEN, 'Unauthorized conversation access');
	}

	const messages = await KlaraDatabaseService.GetConversationMessages(conversationId);
	return NextResponse.json(messages);
});
