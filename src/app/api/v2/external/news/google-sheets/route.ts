// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { NEWS_GOOGLE_SHEET_ID, NEWS_GOOGLE_SHEET_NAME } from '@/app/api/_api-constants/apiEnvVars';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { GoogleSheetService } from '../../../../_api-services/external_api_service/googlesheets_service';

export const GET = withErrorHandling(async () => {
	try {
		const sheetId = NEWS_GOOGLE_SHEET_ID;
		const sheetName = NEWS_GOOGLE_SHEET_NAME;
		const newsItems = await GoogleSheetService.fetchSheetData(sheetId, sheetName);

		return NextResponse.json(
			{
				success: true,
				data: newsItems
			},
			{
				headers: {
					'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
				}
			}
		);
	} catch {
		return NextResponse.json({
			status: 500,
			success: false,
			error: ERROR_CODES.API_FETCH_ERROR,
			data: []
		});
	}
});
