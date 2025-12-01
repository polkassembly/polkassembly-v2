// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IYouTubeChapter, IYouTubeVideoMetadata, IYouTubeCaption, IAAGVideoSummary, IAAGVideoMetadata, ENetwork } from '@/_shared/types';
import { getNetworkFromDate } from '@/_shared/_utils/getNetworkFromDate';
import { YouTubeService } from '../youtube_service';
import { AIService } from '../../ai_service';
import { FirestoreUtils } from '../../offchain_db_service/firestore_service/firestoreUtils';

interface IAAGVideoData {
	id: string;
	title: string;
	date: string;
	duration: string;
	thumbnail: string;
	url: string;
	description: string;
	referenda: { referendaNo: string }[];
	publishedAt: string;
	captions?: IYouTubeCaption[];
	viewCount?: string;
	likeCount?: string;
	commentCount?: string;
	tags?: string[];
	agendaUrl?: string;
	chapters?: IYouTubeChapter[];
}

export class AAGVideoService extends FirestoreUtils {
	private static readonly UNKNOWN_ERROR_MESSAGE = 'Unknown error';

	public static async IndexVideoMetadata(videoData: IAAGVideoData): Promise<{ success: boolean; videoId: string; message: string; error?: string }> {
		try {
			console.log(`Starting indexing for video: ${videoData.id} - ${videoData.title}`);

			const existingVideo = await this.GetAAGVideoMetadata(videoData.id);
			if (existingVideo && existingVideo.isIndexed) {
				console.log(`Video ${videoData.id} already indexed, updating if needed`);
			}

			let transcript: { language: string; captions: Array<{ start: number; dur: number; text: string }> };
			try {
				transcript = this.ProcessVideoTranscript(videoData);
			} catch (error) {
				console.warn(`Failed to process transcript for video ${videoData.id}:`, error);
				transcript = { language: 'en', captions: [] };
			}

			let chapters: Array<{ id: string; title: string; startTime: number; endTime: number; description?: string }> = [];
			try {
				chapters = this.ProcessVideoChapters(videoData);
			} catch (error) {
				console.warn(`Failed to process chapters for video ${videoData.id}:`, error);
			}

			const aiSummary = await this.GenerateVideoAISummary(videoData, transcript);

			const consolidatedMetadata: IAAGVideoMetadata = {
				id: videoData.id,
				title: videoData.title,
				description: videoData.description,
				publishedAt: new Date(videoData.publishedAt),
				duration: this.convertDurationToReadable(videoData.duration),
				thumbnail: videoData.thumbnail,
				url: videoData.url,
				network: getNetworkFromDate(videoData.publishedAt),
				viewCount: videoData.viewCount ? videoData.viewCount : '',
				likeCount: videoData.likeCount ? videoData.likeCount : '',
				commentCount: videoData.commentCount ? videoData.commentCount : '',
				agendaUrl: videoData.agendaUrl || '',
				aiSummary: aiSummary || '',
				referenda: videoData.referenda || [],
				chapters,
				transcript,
				createdAt: existingVideo?.createdAt || new Date(),
				updatedAt: new Date(),
				isIndexed: true
			};

			console.log(`Created metadata with publishedAt: ${consolidatedMetadata.publishedAt.toISOString()}`);
			console.log(`Transcript captions count: ${consolidatedMetadata.transcript?.captions?.length || 0}`);

			await this.SaveAAGVideoMetadata(consolidatedMetadata);

			console.log(`Successfully indexed video: ${videoData.id}`);

			return {
				success: true,
				videoId: consolidatedMetadata.id,
				message: 'Video indexed successfully'
			};
		} catch (error) {
			console.error(`Error indexing video ${videoData.id}:`, error);
			return {
				success: false,
				videoId: videoData.id,
				message: 'Failed to index video',
				error: error instanceof Error ? error.message : this.UNKNOWN_ERROR_MESSAGE
			};
		}
	}

