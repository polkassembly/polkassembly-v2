// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { IAAGPlaylistData, IAAGVideoData, IYouTubePlaylistMetadata, IReferendaItem } from '@/_shared/types';

interface UseYouTubeDataOptions {
	playlistUrl: string;
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

export function useYouTubeData({ playlistUrl, includeCaptions = false, language = 'en', maxVideos }: UseYouTubeDataOptions): UseYouTubeDataReturn {
	const [data, setData] = useState<IAAGPlaylistData | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const transformVideoData = useCallback(
		(
			videos: Array<{
				metadata: IYouTubePlaylistMetadata['videos'][0];
				referenda?: IReferendaItem[];
				agendaUrl?: string;
			}>
		): IAAGVideoData[] => {
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
		},
		[]
	);

	const fetchData = useCallback(async () => {
		if (!playlistUrl.trim()) {
			setError('Playlist URL is required');
			return;
		}

		setLoading(true);
		setError(null);

		try {
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
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || 'Failed to fetch playlist data');
			}

			const result = await response.json();

			if (result.success && result.data) {
				const { playlist, videos } = result.data;

				const transformedData: IAAGPlaylistData = {
					id: playlist.id,
					title: playlist.title,
					description: playlist.description,
					url: playlist.url,
					channelTitle: playlist.channelTitle,
					publishedAt: playlist.publishedAt,
					itemCount: playlist.itemCount,
					videos: transformVideoData(videos)
				};

				setData(transformedData);
			} else {
				throw new Error('Invalid response format');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch data');
		} finally {
			setLoading(false);
		}
	}, [playlistUrl, includeCaptions, language, maxVideos, transformVideoData]);

	const refetch = useCallback(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (playlistUrl) {
			fetchData();
		}
	}, [fetchData, playlistUrl]);

	return { data, loading, error, refetch };
}
