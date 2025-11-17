// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { type IYouTubeVideoMetadata, type IYouTubePlaylistMetadata, type IYouTubeCaption } from '@/_shared/types';
import { APIError } from '../../_api-utils/apiError';
import { YouTubeService } from './youtube_service';
import { TelegramService } from './telegram_service';
import { GoogleSheetService } from './googlesheets_service';

export class ExternalAPIService {
	static async getYouTubeVideoMetadata(videoIdOrUrl: string, options: { includeCaptions?: boolean; language?: string } = {}): Promise<IYouTubeVideoMetadata | null> {
		if (!videoIdOrUrl?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Video ID or URL is required');
		}

		return YouTubeService.getVideoMetadata(videoIdOrUrl, options);
	}

	static async getMultipleYouTubeVideosMetadata(videoIdsOrUrls: string[], options: { includeCaptions?: boolean; language?: string } = {}): Promise<IYouTubeVideoMetadata[]> {
		if (!Array.isArray(videoIdsOrUrls) || videoIdsOrUrls.length === 0) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'At least one video ID or URL is required');
		}

		return YouTubeService.getMultipleVideosMetadata(videoIdsOrUrls, options);
	}

	static async getYouTubePlaylistMetadata(
		playlistIdOrUrl: string,
		options: { includeCaptions?: boolean; language?: string; maxVideos?: number } = {}
	): Promise<IYouTubePlaylistMetadata | null> {
		if (!playlistIdOrUrl?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Playlist ID or URL is required');
		}

		return YouTubeService.getPlaylistMetadata(playlistIdOrUrl, options);
	}

	static async getYouTubeVideoCaptions(videoIdOrUrl: string, language = 'en'): Promise<IYouTubeCaption[]> {
		if (!videoIdOrUrl?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Video ID or URL is required');
		}

		return YouTubeService.getVideoCaptions(videoIdOrUrl, language);
	}

	static captionsToText(captions: IYouTubeCaption[]): string {
		return YouTubeService.captionsToText(captions);
	}

	static extractYouTubeVideoId(url: string): string | null {
		return YouTubeService.extractVideoId(url);
	}

	static extractYouTubePlaylistId(url: string): string | null {
		return YouTubeService.extractPlaylistId(url);
	}

	static async sendTelegramMessageToChannel(channelId: string, message: string): Promise<unknown> {
		if (!channelId?.trim() || !message?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Channel ID and message are required');
		}

		return TelegramService.sendNotification(message, channelId);
	}

	static async getGoogleSheetData(sheetUrl: string): Promise<unknown> {
		if (!sheetUrl?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Sheet URL is required');
		}

		const sheetId = GoogleSheetService.extractSheetId(sheetUrl);
		if (!sheetId) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid sheet URL');
		}

		return GoogleSheetService.getSheetMetadata(sheetId);
	}

	static extractSheetId(url: string): string | null {
		return GoogleSheetService.extractSheetId(url);
	}
}

export { YouTubeService, TelegramService, GoogleSheetService };
export * from './aag/indexing_service';
