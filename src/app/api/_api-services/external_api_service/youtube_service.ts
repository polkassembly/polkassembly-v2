// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { getSubtitles } from 'youtube-captions-scraper';
import type { IYouTubeCaption, IYouTubeThumbnail, IYouTubeVideoMetadata, IYouTubePlaylistMetadata, IYouTubeChapter, IReferendaItem } from '@/_shared/types';
import { GOOGLE_API_KEY } from '../../_api-constants/apiEnvVars';
import { APIError } from '../../_api-utils/apiError';

if (!GOOGLE_API_KEY.trim()) {
	console.warn('\n ⚠️  Warning: GOOGLE_API_KEY is not set. YouTube video metadata will not be fetched.\n');
}

interface IYouTubeApiVideoResponse {
	kind: string;
	etag: string;
	items: Array<{
		kind: string;
		etag: string;
		id: string;
		snippet: {
			publishedAt: string;
			channelId: string;
			title: string;
			description: string;
			thumbnails: {
				default?: IYouTubeThumbnail;
				medium?: IYouTubeThumbnail;
				high?: IYouTubeThumbnail;
				standard?: IYouTubeThumbnail;
				maxres?: IYouTubeThumbnail;
			};
			channelTitle: string;
			tags?: string[];
			categoryId: string;
		};
		contentDetails: {
			duration: string;
		};
		statistics?: {
			viewCount?: string;
			likeCount?: string;
			dislikeCount?: string;
			favoriteCount?: string;
			commentCount?: string;
		};
	}>;
}

interface IYouTubeApiPlaylistResponse {
	kind: string;
	etag: string;
	items: Array<{
		kind: string;
		etag: string;
		id: string;
		snippet: {
			publishedAt: string;
			channelId: string;
			title: string;
			description: string;
			thumbnails: {
				default?: IYouTubeThumbnail;
				medium?: IYouTubeThumbnail;
				high?: IYouTubeThumbnail;
				standard?: IYouTubeThumbnail;
				maxres?: IYouTubeThumbnail;
			};
			channelTitle: string;
		};
		contentDetails: {
			itemCount: number;
		};
	}>;
}

interface IYouTubeApiPlaylistItemsResponse {
	kind: string;
	etag: string;
	nextPageToken?: string;
	items: Array<{
		kind: string;
		etag: string;
		id: string;
		snippet: {
			publishedAt: string;
			channelId: string;
			title: string;
			description: string;
			thumbnails?: {
				default?: IYouTubeThumbnail;
				medium?: IYouTubeThumbnail;
				high?: IYouTubeThumbnail;
				standard?: IYouTubeThumbnail;
				maxres?: IYouTubeThumbnail;
			};
			channelTitle: string;
			resourceId: {
				kind: string;
				videoId: string;
			};
		};
	}>;
}

export class YouTubeService {
	private static YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

	private static MAX_RESULTS_PER_REQUEST = 50;

	private static DEFAULT_LANGUAGE = 'en';

	static extractVideoId(url: string): string | null {
		if (!ValidatorService.isUrl(url)) {
			if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
				return url;
			}
			return null;
		}

		const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/, /youtube\.com\/v\/([^&\n?#]+)/, /youtube\.com\/watch\?.*v=([^&\n?#]+)/];

		const match = patterns.map((pattern) => url.match(pattern)).find((m) => Boolean(m && m[1])) as RegExpMatchArray | undefined;
		if (match && match[1]) {
			return match[1];
		}

		return null;
	}

	static extractPlaylistId(url: string): string | null {
		if (!ValidatorService.isUrl(url)) {
			if (/^[a-zA-Z0-9_-]+$/.test(url)) {
				return url;
			}
			return null;
		}

		const patterns = [/[?&]list=([a-zA-Z0-9_-]+)/, /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/];

		const match = patterns.map((p) => url.match(p)).find((m) => Boolean(m && m[1])) as RegExpMatchArray | undefined;
		if (match && match[1]) {
			return match[1];
		}
		return null;
	}

	private static async fetchVideoCaptions(videoId: string, language = this.DEFAULT_LANGUAGE): Promise<IYouTubeCaption[]> {
		try {
			const captions = await getSubtitles({
				videoID: videoId,
				lang: language
			});

			return captions.map((caption) => ({
				start: caption.start,
				dur: caption.dur,
				text: caption.text
			}));
		} catch (error) {
			console.warn(`Failed to fetch captions for video ${videoId}:`, error);
			if (language !== 'en') {
				try {
					return await this.fetchVideoCaptions(videoId, 'en');
				} catch (fallbackError) {
					console.warn(`Failed to fetch fallback captions for video ${videoId}:`, fallbackError);
					return [];
				}
			}
			return [];
		}
	}

	private static async fetchVideoMetadata(videoIds: string[]): Promise<IYouTubeApiVideoResponse> {
		if (!GOOGLE_API_KEY.trim()) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'YouTube API key not configured');
		}