	private static async GenerateVideoAISummary(videoData: IAAGVideoData, transcript?: IAAGVideoMetadata['transcript']): Promise<string> {
		if (transcript && transcript.captions && transcript.captions.length > 0) {
			const transcriptData = transcript.captions.map((cap: { start: number; dur: number; text: string }) => ({
				text: cap.text,
				offset: cap.start,
				duration: cap.dur
			}));

			try {
				const summary = await AIService.GenerateYouTubeTranscriptSummary(transcriptData);
				if (summary && summary.trim()) {
					return summary;
				}
			} catch (error) {
				console.warn(`AI service unavailable for video ${videoData.id}, using fallback summary`, error);
			}
		}

		if (videoData.description && videoData.description.trim()) {
			return `Video Summary:\n${videoData.title}\n\n${videoData.description.substring(0, 500)}${videoData.description.length > 500 ? '...' : ''}`;
		}

		return `Video: ${videoData.title}`;
	}

	static async SaveAAGVideoMetadata(metadata: IAAGVideoMetadata): Promise<void> {
		const youtubeVideoId = metadata.id;
		if (!youtubeVideoId) {
			throw new Error('YouTube video ID is required for saving metadata');
		}

		const cleanMetadata = this.removeUndefinedValues(metadata) as IAAGVideoMetadata;

		const safeToISOString = (date: unknown): string => {
			if (date instanceof Date && !isNaN(date.getTime())) {
				return date.toISOString();
			}
			return String(date || 'Invalid Date');
		};

		console.log(`Saving metadata for video ${youtubeVideoId}:`);
		console.log(`- Duration: ${cleanMetadata.duration}`);
		console.log(`- PublishedAt: ${safeToISOString(metadata.publishedAt)}`);
		console.log(`- CreatedAt: ${safeToISOString(metadata.createdAt)}`);
		console.log(`- Transcript captions: ${cleanMetadata.transcript?.captions?.length || 0}`);

		await this.aagVideoMetadataCollectionRef().doc(youtubeVideoId).set(cleanMetadata, { merge: true });
	}

	static async GetAAGVideoMetadata(youtubeVideoId: string): Promise<IAAGVideoMetadata | null> {
		const doc = await this.aagVideoMetadataCollectionRef().doc(youtubeVideoId).get();

		if (!doc.exists) {
			return null;
		}

		const data = doc.data();
		if (!data || typeof data.id !== 'string' || typeof data.title !== 'string') {
			return null;
		}

		const processedData = {
			...data,
			publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate() : new Date(data.publishedAt || Date.now()),
			createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
			updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now())
		};

