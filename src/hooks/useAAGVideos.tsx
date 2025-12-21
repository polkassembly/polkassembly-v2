// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ENetwork, IAAGVideoMetadata, IAAGVideoSummary, IGenericListingResponse } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';

const YOUTUBE_ORIGIN = 'https://www.youtube.com';

interface YouTubePlayer {
	seekTo: (seconds: number, allowSeekAhead: boolean) => void;
	getCurrentTime: () => number;
	destroy: () => void;
	getPlayerState: () => number;
}

interface YouTubeEvent {
	data: number;
}

interface YouTubePlayerConfig {
	events: {
		onStateChange?: (event: YouTubeEvent) => void;
		onReady?: () => void;
	};
}

declare global {
	interface Window {
		YT: {
			Player: new (elementId: string | HTMLElement, config: YouTubePlayerConfig) => YouTubePlayer;
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

export function useYouTubePlayer(currentVideoId: string, playerRef: React.RefObject<HTMLIFrameElement | null>) {
	const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
	const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
	const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
	const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const startTimeRef = useRef<number>(0);
	const pausedTimeRef = useRef<number>(0);
	const lastKnownTimeRef = useRef<number>(0);
	const fallbackCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const startTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}

		startTimeRef.current = Date.now();
		timerRef.current = setInterval(() => {
			if (isVideoPlaying) {
				const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
				const newTime = pausedTimeRef.current + elapsedSeconds;
				if (newTime < 100000) {
					setCurrentVideoTime(Math.round(newTime * 10) / 10);
					lastKnownTimeRef.current = newTime;
				} else if (timerRef.current) {
					clearInterval(timerRef.current);
					timerRef.current = null;
				}
			}
		}, 100);
	}, [isVideoPlaying]);

	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		if (fallbackCheckRef.current) {
			clearTimeout(fallbackCheckRef.current);
			fallbackCheckRef.current = null;
		}
		const currentTime = lastKnownTimeRef.current;
		if (currentTime > 100000) {
			pausedTimeRef.current = 0;
			lastKnownTimeRef.current = 0;
			setCurrentVideoTime(0);
		} else {
			pausedTimeRef.current = currentTime;
			setCurrentVideoTime(Math.round(currentTime * 10) / 10);
		}
	}, []);

	const seekToTime = useCallback(
		(timeInSeconds: number) => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
			setCurrentVideoTime(timeInSeconds);
			pausedTimeRef.current = timeInSeconds;
			lastKnownTimeRef.current = timeInSeconds;
			startTimeRef.current = Date.now();

			if (playerRef.current?.contentWindow) {
				try {
					playerRef.current.contentWindow.postMessage(
						JSON.stringify({
							event: 'command',
							func: 'seekTo',
							args: [timeInSeconds, true]
						}),
						YOUTUBE_ORIGIN
					);
				} catch {
					console.log('Failed to seek to time');
				}
			}

			if (isVideoPlaying) {
				setTimeout(() => {
					if (isVideoPlaying) {
						startTimer();
					}
				}, 100);
			}
		},
		[playerRef, isVideoPlaying, startTimer]
	);

	useEffect(() => {
		if (!currentVideoId) return undefined;

		const checkPlayerReady = () => {
			if (playerRef.current && !isPlayerReady) {
				setIsPlayerReady(true);
			}
		};

		checkPlayerReady();

		const interval = setInterval(checkPlayerReady, 100);

		return () => clearInterval(interval);
	}, [currentVideoId, isPlayerReady, playerRef]);

	useEffect(() => {
		if (!currentVideoId) {
			return undefined;
		}

		if (!playerRef.current) {
			return undefined;
		}

		const iframe = playerRef.current;

		const initializeVideo = () => {
			setIsVideoLoaded(true);
			setIsVideoPlaying(false);
			setCurrentVideoTime(0);
			pausedTimeRef.current = 0;
			lastKnownTimeRef.current = 0;
			startTimeRef.current = Date.now();

			fallbackCheckRef.current = setTimeout(() => {
				if (playerRef.current?.src?.includes('autoplay=1')) {
					setIsVideoPlaying(true);
				}
			}, 10000);
		};

		const handleLoad = () => {
			setTimeout(initializeVideo, 1000);
		};

		if (iframe.contentWindow) {
			handleLoad();
		} else {
			iframe.addEventListener('load', handleLoad);
		}

		return () => {
			if (iframe) {
				iframe.removeEventListener('load', handleLoad);
			}
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			if (fallbackCheckRef.current) {
				clearTimeout(fallbackCheckRef.current);
			}
		};
	}, [currentVideoId, playerRef, isPlayerReady]);

	useEffect(() => {
		if (!currentVideoId) return () => {};

		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== YOUTUBE_ORIGIN) return;

			try {
				const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

				if (data.event === 'onStateChange') {
					if (fallbackCheckRef.current) {
						clearTimeout(fallbackCheckRef.current);
						fallbackCheckRef.current = null;
					}

					const playerState = data.data;
					const newIsPlaying = playerState === 1;
					setIsVideoPlaying(newIsPlaying);

					if (newIsPlaying) {
						startTimer();
					} else {
						stopTimer();
					}
				}

				if (data.event === 'infoDelivery' && data.info && typeof data.info.currentTime === 'number' && isVideoPlaying) {
					const apiTime = Math.round(data.info.currentTime * 10) / 10;
					setCurrentVideoTime(apiTime);
					pausedTimeRef.current = apiTime;
					lastKnownTimeRef.current = apiTime;
					startTimeRef.current = Date.now();
				}
			} catch {
				console.log('Failed to update time');
			}
		};

		window.addEventListener('message', handleMessage);

		const initializePlayer = () => {
			if (playerRef.current?.contentWindow) {
				try {
					playerRef.current.contentWindow.postMessage(
						JSON.stringify({
							event: 'listening',
							id: currentVideoId
						}),
						YOUTUBE_ORIGIN
					);
				} catch {
					console.log('Failed to initialize player');
				}
			}
		};

		const initTimeout = setTimeout(initializePlayer, 1000);

		return () => {
			window.removeEventListener('message', handleMessage);
			clearTimeout(initTimeout);
		};
	}, [currentVideoId, playerRef, startTimer, stopTimer, isVideoPlaying]);

	useEffect(() => {
		if (isVideoPlaying) {
			startTimer();
		} else {
			stopTimer();
		}
	}, [isVideoPlaying, startTimer, stopTimer]);

	useEffect(() => {
		if (Math.abs(currentVideoTime - pausedTimeRef.current) > 1) {
			startTimeRef.current = Date.now() - currentVideoTime * 1000;
			pausedTimeRef.current = currentVideoTime;
		}
	}, [currentVideoTime]);

	return { currentVideoTime, isVideoPlaying, seekToTime, isVideoLoaded };
}
