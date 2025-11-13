// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useRef, useEffect, useCallback, RefObject } from 'react';
import type { IAAGPlaylistData, IAAGVideoData, IYouTubePlaylistMetadata, IReferendaItem, IYouTubeVideoMetadata, ITranscriptData } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';

export const AAG_YOUTUBE_PLAYLIST_ID = 'PLtyd7v_I7PGkXbJmKojrZ1KXwspR1JkpV';

const INVALID_RESPONSE_FORMAT = 'Invalid response format';

const DEFAULT_RETRY_COUNT = 1;
const PLAYLIST_STALE_TIME = 2 * 60 * 1000;
const VIDEO_STALE_TIME = 10 * 60 * 1000;
const TRANSCRIPT_STALE_TIME = 15 * 60 * 1000;
const VIDEO_GC_TIME = 30 * 60 * 1000;
const PLAYLIST_GC_TIME = 5 * 60 * 1000;
const AUTO_SCROLL_DELAY = 2000;

const DEFAULT_DATE_LOCALE = 'en-GB';
const DEFAULT_DURATION_FALLBACK = '00:00';

interface YouTubeApiResponse<T = unknown> {
	success: boolean;
	data: T;
}

interface UseYouTubeDataOptions {
	playlistUrl?: string;
	playlistId?: string;
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

interface UseVideoDataOptions {
	videoId?: string;
	enabled?: boolean;
}

interface UseVideoDataReturn {
	data: IYouTubeVideoMetadata | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

interface UseTranscriptOptions {
	videoId?: string;
	enabled?: boolean;
	generateSummary?: boolean;
}

interface UseTranscriptReturn {
	data: ITranscriptData | null;
	loading: boolean;
	error: string | null;
	refetch: () => void;
}

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
		return DEFAULT_DURATION_FALLBACK;
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
			.toLocaleDateString(DEFAULT_DATE_LOCALE, {
				day: '2-digit',
				month: 'short',
				year: '2-digit'
			})
			.replace(/\u00A0/g, ' ')
			.trim(),