		return processedData as IAAGVideoMetadata;
	}

	static async GetAllAAGVideos(): Promise<IAAGVideoMetadata[]> {
		const snapshot = await this.aagVideoMetadataCollectionRef().where('isIndexed', '==', true).orderBy('publishedAt', 'desc').get();

		return snapshot.docs
			.map((doc) => {
				const data = doc.data();
				if (!data || typeof data.id !== 'string' || typeof data.title !== 'string') {
					return null;
				}
				return data as IAAGVideoMetadata;
			})
			.filter((item): item is IAAGVideoMetadata => item !== null);
	}

	static async GetAAGVideoCount(): Promise<number> {
		const snapshot = await this.aagVideoMetadataCollectionRef().where('isIndexed', '==', true).get();
		return snapshot.size;
	}

	private static ProcessVideoTranscript(videoData: IAAGVideoData): { language: string; captions: Array<{ start: number; dur: number; text: string }> } {
		if (!videoData.captions?.length) {
			return { language: 'en', captions: [] };
		}

		return {
			language: 'en',
			captions: videoData.captions.map((c) => ({
				start: c.start || 0,
				dur: c.dur || 0,
				text: c.text || ''
			}))
		};
	}

	private static ProcessVideoChapters(videoData: IAAGVideoData): Array<{ id: string; title: string; startTime: number; endTime: number; description?: string }> {
		if (!videoData.chapters?.length) {
			return [];
		}

		return videoData.chapters.map((chapter, index) => ({
			id: this.generateId(),
			title: chapter.title || 'Untitled Chapter',
			startTime: chapter.start || 0,
			endTime: videoData.chapters?.[index + 1]?.start || 0,
			description: chapter.description
		}));
	}

	public static async ConvertYouTubeVideoToAAGFormat(video: IYouTubeVideoMetadata): Promise<IAAGVideoData> {
		const agendaUrl = YouTubeService.extractAgendaUrl(video.description);

		let referenda: { referendaNo: string }[] = [];
		if (agendaUrl) {
			try {
				const extractedReferenda = await YouTubeService.extractReferendaFromSheet(agendaUrl);
				referenda = extractedReferenda;
			} catch (error) {
				console.warn(`Failed to extract referenda from agenda ${agendaUrl}:`, error);
			}
		}

		let chapters: IYouTubeChapter[] = [];
		try {
			const descriptionChapters = YouTubeService.extractChaptersFromDescription(video.description);
			chapters = descriptionChapters;

			if (chapters.length === 0 && video.captions) {
				const captionChapters = YouTubeService.extractChaptersFromCaptions(video.captions);
				chapters = captionChapters;
			}
		} catch (error) {
			console.warn(`Failed to extract chapters for video ${video.id}:`, error);
		}

		return {
			id: video.id,
			title: video.title,
			description: video.description,
			thumbnail: video.thumbnails?.high?.url || video.thumbnails?.medium?.url || video.thumbnails?.default?.url || '',
			url: video.url,
			publishedAt: video.publishedAt,
			duration: video.duration,
			viewCount: video.viewCount,
			likeCount: video.likeCount,
			commentCount: video.commentCount,
			tags: video.tags || [],
			date: video.publishedAt,
			agendaUrl,
			referenda,
			chapters,
			captions: video.captions
		};
	}

	static async CheckForNewVideos(playlistId: string): Promise<{ newVideos: number; updatedVideos: number }> {
		try {
			console.log(`Checking for new videos in playlist: ${playlistId}`);

			const playlistData = await YouTubeService.getPlaylistMetadata(playlistId, { includeCaptions: true });
			if (!playlistData || !playlistData.videos) {
				throw new Error('Failed to fetch playlist data or no videos found');
			}

			let newVideos = 0;
			let updatedVideos = 0;

			const videoPromises = playlistData.videos.map(async (video) => {
				try {
					const existingMetadata = await this.GetAAGVideoMetadata(video.id);

					if (!existingMetadata) {
						const aagVideoData = await this.ConvertYouTubeVideoToAAGFormat(video);
						await this.IndexVideoMetadata(aagVideoData);
						newVideos += 1;
						console.log(`Indexed new video: ${video.title}`);
					} else {
						const aagVideoData = await this.ConvertYouTubeVideoToAAGFormat(video);
						const hasChanges = this.hasMetadataChanges(existingMetadata, aagVideoData);

						if (hasChanges) {
							await this.IndexVideoMetadata(aagVideoData);
							updatedVideos += 1;
							console.log(`Updated video: ${video.title}`);
						}
					}
				} catch (error) {
					console.error(`Error processing video ${video.id}:`, error);
				}
			});

			await Promise.all(videoPromises);

			console.log(`Check completed: ${newVideos} new videos, ${updatedVideos} updated videos`);
			return { newVideos, updatedVideos };
		} catch (error) {
			console.error('Error checking for new videos:', error);
			throw error;
		}
	}

	private static hasMetadataChanges(existingMetadata: IAAGVideoMetadata, newVideoData: IAAGVideoData): boolean {
		const titleChanged = existingMetadata.title !== newVideoData.title;
		const descriptionChanged = existingMetadata.description !== newVideoData.description;
		const durationChanged = existingMetadata.duration !== this.convertDurationToReadable(newVideoData.duration);
		const agendaUrlChanged = (existingMetadata.agendaUrl || '') !== (newVideoData.agendaUrl || '');

		if (titleChanged || descriptionChanged || durationChanged || agendaUrlChanged) {
			console.log(`Metadata changes detected for video ${newVideoData.id}:`, {
				titleChanged,
				descriptionChanged,
				durationChanged,
				agendaUrlChanged
			});
			return true;
		}

		return false;
	}

	private static removeUndefinedValues(obj: unknown): unknown {
		if (obj === null || typeof obj !== 'object') {
			return obj;
		}

		if (obj instanceof Date) {
			return obj;
		}

		if (Array.isArray(obj)) {
			return obj.map((item) => this.removeUndefinedValues(item)).filter((item) => item !== undefined);
		}

		const entries = Object.entries(obj as Record<string, unknown>)
			.filter(([, value]) => value !== undefined)
			.map(([key, value]) => [key, this.removeUndefinedValues(value)] as const);

		return Object.fromEntries(entries);
	}

	private static convertDurationToReadable(duration: string): string {
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

	private static generateId(): string {
		return `aag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	static async GetLatestAAGVideos(limit: number = 10): Promise<IAAGVideoMetadata[]> {
		const snapshot = await this.aagVideoMetadataCollectionRef().where('isIndexed', '==', true).orderBy('publishedAt', 'desc').limit(limit).get();

		return snapshot.docs
			.map((doc) => {
				const data = doc.data();
				if (!data || typeof data.id !== 'string' || typeof data.title !== 'string') {
					return null;
				}

				const processedData = {
					...data,
					publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate() : new Date(data.publishedAt || Date.now()),
					createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
					updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now())
				};

				return processedData as IAAGVideoMetadata;
			})
			.filter((item): item is IAAGVideoMetadata => item !== null);
	}

	static async SearchAAGVideosByTitle(
		searchQuery: string,
		limit: number = 20,
		sortBy: 'latest' | 'oldest' = 'latest',
		network: ENetwork | null = null
	): Promise<IAAGVideoMetadata[]> {
		const sortOrder = sortBy === 'latest' ? 'desc' : 'asc';
		const snapshot = await this.aagVideoMetadataCollectionRef().where('isIndexed', '==', true).orderBy('publishedAt', sortOrder).limit(200).get();

		const searchTerms = searchQuery
			.toLowerCase()
			.split(' ')
			.filter((term) => term.length > 2);

		return snapshot.docs
			.map((doc) => {
				const data = doc.data();
				if (!data || typeof data.id !== 'string' || typeof data.title !== 'string') {
					return null;
				}

				const processedData = {
					...data,
					publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate() : new Date(data.publishedAt || Date.now()),
					createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
					updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now())
				};

				return processedData as IAAGVideoMetadata;
			})
			.filter((item): item is IAAGVideoMetadata => item !== null)
			.filter((video) => {
				const title = video.title.toLowerCase();
				const description = (video.description || '').toLowerCase();

				return searchTerms.some((term) => title.includes(term) || description.includes(term));
			})
			.filter((video) => {
				if (network === null) return true;
				return video.network === network;
			})
			.slice(0, limit);
	}

	static async GetAAGVideosByReferenda(referendaId: string, limit: number = 20): Promise<IAAGVideoMetadata[]> {
		const snapshot = await this.aagVideoMetadataCollectionRef()
			.where('isIndexed', '==', true)
			.where('referenda', 'array-contains', { referendaNo: referendaId })
			.orderBy('publishedAt', 'desc')
			.limit(limit)
			.get();

		return snapshot.docs
			.map((doc) => {
				const data = doc.data();
				if (!data || typeof data.id !== 'string' || typeof data.title !== 'string') {
					return null;
				}

				const processedData = {
					...data,
					publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate() : new Date(data.publishedAt || Date.now()),
					createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
					updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now())
				};

				return processedData as IAAGVideoMetadata;
			})
			.filter((item): item is IAAGVideoMetadata => item !== null);
	}

	static formatAAGVideoSummary(video: IAAGVideoMetadata): IAAGVideoSummary {
		return {
			id: video.id,
			title: video.title,
			thumbnail: video.thumbnail,
			referenda: video.referenda || [],
			publishedAt: video.publishedAt.toISOString(),
			duration: video.duration,
			agendaUrl: video.agendaUrl || '',
			network: video.network,
			url: video.url
		};
	}

	private static delay(ms: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => resolve(), ms);
		});
	}
}
