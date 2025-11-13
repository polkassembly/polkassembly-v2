// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useQuery } from '@tanstack/react-query';
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

async function fetchVideoData(videoId: string): Promise<VideoData> {
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

	if (!result.success || !result.data) {
		throw new Error('Invalid response format');
	}

	return result.data;
}

export function useVideoData({ videoId, enabled = true }: UseVideoDataOptions): UseVideoDataReturn {
	const {
		data,
		isLoading,
		error,
		refetch: queryRefetch
	} = useQuery({
		queryKey: ['youtube-video', videoId],
		queryFn: () => fetchVideoData(videoId!),
		enabled: Boolean(videoId) && enabled,
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
		retry: 1
	});

	return {
		data: data || null,
		loading: isLoading,
		error: error ? (error as Error).message : null,
		refetch: () => {
			queryRefetch();
		}
	};
}
