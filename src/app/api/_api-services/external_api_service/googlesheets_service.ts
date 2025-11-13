// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GOOGLE_API_KEY } from '../../_api-constants/apiEnvVars';

export class GoogleSheetService {
	private static GOOGLE_SHEET_API_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

	static extractSheetId(url: string): string | null {
		const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
		return match ? match[1] : null;
	}

	static extractGid(url: string): string | null {
		const match = url.match(/[#&]gid=(\d+)/);
		return match ? match[1] : null;
	}

	static async getSheetMetadata(sheetId: string): Promise<{
		sheets: Array<{ properties: { sheetId: number; title: string } }>;
	} | null> {
		try {
			if (!GOOGLE_API_KEY) {
				throw new Error('Google Sheets API key not configured');
			}

			if (!sheetId) {
				throw new Error('Sheet ID is required');
			}

			const url = `${this.GOOGLE_SHEET_API_BASE_URL}/${sheetId}?key=${GOOGLE_API_KEY}`;
			const response = await fetch(url, { next: { revalidate: 300 } });

			if (!response.ok) {
				console.warn('Failed to fetch sheet metadata:', response.statusText);
				return null;
			}

			return await response.json();
		} catch (error) {
			console.error('Error fetching Google Sheet metadata:', error);
			return null;
		}
	}

	static async getSheetNameFromGid(sheetId: string, gid: string): Promise<string> {
		const metadata = await this.getSheetMetadata(sheetId);
		if (metadata?.sheets) {
			const sheet = metadata.sheets.find((s) => s.properties.sheetId === parseInt(gid, 10));
			if (sheet?.properties?.title) {
				return sheet.properties.title;
			}
		}
		return 'Sheet1';
	}

	static async fetchSheetData(sheetId: string, sheetName: string): Promise<Record<string, string>[] | string[][]> {
		try {
			if (!GOOGLE_API_KEY) {
				throw new Error('Google Sheets API key not configured');
			}

			if (!sheetId || !sheetName) {
				throw new Error('Sheet ID and Sheet Name are required');
			}

			const url = `${this.GOOGLE_SHEET_API_BASE_URL}/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${GOOGLE_API_KEY}`;

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
						const sanitizedKey = String(key).trim();
						if (sanitizedKey) {
							obj[sanitizedKey] = row[i]?.trim() || '';
						}
					});
					return obj;
				});
			}

			return rows;
		} catch (error) {
			throw new Error(`Error fetching Google Sheet data: ${error}`);
		}
	}
}
