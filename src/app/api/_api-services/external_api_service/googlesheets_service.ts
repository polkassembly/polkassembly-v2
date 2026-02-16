// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { APIError } from '../../_api-utils/apiError';
import { ERROR_CODES } from '../../../../_shared/_constants/errorLiterals';
import { GOOGLE_API_KEY } from '../../_api-constants/apiEnvVars';

export class GoogleSheetService {
	private static GOOGLE_SHEET_API_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

	static isConfigured(): boolean {
		return Boolean(GOOGLE_API_KEY?.trim());
	}

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
				console.warn('Google Sheets: API key not configured, skipping sheet metadata fetch');
				return null;
			}

			if (!sheetId) {
				console.warn('Google Sheets: Sheet ID is required');
				return null;
			}

			const url = `${this.GOOGLE_SHEET_API_BASE_URL}/${sheetId}?key=${GOOGLE_API_KEY}`;
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000);

			try {
				const response = await fetch(url, {
					next: { revalidate: 300 },
					signal: controller.signal
				});
				clearTimeout(timeoutId);

				if (!response.ok) {
					if (response.status === 403) {
						console.warn('Google Sheets: Access forbidden - check API key permissions and ensure Google Sheets API is enabled');
					} else {
						console.warn('Google Sheets: Failed to fetch sheet metadata:', response.statusText);
					}
					return null;
				}

				return await response.json();
			} catch (fetchError) {
				clearTimeout(timeoutId);
				throw fetchError;
			}
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				console.warn('Google Sheets: Metadata fetch timeout');
			} else {
				console.error('Error fetching Google Sheet metadata:', error);
			}
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
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Google Sheets API key not configured');
			}

			if (!sheetId || !sheetName) {
				throw new APIError(ERROR_CODES.MISSING_REQUIRED_FIELDS, StatusCodes.BAD_REQUEST, 'Sheet ID and Sheet Name are required');
			}

			const url = `${this.GOOGLE_SHEET_API_BASE_URL}/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${GOOGLE_API_KEY}`;

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000);

			try {
				const response = await fetch(url, {
					next: { revalidate: 300 },
					signal: controller.signal
				});
				clearTimeout(timeoutId);

				if (!response.ok) {
					if (response.status === 403) {
						throw new APIError(
							ERROR_CODES.API_FETCH_ERROR,
							StatusCodes.FORBIDDEN,
							'Google Sheets access forbidden - check API key permissions and ensure Google Sheets API is enabled'
						);
					}
					throw new APIError(ERROR_CODES.API_FETCH_ERROR, response.status as StatusCodes, `Failed to fetch sheet data: ${response.statusText}`);
				}

				const data = await response.json();
				const rows = data.values || [];

				if (rows.length === 0) return [];

				const headers = rows[0];
				const hasHeaders = headers.every((h: string) => typeof h === 'string' && h.trim().length > 0);

				const nonEmptyHeaders = headers.filter((h: string) => h && h.trim().length > 0);
				const isValidHeaderRow = hasHeaders && headers.length > 1 && nonEmptyHeaders.length > 1;

				if (isValidHeaderRow) {
					return rows.slice(1).map((row: string[]) => {
						return (headers as string[]).reduce(
							(acc: Record<string, string>, key: string, i: number) => {
								const sanitizedKey = String(key).trim();
								const isDangerous = sanitizedKey.startsWith('__') || sanitizedKey === 'constructor' || sanitizedKey === 'prototype' || sanitizedKey.includes('__proto__');

								if (sanitizedKey && !isDangerous) {
									const rawValue = i < row.length ? row[i] : '';
									const value = rawValue ? String(rawValue).trim() : '';
									return { ...acc, [sanitizedKey]: value };
								}
								return acc;
							},
							{} as Record<string, string>
						);
					});
				}

				return rows;
			} catch (err) {
				clearTimeout(timeoutId);

				if (err instanceof Error && err.name === 'AbortError') {
					throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.REQUEST_TIMEOUT, 'Google Sheets data fetch timeout');
				}
				throw err;
			}
		} catch (error) {
			if (error instanceof APIError) {
				throw error;
			}

			const message = error instanceof Error ? error.message : String(error);
			console.error('Error fetching Google Sheet data:', error);
			throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, `Error fetching Google Sheet data: ${message}`);
		}
	}
}
