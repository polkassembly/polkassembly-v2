// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/app/api/_api-services/external_api_service/news_api_service';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = request.nextUrl;
		const sheetId = searchParams.get('sheetId') || '';
		const sheetName = searchParams.get('sheetName') || '';

		const newsItems = await NewsService.fetchActiveNews(sheetId, sheetName);

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
}
