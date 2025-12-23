// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse } from 'next/server';
import { NEWS_GOOGLE_SHEET_ID, TREASURY_REPORT_GOOGLE_SHEET_NAME, GOOGLE_API_KEY } from '@/app/api/_api-constants/apiEnvVars';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { GoogleSheetService } from '../../../_api-services/external_api_service/googlesheets_service';

interface IRawTreasuryReport {
	Title?: string;
	Description?: string;
	Link?: string;
	[key: string]: string | undefined;
}

export const GET = withErrorHandling(async () => {
	if (!GOOGLE_API_KEY || !NEWS_GOOGLE_SHEET_ID || !TREASURY_REPORT_GOOGLE_SHEET_NAME) {
		return NextResponse.json([]);
	}

	const sheetId = NEWS_GOOGLE_SHEET_ID;
	const sheetName = TREASURY_REPORT_GOOGLE_SHEET_NAME || '';
	const reportItems = await GoogleSheetService.fetchSheetData(sheetId, sheetName);

	const normalizedItems = Array.isArray(reportItems)
		? reportItems.map((item) => {
				const typedItem = item as IRawTreasuryReport;
				return {
					title: typedItem.Title || '',
					description: typedItem.Description || '',
					redirectLink: typedItem.Link || ''
				};
			})
		: [];

	return NextResponse.json(normalizedItems);
});
