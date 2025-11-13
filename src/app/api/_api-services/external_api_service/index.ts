// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
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
		if (!videoIdsOrUrls?.length) {
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

	static searchYouTubeCaptions(captions: IYouTubeCaption[], searchTerm: string, caseSensitive = false): IYouTubeCaption[] {
		if (!searchTerm?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Search term is required');
		}

		return YouTubeService.searchCaptions(captions, searchTerm, caseSensitive);
	}

	static getYouTubeCaptionsInRange(captions: IYouTubeCaption[], startTime: number, endTime: number): IYouTubeCaption[] {
		if (!ValidatorService.isValidNumber(startTime) || !ValidatorService.isValidNumber(endTime)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Valid start and end times are required');
		}

		if (startTime < 0 || endTime < 0 || startTime >= endTime) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid time range provided');
		}

		return YouTubeService.getCaptionsInRange(captions, startTime, endTime);
	}

	static extractYouTubeVideoId(url: string): string | null {
		return YouTubeService.extractVideoId(url);
	}

	static extractYouTubePlaylistId(url: string): string | null {
		return YouTubeService.extractPlaylistId(url);
	}

	static validateYouTubeUrl(url: string): { isValid: boolean; type: 'video' | 'playlist' | null } {
		if (!url?.trim()) {
			return { isValid: false, type: null };
		}

		return YouTubeService.isYouTubeUrl(url);
	}

	static extractSheetId(url: string): string | null {
		return GoogleSheetService.extractSheetId(url);
	}

	static extractGid(url: string): string | null {
		return GoogleSheetService.extractGid(url);
	}

	static async getSheetMetadata(sheetId: string) {
		if (!sheetId?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Sheet ID is required');
		}
		return GoogleSheetService.getSheetMetadata(sheetId);
	}

	static async getSheetNameFromGid(sheetId: string, gid: string): Promise<string> {
		if (!sheetId?.trim() || !gid?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Sheet ID and GID are required');
		}
		return GoogleSheetService.getSheetNameFromGid(sheetId, gid);
	}

	static async fetchSheetData(sheetId: string, sheetName: string): Promise<Record<string, string>[] | string[][]> {
		if (!sheetId?.trim() || !sheetName?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Sheet ID and Sheet Name are required');
		}
		return GoogleSheetService.fetchSheetData(sheetId, sheetName);
	}

	static async getYouTubePlaylistInfo(
		playlistUrl: string,
		options: { includeCaptions?: boolean; language?: string; maxVideos?: number } = {}
	): Promise<{
		playlist: IYouTubePlaylistMetadata;
		videos: Array<{
			metadata: IYouTubeVideoMetadata;
			url: string;
			previewImg: string;
			duration: string;
			description: string;
			captions?: IYouTubeCaption[];
			createdAt: string;
		}>;
	} | null> {
		const playlistMetadata = await this.getYouTubePlaylistMetadata(playlistUrl, options);

		if (!playlistMetadata) {
			return null;
		}

		const videos = playlistMetadata.videos.map((video) => ({
			metadata: video,
			url: video.url,
			previewImg: video.thumbnails.maxres?.url || video.thumbnails.high?.url || video.thumbnails.medium?.url || video.thumbnails.default?.url || '',
			duration: video.duration,
			description: video.description,
			captions: video.captions,
			createdAt: video.publishedAt
		}));

		return {
			playlist: playlistMetadata,
			videos
		};
	}

	static async sendTelegramPresentationRequest(data: {
		fullName: string;
		organization?: string;
		hasProposal: string;
		referendumIndex?: string;
		description: string;
		estimatedDuration?: string;
		preferredDate?: string;
		supportingFile?: {
			name: string;
			size: number;
			type: string;
		} | null;
		email?: string;
		telegram?: string;
		twitter?: string;
	}) {
		return TelegramService.sendPresentationRequest(data);
	}

	static async sendTelegramNotification(message: string, chatId?: string) {
		if (!message?.trim()) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Message is required');
		}

		return TelegramService.sendNotification(message, chatId);
	}

	static async testTelegramConnection() {
		return TelegramService.testConnection();
	}
}
