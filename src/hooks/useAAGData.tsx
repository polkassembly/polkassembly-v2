// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useQuery } from '@tanstack/react-query';
import type { IAAGPlaylistData, IAAGVideoData, IYouTubePlaylistMetadata, IReferendaItem, IYouTubeChapter } from '@/_shared/types';

function formatDuration(duration: string): string {
	try {
		const hoursMatch = duration.match(/(\d+)H/);
		const minutesMatch = duration.match(/(\d+)M/);
		const secondsMatch = duration.match(/(\d+)S/);

		const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
		const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
		const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0;

		if (hours > 0) {
			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	} catch {
		return '00:00';
	}
}

function transformVideoData(
	videos: Array<{
		metadata: IYouTubePlaylistMetadata['videos'][0];
		referenda?: IReferendaItem[];
		agendaUrl?: string;
	}>
): IAAGVideoData[] {
	return videos.map((video) => ({
		id: video.metadata.id,
		title: video.metadata.title,
		date: new Date(video.metadata.publishedAt)
			.toLocaleDateString('en-GB', {
				day: '2-digit',
				month: 'short',
				year: '2-digit'
			})
			.replace(/ /g, ' '),
		duration: formatDuration(video.metadata.duration),
		thumbnail:
			video.metadata.thumbnails.maxres?.url || video.metadata.thumbnails.high?.url || video.metadata.thumbnails.medium?.url || video.metadata.thumbnails.default?.url || '',
		url: video.metadata.url,
		description: video.metadata.description,
		referenda: video.referenda || [],
		publishedAt: video.metadata.publishedAt,
		captions: video.metadata.captions,
		viewCount: video.metadata.viewCount,
		likeCount: video.metadata.likeCount,
		commentCount: video.metadata.commentCount,
		tags: video.metadata.tags,
		agendaUrl: video.agendaUrl
	}));
}

// ============================================================================
// PLAYLIST DATA HOOK
// ============================================================================

interface UseYouTubeDataOptions {
	playlistId: string;
	includeCaptions?: boolean;
	language?: string;
	maxVideos?: number;
}

interface UseYouTubeDataReturn {
	data: IAAGPlaylistData | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

async function fetchPlaylistData(playlistUrl: string, includeCaptions: boolean, language: string, maxVideos?: number): Promise<IAAGPlaylistData> {
	if (!playlistUrl.trim()) {
		throw new Error('Playlist URL is required');
	}

	const params = new URLSearchParams({
		url: playlistUrl,
		includeCaptions: includeCaptions.toString(),
		language
	});

	if (maxVideos) {
		params.append('maxVideos', maxVideos.toString());
	}

	const response = await fetch(`/api/youtube/playlist?${params.toString()}`);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({ error: 'Unknown errors' }));
		throw new Error(errorData.error || 'Failed to fetch playlist data');
	}

	const result = await response.json();

	if (!result.success || !result.data) {
		throw new Error('Invalid responses format');
	}

	const { playlist, videos } = result.data;

	return {
		id: playlist.id,
		title: playlist.title,
		description: playlist.description,
		url: playlist.url,
		channelTitle: playlist.channelTitle,
		publishedAt: playlist.publishedAt,
		itemCount: playlist.itemCount,
		videos: transformVideoData(videos)
	};
}

export function useYouTubeData({ playlistId, includeCaptions = false, language = 'en', maxVideos }: UseYouTubeDataOptions): UseYouTubeDataReturn {
	const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;

	const {
		data,
		isLoading,
		error,
		refetch: queryRefetch
	} = useQuery({
		queryKey: ['youtube-playlist', playlistId, includeCaptions, language, maxVideos],
		queryFn: () => fetchPlaylistData(playlistUrl, includeCaptions, language, maxVideos),
		enabled: Boolean(playlistUrl),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
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
		staleTime: 10 * 60 * 1000, // 10 minutes (longer for video data)
		gcTime: 30 * 60 * 1000, // 30 minutes
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

// ============================================================================
// TRANSCRIPT DATA HOOK
// ============================================================================

interface TranscriptSegment {
	text: string;
	offset: number;
	duration: number;
}

interface TranscriptData {
	transcript: TranscriptSegment[];
	summary: string | null;
}

interface UseTranscriptOptions {
	videoId?: string;
	enabled?: boolean;
	generateSummary?: boolean;
}

interface UseTranscriptReturn {
	data: TranscriptData | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

async function fetchTranscript(videoId: string, generateSummary: boolean): Promise<TranscriptData> {
	const params = new URLSearchParams({
		videoId,
		summary: generateSummary.toString()
	});

	const response = await fetch(`/api/youtube/transcript?${params.toString()}`);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
		throw new Error(errorData.error || 'Failed to fetch transcript');
	}

	const result = await response.json();

	if (!result.success || !result.data) {
		throw new Error('Invalid response format');
	}

	return result.data;
}

export function useTranscript({ videoId, enabled = true, generateSummary = true }: UseTranscriptOptions): UseTranscriptReturn {
	const {
		data,
		isLoading,
		error,
		refetch: queryRefetch
	} = useQuery({
		queryKey: ['youtube-transcript', videoId, generateSummary],
		queryFn: () => fetchTranscript(videoId!, generateSummary),
		enabled: Boolean(videoId) && enabled,
		staleTime: 15 * 60 * 1000, // 15 minutes (longest for transcript)
		gcTime: 30 * 60 * 1000, // 30 minutes
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
