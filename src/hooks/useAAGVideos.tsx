// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ENetwork, IAAGVideoMetadata, IAAGVideoSummary, IGenericListingResponse } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';

interface YouTubePlayer {
	seekTo: (seconds: number, allowSeekAhead: boolean) => void;
	getCurrentTime: () => number;
	destroy: () => void;
	getPlayerState: () => number;
}

interface YouTubePlayerConfig {
	videoId: string;
	playerVars?: Record<string, string | number>;
	events?: {
		onReady?: (event: { target: YouTubePlayer }) => void;
		onStateChange?: (event: { data: number }) => void;
	};
}

declare global {
	interface Window {
		YT: {
			Player: new (elementId: string, config: YouTubePlayerConfig) => YouTubePlayer;
			PlayerState: {
				PLAYING: number;
				PAUSED: number;
				ENDED: number;
			};
		};
		onYouTubeIframeAPIReady?: () => void;
	}
}

interface UseAAGVideosParams {
	q?: string;
	limit?: number;
	page?: number;
	sort?: 'latest' | 'oldest';
	network?: ENetwork | null;
	enabled?: boolean;
}

interface UseAAGVideoByIdParams {
	videoId: string;
	enabled?: boolean;
}

interface UseAAGVideosByReferendumParams {
	referendaId: string;
	limit?: number;
	enabled?: boolean;
}

export const useAAGVideos = ({ q, limit, page = 1, sort, network, enabled = true }: UseAAGVideosParams) => {
	return useQuery<IGenericListingResponse<IAAGVideoSummary>, Error>({
		queryKey: ['aag-videos', q, limit, page, sort, network],
		enabled,
		retry: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.getAAGVideos({ q, limit, page, sort, network });

			if (error) {
				throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error.message);
			}

			if (!data) {
				throw new ClientError(ERROR_CODES.NOT_FOUND, 'No AAG videos found.');
			}

			return data;
		}
	});
};

export const useAAGVideoById = ({ videoId, enabled = true }: UseAAGVideoByIdParams) => {
	return useQuery<IAAGVideoMetadata | null, Error>({
		queryKey: ['aag-video', videoId],
		enabled: enabled && Boolean(videoId),
		retry: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.getAAGVideoById({ videoId });

			if (error) {
				throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error.message);
			}

			return data;
		}
	});
};

export const useAAGVideosByReferendum = ({ referendaId, limit, enabled = true }: UseAAGVideosByReferendumParams) => {
	return useQuery<IGenericListingResponse<IAAGVideoSummary>, Error>({
		queryKey: ['aag-videos-referendum', referendaId, limit],
		enabled: enabled && Boolean(referendaId),
		retry: true,
		refetchOnReconnect: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		queryFn: async () => {
			const { data, error } = await NextApiClientService.getAAGVideosByReferendum({ referendaId, limit });

			if (error) {
				throw new ClientError(ERROR_CODES.API_FETCH_ERROR, error.message);
			}

			if (!data) {
				throw new ClientError(ERROR_CODES.NOT_FOUND, 'No AAG videos found for this referendum.');
			}

			return data;
		}
	});
};

export function useYouTubePlayer(videoId: string) {
	const playerRef = useRef<YouTubePlayer | null>(null);
	const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [playerReady, setPlayerReady] = useState(false);

	useEffect(() => {
		if (!videoId) return undefined;

		let initTimeout: ReturnType<typeof setTimeout> | null = null;

		const initPlayer = () => {
			if (!window.YT || !window.YT.Player) return;

			const playerElement = document.getElementById('youtube-player');
			if (!playerElement) {
				initTimeout = setTimeout(initPlayer, 100);
				return;
			}

			if (playerRef.current) {
				try {
					playerRef.current.destroy();
				} catch {
					console.error('Failed to destroy YouTube player');
				}
				playerRef.current = null;
			}

			playerRef.current = new window.YT.Player('youtube-player', {
				videoId,
				playerVars: {
					autoplay: 0,
					modestbranding: 1,
					rel: 0,
					origin: typeof window !== 'undefined' ? window.location.origin : ''
				},
				events: {
					onReady: () => {
						setPlayerReady(true);
					},
					onStateChange: (event) => {
						if (event.data === 1) {
							if (timeIntervalRef.current) {
								clearInterval(timeIntervalRef.current);
							}
							timeIntervalRef.current = setInterval(() => {
								if (playerRef.current) {
									try {
										setCurrentTime(playerRef.current.getCurrentTime());
									} catch {
										// Player might be destroyed
									}
								}
							}, 500);
						} else if (timeIntervalRef.current) {
							clearInterval(timeIntervalRef.current);
							timeIntervalRef.current = null;
						}
					}
				}
			});
		};

		const loadYouTubeAPI = () => {
			if (window.YT && window.YT.Player) {
				setTimeout(initPlayer, 100);
				return;
			}

			const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
			if (!existingScript) {
				const tag = document.createElement('script');
				tag.src = 'https://www.youtube.com/iframe_api';
				tag.async = true;
				document.body.appendChild(tag);
			}

			window.onYouTubeIframeAPIReady = () => {
				setTimeout(initPlayer, 100);
			};
		};

		loadYouTubeAPI();

		return () => {
			if (initTimeout) {
				clearTimeout(initTimeout);
			}
			if (timeIntervalRef.current) {
				clearInterval(timeIntervalRef.current);
			}
			if (playerRef.current) {
				try {
					playerRef.current.destroy();
				} catch {
					console.error('Failed to destroy YouTube player');
				}
				playerRef.current = null;
			}
			setPlayerReady(false);
		};
	}, [videoId]);

	const seekToTime = useCallback(
		(seconds: number) => {
			if (playerRef.current && playerReady) {
				playerRef.current.seekTo(seconds, true);
				setCurrentTime(seconds);
			}
		},
		[playerReady]
	);

	return { currentTime, playerReady, seekToTime };
}
