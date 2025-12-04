// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { APIError } from '@/app/api/_api-utils/apiError';
import { StatusCodes } from 'http-status-codes';
import { KlaraDatabaseService } from '@/app/api/_api-services/klara/database';

export async function GET() {
	try {
		const { totalUsers, totalConversations } = await KlaraDatabaseService.GetStats();

		return NextResponse.json({
			totalUsers,
			totalConversations
		});
	} catch (error) {
		console.error('Error fetching Klara stats:', error);
		throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching Klara stats');
	}
}