		duration: formatDuration(video.metadata.duration),
		thumbnail:
			video.metadata.thumbnails?.maxres?.url || video.metadata.thumbnails?.high?.url || video.metadata.thumbnails?.medium?.url || video.metadata.thumbnails?.default?.url || '',
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

async function fetchPlaylistData(playlistUrl: string, includeCaptions: boolean, language: string, maxVideos?: number): Promise<IAAGPlaylistData> {
	if (!playlistUrl.trim()) {
		throw new Error('Playlist URL is required');
	}

	const result = await NextApiClientService.fetchYouTubePlaylistData({
		url: playlistUrl,
		includeCaptions,
		language,
		maxVideos
	});

	if (result.error) {
		throw new Error(result.error.message || 'Failed to fetch playlist data');
	}

	if (!result.data) {
		throw new Error(INVALID_RESPONSE_FORMAT);
	}

	const responseData = result.data as YouTubeApiResponse<{
		playlist: IYouTubePlaylistMetadata;
		videos: Array<{
			metadata: IYouTubeVideoMetadata;
			referenda?: IReferendaItem[];
			agendaUrl?: string;
		}>;
	}>;

	if (!responseData.success || !responseData.data) {
		throw new Error(INVALID_RESPONSE_FORMAT);
	}

	const { playlist, videos } = responseData.data;

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

async function fetchVideoData(videoId: string): Promise<IYouTubeVideoMetadata> {
	const result = await NextApiClientService.fetchYouTubeVideoData({
		videoId,
		includeCaptions: true
	});

	if (result.error) {
		throw new Error(result.error.message || 'Failed to fetch video data');
	}

	if (!result.data) {
		throw new Error(INVALID_RESPONSE_FORMAT);
	}

	const responseData = result.data as YouTubeApiResponse<IYouTubeVideoMetadata>;

	if (!responseData.success || !responseData.data) {
		throw new Error(INVALID_RESPONSE_FORMAT);
	}

	return responseData.data;
}

async function fetchTranscript(videoId: string, generateSummary: boolean): Promise<ITranscriptData> {
	const result = await NextApiClientService.fetchYouTubeTranscript({
		videoId,
		generateSummary
	});

	if (result.error) {
		throw new Error(result.error.message || 'Failed to fetch transcript');
	}

	if (!result.data) {
		throw new Error(INVALID_RESPONSE_FORMAT);
	}

	const responseData = result.data as YouTubeApiResponse<ITranscriptData>;

	if (!responseData.success || !responseData.data) {
		throw new Error(INVALID_RESPONSE_FORMAT);
	}

	return responseData.data;
}

export function useYouTubeData({ playlistUrl, playlistId, includeCaptions = false, language = 'en', maxVideos }: UseYouTubeDataOptions): UseYouTubeDataReturn {
	const finalPlaylistUrl = playlistUrl || (playlistId ? `https://www.youtube.com/playlist?list=${playlistId}` : '');
	let finalPlaylistId = playlistId || '';
	if (playlistUrl) {
		try {
			finalPlaylistId = new URL(playlistUrl).searchParams.get('list') || '';
		} catch {
			finalPlaylistId = '';
		}
	}
	const {
		data,
		isLoading,
		error,
		refetch: queryRefetch
	} = useQuery({
		queryKey: ['youtube-playlist', finalPlaylistId, includeCaptions, language, maxVideos],
		queryFn: () => fetchPlaylistData(finalPlaylistUrl, includeCaptions, language, maxVideos),
		enabled: Boolean(finalPlaylistUrl),
		staleTime: PLAYLIST_STALE_TIME,
		gcTime: PLAYLIST_GC_TIME,
		refetchOnWindowFocus: false,
		retry: DEFAULT_RETRY_COUNT,
		retryDelay: 1000,
		networkMode: 'online'
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

export function useVideoData({ videoId, enabled = true }: UseVideoDataOptions): UseVideoDataReturn {
	const {
		data,
		isLoading,
		error,
		refetch: queryRefetch
	} = useQuery({
		queryKey: ['youtube-video', videoId],
		queryFn: () => {
			if (!videoId) throw new Error('Video ID is required');
			return fetchVideoData(videoId);
		},
		enabled: Boolean(videoId) && enabled,
		staleTime: VIDEO_STALE_TIME,
		gcTime: VIDEO_GC_TIME,
		refetchOnWindowFocus: false,
		retry: DEFAULT_RETRY_COUNT,
		retryDelay: 1000,
		networkMode: 'online'
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

export function useTranscript({ videoId, enabled = true, generateSummary = true }: UseTranscriptOptions): UseTranscriptReturn {
	const {
		data,
		isLoading,
		error,
		refetch: queryRefetch
	} = useQuery({
		queryKey: ['youtube-transcript', videoId, generateSummary],
		queryFn: () => {
			if (!videoId) throw new Error('Video ID is required');
			return fetchTranscript(videoId, generateSummary);
		},
		enabled: Boolean(videoId) && enabled,
		staleTime: TRANSCRIPT_STALE_TIME,
		gcTime: VIDEO_GC_TIME,
		refetchOnWindowFocus: false,
		retry: DEFAULT_RETRY_COUNT,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
		networkMode: 'online'
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

export function useAutoScroll(containerRef: RefObject<HTMLDivElement | null>) {
	const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
	const timeoutRef = useRef<number | null>(null);

	const handleUserInteraction = useCallback(() => {
		setShouldAutoScroll(false);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = window.setTimeout(() => {
			setShouldAutoScroll(true);
		}, AUTO_SCROLL_DELAY);
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleScroll = () => {
			handleUserInteraction();
		};

		container.addEventListener('scroll', handleScroll, { passive: true });
		container.addEventListener('wheel', handleUserInteraction, { passive: true });
		container.addEventListener('touchmove', handleUserInteraction, { passive: true });

		// eslint-disable-next-line consistent-return
		return () => {
			container.removeEventListener('scroll', handleScroll);
			container.removeEventListener('wheel', handleUserInteraction);
			container.removeEventListener('touchmove', handleUserInteraction);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [handleUserInteraction, containerRef]);

	const scrollToElement = useCallback(
		(element: HTMLDivElement) => {
			if (!shouldAutoScroll || !containerRef.current) return;

			const container = containerRef.current;
			const elementTop = element.offsetTop - container.offsetTop;

			container.scrollTo({
				top: elementTop,
				behavior: 'smooth'
			});
		},
		[shouldAutoScroll, containerRef]
	);

	return { setShouldAutoScroll, scrollToElement };
}

export function useChapterAutoScroll(containerRef: RefObject<HTMLDivElement | null>) {
	const [shouldAutoScrollChapters, setShouldAutoScrollChapters] = useState(true);
	const timeoutRef = useRef<number | null>(null);

	const handleUserInteraction = useCallback(() => {
		setShouldAutoScrollChapters(false);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = window.setTimeout(() => {
			setShouldAutoScrollChapters(true);
		}, AUTO_SCROLL_DELAY);
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleScroll = () => {
			handleUserInteraction();
		};

		container.addEventListener('scroll', handleScroll, { passive: true });
		container.addEventListener('wheel', handleUserInteraction, { passive: true });
		container.addEventListener('touchmove', handleUserInteraction, { passive: true });

		// eslint-disable-next-line consistent-return
		return () => {
			container.removeEventListener('scroll', handleScroll);
			container.removeEventListener('wheel', handleUserInteraction);
			container.removeEventListener('touchmove', handleUserInteraction);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [handleUserInteraction, containerRef]);

	const scrollToChapter = useCallback(
		(element: HTMLButtonElement) => {
			if (!shouldAutoScrollChapters || !containerRef.current) return;

			const container = containerRef.current;
			const elementTop = element.offsetTop - container.offsetTop;

			container.scrollTo({
				top: elementTop,
				behavior: 'smooth'
			});
		},
		[shouldAutoScrollChapters, containerRef]
	);

	return { setShouldAutoScrollChapters, scrollToChapter };
}

export function useYouTubePlayer(currentVideoId: string, playerRef: RefObject<HTMLIFrameElement | null>) {
	const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
	const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

	const seekToTime = useCallback(
		(timeInSeconds: number) => {
			if (playerRef.current?.contentWindow) {
				playerRef.current.contentWindow.postMessage(
					JSON.stringify({
						event: 'command',
						func: 'seekTo',
						args: [timeInSeconds, true]
					}),
					'*'
				);
			}
		},
		[playerRef]
	);

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== 'https://www.youtube.com') return;

			try {
				const data = JSON.parse(event.data);
				if (data.event === 'infoDelivery' && data.info) {
					if (data.info.currentTime !== undefined) {
						setCurrentVideoTime(data.info.currentTime);
					}
					if (data.info.playerState !== undefined) {
						setIsVideoPlaying(data.info.playerState === 1);
					}
				}
			} catch {
				console.error('Failed to parse message from YouTube iframe');
			}
		};

		window.addEventListener('message', handleMessage);

		const interval = setInterval(() => {
			if (playerRef.current?.contentWindow) {
				playerRef.current.contentWindow.postMessage(
					JSON.stringify({
						event: 'listening',
						id: currentVideoId
					}),
					'*'
				);
			}
		}, 500);

		return () => {
			window.removeEventListener('message', handleMessage);
			clearInterval(interval);
		};
	}, [currentVideoId, playerRef]);

	return { currentVideoTime, isVideoPlaying, seekToTime };
}
