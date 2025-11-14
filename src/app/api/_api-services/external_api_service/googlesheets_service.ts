// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GOOGLE_API_KEY } from '../../_api-constants/apiEnvVars';

export class GoogleSheetService {
	static async fetchSheetData(sheetId: string, sheetName: string): Promise<Record<string, string>[] | string[][]> {
		try {
			if (!GOOGLE_API_KEY) {
				throw new Error('Google Sheets API key not configured');
			}

			if (!sheetId || !sheetName) {
				throw new Error('Sheet ID and Sheet Name are required');
			}

			const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${GOOGLE_API_KEY}`;

			const response = await fetch(url, { next: { revalidate: 300 } });
			if (!response.ok) {
				throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
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
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error('Error fetching Google Sheet data:', error);
			throw new Error(`Error fetching Google Sheet data: ${message}`);
		}
	}
}
