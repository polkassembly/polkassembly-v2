// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { IYouTubeChapter } from '@/_shared/types';

interface ReferendaItem {
	network?: string;
	referendaNo?: string;
	track?: string;
	title?: string;
	url?: string;
}

interface VideoData {
	id: string;
	title: string;
	description: string;
	thumbnails: Record<string, { url: string; width: number; height: number }>;
	publishedAt: string;
	channelId: string;
	channelTitle: string;
	duration: string;
	url: string;
	tags?: string[];
	viewCount?: string;
	likeCount?: string;
	commentCount?: string;
	agendaUrl?: string;
	chapters: IYouTubeChapter[];
	referenda: ReferendaItem[];
}

interface UseVideoDataOptions {
	videoId?: string;
	enabled?: boolean;
}

interface UseVideoDataReturn {
	data: VideoData | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useVideoData({ videoId, enabled = true }: UseVideoDataOptions): UseVideoDataReturn {
	const [data, setData] = useState<VideoData | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		if (!videoId || !enabled) {
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				videoId,
				includeCaptions: 'true'
			});

			const response = await fetch(`/api/youtube/video?${params.toString()}`);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || 'Failed to fetch video data');
			}

			const result = await response.json();

			if (result.success && result.data) {
				setData(result.data);
			} else {
				throw new Error('Invalid response format');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch data');
		} finally {
			setLoading(false);
		}
	}, [videoId, enabled]);

	const refetch = useCallback(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (videoId && enabled) {
			fetchData();
		}
	}, [fetchData, videoId, enabled]);

	return { data, loading, error, refetch };
}
