// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { APIError } from '../../_api-utils/apiError';
import { ERROR_CODES } from '../../../../_shared/_constants/errorLiterals';
import { GOOGLE_API_KEY } from '../../_api-constants/apiEnvVars';

export class GoogleSheetService {
	static async fetchSheetData(sheetId: string, sheetName: string): Promise<Record<string, string>[] | string[][]> {
		try {
			if (!GOOGLE_API_KEY) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Google Sheets API key not configured');
			}

			if (!sheetId || !sheetName) {
				throw new APIError(ERROR_CODES.MISSING_REQUIRED_FIELDS, StatusCodes.BAD_REQUEST, 'Sheet ID and Sheet Name are required');
			}

			const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(sheetName)}?key=${encodeURIComponent(GOOGLE_API_KEY)}`;

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000);

			try {
				const response = await fetch(url, {
					next: { revalidate: 300 },
					signal: controller.signal
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					throw new APIError(ERROR_CODES.API_FETCH_ERROR, response.status as StatusCodes, `Failed to fetch sheet data: ${response.statusText}`);
				}

				const data = await response.json();
				const rows = data.values || [];

				if (rows.length === 0) return [];

				const headers = rows[0];
				const hasHeaders = headers.every((h: string) => typeof h === 'string' && h.trim().length > 0);

				if (hasHeaders) {
					return rows.slice(1).map((row: string[]) => {
						const obj: Record<string, string> = {};
						headers.forEach((key: string, i: number) => {
							obj[key.trim()] = row[i]?.trim() || '';
						});
						return obj;
					});
				}

				return rows;
			} catch (err) {
				clearTimeout(timeoutId);

				if (err instanceof Error && err.name === 'AbortError') {
					throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.REQUEST_TIMEOUT, 'Request to Google Sheets timed out');
				}
				throw err;
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error('Error fetching Google Sheet data:', error);
			throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, `Error fetching Google Sheet data: ${message}`);
		}
	}
}
