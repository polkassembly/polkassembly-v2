// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState, useEffect, useCallback } from 'react';

interface IChapter {
	id: string;
	title: string;
	timestamp: string;
	start: number;
	description?: string;
	duration?: string;
}

interface IChaptersData {
	chapters: IChapter[];
	captionCount: number;
	language: string;
}

interface IUseYouTubeChaptersParams {
	videoUrl?: string;
	language?: string;
	enabled?: boolean;
}

interface IUseYouTubeChaptersReturn {
	data: IChaptersData | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useYouTubeChapters({ videoUrl, language = 'en', enabled = true }: IUseYouTubeChaptersParams): IUseYouTubeChaptersReturn {
	const [data, setData] = useState<IChaptersData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchChapters = useCallback(async () => {
		if (!videoUrl || !enabled) return;

		try {
			setLoading(true);
			setError(null);

			const url = new URL('/api/youtube/chapters', window.location.origin);
			url.searchParams.set('url', videoUrl);
			url.searchParams.set('language', language);

			const response = await fetch(url.toString());

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
			}

			const result = await response.json();

			if (result.success) {
				setData(result.data);
			} else {
				throw new Error(result.error || 'Failed to fetch chapters');
			}
		} catch (fetchError) {
			const errorMessage = fetchError instanceof Error ? fetchError.message : 'An error occurred while fetching chapters';
			setError(errorMessage);
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [videoUrl, language, enabled]);

	useEffect(() => {
		fetchChapters();
	}, [fetchChapters]);

	const refetch = () => {
		fetchChapters();
	};

	return {
		data,
		loading,
		error,
		refetch
	};
}
