// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { INewsItem } from '@/_shared/types';
import { GOOGLE_API_KEY } from '../../_api-constants/apiEnvVars';

export class NewsService {
	static async fetchActiveNews(sheetId: string, sheetName: string): Promise<INewsItem[]> {
		try {
			if (!GOOGLE_API_KEY) {
				throw new Error('Google Sheets API key not configured');
			}

			if (!sheetId || !sheetName) {
				throw new Error('Sheet ID and Sheet Name are required');
			}

			const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${GOOGLE_API_KEY}`;

			const response = await fetch(url, {
				next: { revalidate: 300 }
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch news: ${response.statusText}`);
			}

			const data = await response.json();
			const rows = data.values || [];

			if (rows.length <= 1) {
				return [];
			}

			const newsItems: INewsItem[] = rows
				.slice(1)
				.map((row: string[]) => {
					if (row.length >= 2 && row[0]?.trim() && row[1]?.trim()) {
						return {
							title: row[0].trim(),
							link: row[1].trim()
						};
					}
					return null;
				})
				.filter((item: INewsItem | null): item is INewsItem => item !== null);
			return newsItems;
		} catch (error) {
			throw new Error(`Error fetching news from Google Sheets: ${error}`);
		}
	}
}