		const url = new URL(`${this.YOUTUBE_API_BASE_URL}/videos`);
		url.searchParams.set('part', 'snippet,contentDetails,statistics');
		url.searchParams.set('id', videoIds.join(','));
		url.searchParams.set('key', GOOGLE_API_KEY);

		try {
			const response = await fetch(url.toString());

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new APIError(ERROR_CODES.API_FETCH_ERROR, response.status, `YouTube API error: ${errorData.error?.message}`);
			}

			const data: IYouTubeApiVideoResponse = await response.json();
			return data;
		} catch (error) {
			if (error instanceof APIError) {
				throw error;
			}
			console.error('Error fetching video metadata:', error);
			throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch video metadata from YouTube API');
		}
	}

	private static async fetchPlaylistMetadata(playlistId: string): Promise<IYouTubeApiPlaylistResponse> {
		if (!GOOGLE_API_KEY.trim()) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'YouTube API key is not configured');
		}

		const url = new URL(`${this.YOUTUBE_API_BASE_URL}/playlists`);
		url.searchParams.set('part', 'snippet,contentDetails');
		url.searchParams.set('id', playlistId);
		url.searchParams.set('key', GOOGLE_API_KEY);

		try {
			const response = await fetch(url.toString());

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new APIError(ERROR_CODES.API_FETCH_ERROR, response.status, `YouTube API error: ${errorData.error?.message || 'Unknown error'}`);
			}

			const data: IYouTubeApiPlaylistResponse = await response.json();
			return data;
		} catch (error) {
			if (error instanceof APIError) {
				throw error;
			}
			console.error('Error fetching playlist metadata:', error);
			throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch playlist metadata from YouTube API');
		}
	}

	private static async fetchPlaylistVideos(playlistId: string): Promise<string[]> {
		if (!GOOGLE_API_KEY.trim()) {
			throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'YouTube API key is not configured');
		}

		const videoIds: string[] = [];
		let nextPageToken: string | undefined;

		const fetchPage = async (pageToken?: string): Promise<void> => {
			const url = new URL(`${this.YOUTUBE_API_BASE_URL}/playlistItems`);
			url.searchParams.set('part', 'snippet');
			url.searchParams.set('playlistId', playlistId);
			url.searchParams.set('maxResults', this.MAX_RESULTS_PER_REQUEST.toString());
			url.searchParams.set('key', GOOGLE_API_KEY);

			if (pageToken) {
				url.searchParams.set('pageToken', pageToken);
			}

			try {
				const response = await fetch(url.toString());

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new APIError(ERROR_CODES.API_FETCH_ERROR, response.status, `YouTube API error: ${errorData.error?.message || 'Unknown error'}`);
				}

				const data: IYouTubeApiPlaylistItemsResponse = await response.json();

				data.items.forEach((item) => {
					if (item.snippet.resourceId?.videoId) {
						videoIds.push(item.snippet.resourceId.videoId);
					}
				});

				nextPageToken = data.nextPageToken;
			} catch (error) {
				if (error instanceof APIError) {
					throw error;
				}
				console.error('Error fetching playlist videos:', error);
				throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch playlist videos from YouTube API');
			}
		};

		await fetchPage();
		while (nextPageToken) {
			// eslint-disable-next-line no-await-in-loop
			await fetchPage(nextPageToken);
		}

		return videoIds;
	}

	static async getVideoMetadata(videoIdOrUrl: string, options: { includeCaptions?: boolean; language?: string } = {}): Promise<IYouTubeVideoMetadata | null> {
		const { includeCaptions = true, language = this.DEFAULT_LANGUAGE } = options;

		const videoId = this.extractVideoId(videoIdOrUrl);
		if (!videoId) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid YouTube video URL or ID');
		}

		try {
			const apiResponse = await this.fetchVideoMetadata([videoId]);

			if (!apiResponse.items || apiResponse.items.length === 0) {
				return null;
			}

			const videoData = apiResponse.items[0];

			let captions: IYouTubeCaption[] = [];
			if (includeCaptions) {
				captions = await this.fetchVideoCaptions(videoId, language);
			}

			const metadata: IYouTubeVideoMetadata = {
				id: videoId,
				title: videoData.snippet.title,
				description: videoData.snippet.description,
				thumbnails: videoData.snippet.thumbnails,
				publishedAt: videoData.snippet.publishedAt,
				channelId: videoData.snippet.channelId,
				channelTitle: videoData.snippet.channelTitle,
				duration: videoData.contentDetails.duration,
				url: `https://www.youtube.com/watch?v=${videoId}`,
				tags: videoData.snippet.tags,
				captions: includeCaptions ? captions : undefined,
				viewCount: videoData.statistics?.viewCount,
				likeCount: videoData.statistics?.likeCount,
				commentCount: videoData.statistics?.commentCount
			};

			return metadata;
		} catch (error) {
			if (error instanceof APIError) {
				throw error;
			}
			console.error('Error getting video metadata:', error);
			throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch video metadata');
		}
	}

	static async getMultipleVideosMetadata(videoIdsOrUrls: string[], options: { includeCaptions?: boolean; language?: string } = {}): Promise<IYouTubeVideoMetadata[]> {
		const { includeCaptions = true, language = this.DEFAULT_LANGUAGE } = options;

		const videoIds = videoIdsOrUrls.map((idOrUrl) => this.extractVideoId(idOrUrl)).filter(Boolean) as string[];

		if (videoIds.length === 0) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'No valid YouTube video URLs or IDs provided');
		}

		const results: IYouTubeVideoMetadata[] = [];

		const batches: string[][] = [];
		for (let i = 0; i < videoIds.length; i += this.MAX_RESULTS_PER_REQUEST) {
			batches.push(videoIds.slice(i, i + this.MAX_RESULTS_PER_REQUEST));
		}

		const processBatch = async (batchVideoIds: string[]): Promise<void> => {
			try {
				const apiResponse = await this.fetchVideoMetadata(batchVideoIds);

				const videoPromises = apiResponse.items.map(async (videoData) => {
					const videoId = videoData.id;

					let captions: IYouTubeCaption[] = [];
					if (includeCaptions) {
						captions = await this.fetchVideoCaptions(videoId, language);
					}

					const metadata: IYouTubeVideoMetadata = {
						id: videoId,
						title: videoData.snippet.title,
						description: videoData.snippet.description,
						thumbnails: videoData.snippet.thumbnails,
						publishedAt: videoData.snippet.publishedAt,
						channelId: videoData.snippet.channelId,
						channelTitle: videoData.snippet.channelTitle,
						duration: videoData.contentDetails.duration,
						url: `https://www.youtube.com/watch?v=${videoId}`,
						tags: videoData.snippet.tags,
						captions: includeCaptions ? captions : undefined,
						viewCount: videoData.statistics?.viewCount,
						likeCount: videoData.statistics?.likeCount,
						commentCount: videoData.statistics?.commentCount
					};

					return metadata;
				});

				const batchResults = await Promise.all(videoPromises);
				results.push(...batchResults);
			} catch (error) {
				console.error('Error processing video batch:', error);
			}
		};

		// eslint-disable-next-line no-restricted-syntax
		for (const batch of batches) {
			// eslint-disable-next-line no-await-in-loop
			await processBatch(batch);
		}

		return results;
	}

	static async getPlaylistMetadata(
		playlistIdOrUrl: string,
		options: { includeCaptions?: boolean; language?: string; maxVideos?: number } = {}
	): Promise<IYouTubePlaylistMetadata | null> {
		const { includeCaptions = true, language = this.DEFAULT_LANGUAGE, maxVideos } = options;

		const playlistId = this.extractPlaylistId(playlistIdOrUrl);
		if (!playlistId) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid YouTube playlist URL or ID');
		}

		try {
			const playlistResponse = await this.fetchPlaylistMetadata(playlistId);

			if (!playlistResponse.items || playlistResponse.items.length === 0) {
				return null;
			}

			const playlistData = playlistResponse.items[0];

			const allVideoIds = await this.fetchPlaylistVideos(playlistId);

			const videoIds = maxVideos ? allVideoIds.slice(0, maxVideos) : allVideoIds;

			const videos = await this.getMultipleVideosMetadata(videoIds, { includeCaptions, language });

			const metadata: IYouTubePlaylistMetadata = {
				id: playlistId,
				title: playlistData.snippet.title,
				description: playlistData.snippet.description,
				publishedAt: playlistData.snippet.publishedAt,
				channelId: playlistData.snippet.channelId,
				channelTitle: playlistData.snippet.channelTitle,
				thumbnails: playlistData.snippet.thumbnails,
				itemCount: playlistData.contentDetails.itemCount,
				videos,
				url: `https://www.youtube.com/playlist?list=${playlistId}`
			};

			return metadata;
		} catch (error) {
			if (error instanceof APIError) {
				throw error;
			}
			console.error('Error getting playlist metadata:', error);
			throw new APIError(ERROR_CODES.API_FETCH_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch playlist metadata');
		}
	}

	static async getVideoCaptions(videoIdOrUrl: string, language = this.DEFAULT_LANGUAGE): Promise<IYouTubeCaption[]> {
		const videoId = this.extractVideoId(videoIdOrUrl);
		if (!videoId) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid YouTube video URL or ID');
		}

		return this.fetchVideoCaptions(videoId, language);
	}

	static captionsToText(captions: IYouTubeCaption[]): string {
		return captions.map((caption) => caption.text).join(' ');
	}

	static searchCaptions(captions: IYouTubeCaption[], searchTerm: string, caseSensitive = false): IYouTubeCaption[] {
		const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

		return captions.filter((caption) => {
			const text = caseSensitive ? caption.text : caption.text.toLowerCase();
			return text.includes(term);
		});
	}

	static getCaptionsInRange(captions: IYouTubeCaption[], startTime: number, endTime: number): IYouTubeCaption[] {
		return captions.filter((caption) => {
			const captionEnd = caption.start + caption.dur;
			return caption.start >= startTime && captionEnd <= endTime;
		});
	}

	static extractChaptersFromDescription(description: string): Array<{
		id: string;
		title: string;
		timestamp: string;
		start: number;
		description?: string;
		duration?: string;
	}> {
		if (!description?.trim()) return [];

		const chapters: Array<{
			id: string;
			title: string;
			timestamp: string;
			start: number;
			description?: string;
			duration?: string;
		}> = [];

		const lines = description.split(/\n/);

		lines.forEach((line) => {
			const trimmedLine = line.trim();

			const timestampPatterns = [/^(\d{1,2}):(\d{2})\s*[-–—]?\s*(.+)$/, /^\[(\d{1,2}):(\d{2})\]\s*(.+)$/, /^(\d{1,2}):(\d{2}):(\d{2})\s*[-–—]?\s*(.+)$/];

			timestampPatterns.forEach((pattern) => {
				const match = trimmedLine.match(pattern);
				if (match) {
					let minutes: number;
					let seconds: number;
					let title: string;

					if (match.length === 4) {
						minutes = parseInt(match[1], 10);
						seconds = parseInt(match[2], 10);
						title = match[3].trim();
					} else if (match.length === 5) {
						const hours = parseInt(match[1], 10);
						minutes = parseInt(match[2], 10) + hours * 60;
						seconds = parseInt(match[3], 10);
						title = match[4].trim();
					} else {
						return;
					}

					if (!Number.isNaN(minutes) && !Number.isNaN(seconds) && title.length > 0) {
						const totalSeconds = minutes * 60 + seconds;
						const timestamp = `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`;

						title = title.replace(/^[-–—\s]+|[-–—\s]+$/g, '').trim();

						if (title.length > 2) {
							chapters.push({
								id: (chapters.length + 1).toString(),
								title: title.slice(0, 60),
								timestamp,
								start: totalSeconds,
								description: 'Chapter from video description'
							});
						}
					}
				}
			});
		});

		const uniqueChapters = chapters.sort((a, b) => a.start - b.start).filter((chapter, index, arr) => index === 0 || chapter.start !== arr[index - 1].start);

		return uniqueChapters.map((currentChapter, index) => {
			const nextChapter = uniqueChapters[index + 1];
			let duration: string | undefined;

			if (nextChapter) {
				const durationTime = nextChapter.start - currentChapter.start;
				const durationMinutes = Math.floor(durationTime / 60);
				const durationSeconds = Math.floor(durationTime % 60);
				duration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
			}

			return {
				...currentChapter,
				duration
			};
		});
	}

	static extractChaptersFromCaptions(captions: IYouTubeCaption[]): Array<IYouTubeChapter> {
		if (!captions || captions.length === 0) return [];

		const chapters: Array<{
			id: string;
			title: string;
			timestamp: string;
			start: number;
			description?: string;
			duration?: string;
		}> = [];

		const fullText = captions.map((cap) => cap.text).join(' ');

		const timestampPattern = /(\d{1,2}):(\d{2})/g;
		const lines = fullText.split(/[.!?]\s+/);

		lines.forEach((line) => {
			const timestampMatches = Array.from(line.matchAll(timestampPattern));

			if (timestampMatches.length > 0) {
				timestampMatches.forEach((match) => {
					const minutesStr = match[1];
					const secondsStr = match[2];
					const minutes = parseInt(minutesStr, 10);
					const seconds = parseInt(secondsStr, 10);

					if (!Number.isNaN(minutes) && !Number.isNaN(seconds)) {
						const totalSeconds = minutes * 60 + seconds;
						const timestamp = `${minutesStr}:${secondsStr}`;

						let title = line.replace(match[0], '').trim();
						title = title.replace(/[-–—]\s*$/, '').trim();
						title = title.replace(/^\s*[-–—]\s*/, '').trim();

						if (title.length > 3) {
							chapters.push({
								id: (chapters.length + 1).toString(),
								title: title.slice(0, 50),
								timestamp,
								start: totalSeconds,
								description: `Chapter starting at ${timestamp}`
							});
						}
					}
				});
			}
		});

		if (chapters.length === 0) {
			const significantBreaks = this.findContentBreaks(captions);
			significantBreaks.forEach((breakPoint, index) => {
				const minutes = Math.floor(breakPoint.start / 60);
				const seconds = Math.floor(breakPoint.start % 60);
				const timestamp = `${minutes}:${seconds.toString().padStart(2, '0')}`;

				chapters.push({
					id: (index + 1).toString(),
					title: breakPoint.title || `Chapter ${index + 1}`,
					timestamp,
					start: breakPoint.start,
					description: breakPoint.description
				});
			});
		}

		const chaptersWithDuration = chapters.map((currentChapter, index) => {
			const nextChapter = chapters[index + 1];
			let duration: string | undefined;

			if (nextChapter) {
				const durationTime = nextChapter.start - currentChapter.start;
				const durationMinutes = Math.floor(durationTime / 60);
				const durationSeconds = Math.floor(durationTime % 60);
				duration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
			} else {
				const lastCaption = captions[captions.length - 1];
				if (lastCaption) {
					const durationTime = lastCaption.start + lastCaption.dur - currentChapter.start;
					const durationMinutes = Math.floor(durationTime / 60);
					const durationSeconds = Math.floor(durationTime % 60);
					duration = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
				}
			}

			return {
				...currentChapter,
				duration
			};
		});

		const uniqueChapters = chaptersWithDuration.filter((chapter, index, arr) => index === 0 || Math.abs(chapter.start - arr[index - 1].start) > 30);

		return uniqueChapters.sort((a, b) => a.start - b.start).slice(0, 8);
	}

	private static findContentBreaks(captions: IYouTubeCaption[]): Array<{
		start: number;
		title?: string;
		description?: string;
	}> {
		const breaks: Array<{ start: number; title?: string; description?: string }> = [];

		breaks.push({
			start: 0,
			title: 'Introduction',
			description: 'Video introduction and overview'
		});

		const keywordTriggers = [
			'welcome',
			'introduction',
			'overview',
			'agenda',
			'today',
			'first',
			'second',
			'third',
			'next',
			'now',
			'moving on',
			"let's talk about",
			"let's discuss",
			"let's look at",
			'treasury',
			'governance',
			'referendum',
			'proposal',
			'voting',
			'question',
			'answer',
			'q&a',
			'summary',
			'conclusion',
			'wrap up'
		];

		let lastBreakTime = 0;
		const minBreakInterval = 300;

		captions.forEach((caption) => {
			const text = caption.text.toLowerCase();
			const timeSinceLastBreak = caption.start - lastBreakTime;

			if (timeSinceLastBreak > minBreakInterval) {
				const foundKeyword = keywordTriggers.find((keyword) => text.includes(keyword));

				if (foundKeyword) {
					let title = 'Chapter';
					const words = text.split(' ');
					const keywordIndex = words.findIndex((word) => word.includes(foundKeyword));

					if (keywordIndex >= 0 && keywordIndex < words.length - 2) {
						const contextWords = words.slice(keywordIndex, Math.min(keywordIndex + 4, words.length));
						title = contextWords
							.join(' ')
							.replace(/[^\w\s]/g, '')
							.trim();
						title = title.charAt(0).toUpperCase() + title.slice(1);
					}

					const minutes = Math.floor(caption.start / 60);
					const seconds = Math.floor(caption.start % 60);
					const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

					breaks.push({
						start: caption.start,
						title: title || `Section at ${timeString}`,
						description: `Content section starting at ${timeString}`
					});

					lastBreakTime = caption.start;
				}
			}
		});

		if (breaks.length < 3 && captions.length > 0) {
			const totalDuration = captions[captions.length - 1]?.start || 0;
			const intervalDuration = totalDuration / 4;

			const additionalBreaks = [];
			for (let i = 1; i < 4; i += 1) {
				const breakTime = intervalDuration * i;
				if (!breaks.some((b) => Math.abs(b.start - breakTime) < 120)) {
					additionalBreaks.push({
						start: breakTime,
						title: `Part ${i + 1}`,
						description: `Video section ${i + 1}`
					});
				}
			}
			breaks.push(...additionalBreaks);
		}

		return breaks.slice(0, 8);
	}

	static isYouTubeUrl(url: string): { isValid: boolean; type: 'video' | 'playlist' | null } {
		const videoId = this.extractVideoId(url);
		const playlistId = this.extractPlaylistId(url);

		if (videoId) {
			return { isValid: true, type: 'video' };
		}

		if (playlistId) {
			return { isValid: true, type: 'playlist' };
		}

		return { isValid: false, type: null };
	}

	static extractAgendaUrl(description: string): string | undefined {
		if (!description) return undefined;

		const lines = description.split('\n');

		for (let i = 0; i < lines.length; i += 1) {
			const line = lines.at(i)?.trim() || '';

			if (line.toLowerCase().includes("today's aagenda") || line.toLowerCase().includes('aagenda:')) {
				const nextLine = lines.at(i + 1)?.trim();

				if (nextLine?.startsWith('→') || nextLine?.startsWith('👉')) {
					const urlMatch = nextLine.match(/https:\/\/docs\.google\.com\/spreadsheets\/[^\s]+/);
					if (urlMatch) {
						return urlMatch[0];
					}
				}

				const currentLineMatch = line.match(/https:\/\/docs\.google\.com\/spreadsheets\/[^\s]+/);
				if (currentLineMatch) {
					return currentLineMatch[0];
				}
			}
		}

		const agendaMatch = description.match(/(?:today'?s?\s+aagenda|aagenda)[\s\S]{0,100}?(https:\/\/docs\.google\.com\/spreadsheets\/[^\s]+)/i);
		if (agendaMatch?.[1]) {
			return agendaMatch[1];
		}

		return undefined;
	}

	static extractSheetId(url: string): string | null {
		const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
		return match ? match[1] : null;
	}

	static extractGid(url: string): string | null {
		const match = url.match(/[#&]gid=(\d+)/);
		return match ? match[1] : null;
	}

	static async extractReferendaFromSheet(agendaUrl: string): Promise<IReferendaItem[]> {
		try {
			const sheetId = this.extractSheetId(agendaUrl);
			const gid = this.extractGid(agendaUrl);

			if (!sheetId) {
				console.warn('Could not extract sheet ID from agenda URL');
				return [];
			}

			let sheetName = 'Sheet1';
			if (gid) {
				const sheetResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${GOOGLE_API_KEY}`);

				if (sheetResponse.ok) {
					const sheetData = await sheetResponse.json();
					const sheet = sheetData.sheets?.find((s: { properties: { sheetId: number } }) => s.properties.sheetId === parseInt(gid, 10));
					if (sheet?.properties?.title) {
						sheetName = sheet.properties.title;
					}
				}
			}

			const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${GOOGLE_API_KEY}`;
			const response = await fetch(url);

			if (!response.ok) {
				console.warn('Failed to fetch sheet values:', response.statusText);
				return [];
			}

			const sheetResponse = await response.json();
			const rows = sheetResponse.values || [];

			if (!Array.isArray(rows) || rows.length === 0) {
				return [];
			}

			const referenda: IReferendaItem[] = [];

			rows.forEach((row: string[]) => {
				if (!Array.isArray(row)) return;

				row.forEach((cellValue) => {
					const cell = String(cellValue || '').trim();
					if (/^Ref\.?\s*\d+/i.test(cell)) {
						const match = cell.match(/Ref\.?\s*(\d+)/i);
						if (match) {
							const [, referendaNo] = match;
							if (!referenda.some((r) => r.referendaNo === referendaNo)) {
								referenda.push({ referendaNo });
							}
						}
					}
				});
			});

			return referenda;
		} catch (error) {
			console.error('Error extracting referenda from sheet:', error);
			return [];
		}
	}
}
