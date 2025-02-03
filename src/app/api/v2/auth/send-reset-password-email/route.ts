// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';

import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { z } from 'zod';
import { getReqBody } from '@/app/api/_api-utils/getReqBody';
import { AuthService } from '@/app/api/_api-services/auth_service';
import { ECookieNames } from '@/_shared/types';

export const POST = withErrorHandling(async (req: NextRequest) => {
	const zodBodySchema = z.object({
		email: z.string().email()
	});

	const { email } = zodBodySchema.parse(await getReqBody(req));

	await AuthService.SendResetPasswordEmail(email);

	// send response with cleared cookies
	const response = NextResponse.json({ message: 'Reset password email sent successfully' });
	response.cookies.delete(ECookieNames.ACCESS_TOKEN);
	response.cookies.delete(ECookieNames.REFRESH_TOKEN);
	return response;
});
