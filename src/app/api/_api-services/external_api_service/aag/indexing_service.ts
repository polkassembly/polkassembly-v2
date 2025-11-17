// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, IAAGVideoData, IYouTubeChapter, IYouTubeVideoMetadata } from '@/_shared/types';
import { getNetworkFromDate } from '@/_shared/_utils/getNetworkFromDate';
import { YouTubeService } from '../youtube_service';
import { AIService } from '../../ai_service';
import { FirestoreService } from '../../offchain_db_service/firestore_service';

export interface IAAGVideoMetadata {
	id: string;
	title: string;
	publishedAt: Date;
	duration: string;
	description: string;
	thumbnail: string;
	url: string;
	network: ENetwork | null;
	viewCount: number;
	likeCount: number;
	commentCount?: number;
	agendaUrl?: string;
	aiSummary: string;
	referenda?: { referendaNo: string }[];
	chapters: Array<{
		id: string;
		title: string;
		startTime: number;
		endTime: number;
		description?: string;
	}>;
	transcript: {
		language: string;
		captions: Array<{
			start: number;
			dur: number;
			text: string;
		}>;
	};
	createdAt: Date;
	updatedAt: Date;
	isIndexed: boolean;
}

export interface IAAGIndexingBatch {
	batchId: string;
	videosProcessed: number;
	videosSuccessful: number;
	videosFailed: number;
	errors: string[];
	startTime: Date;
	endTime?: Date;
	status: 'processing' | 'completed' | 'failed';
}

export class AAGIndexingService extends FirestoreService {
	private static readonly BATCH_SIZE = 5;

	private static readonly UNKNOWN_ERROR_MESSAGE = 'Unknown error';

	protected static aagVideoMetadataCollectionRef = () => this.firestoreDb.collection('aag_video_metadata');

	protected static aagIndexingBatchCollectionRef = () => this.firestoreDb.collection('aag_indexing_batches');

	public static async IndexVideoMetadata(videoData: IAAGVideoData): Promise<{ success: boolean; videoId: string; message: string; error?: string }> {
		try {
			console.log(`Starting indexing for video: ${videoData.id} - ${videoData.title}`);

			const existingVideo = await this.GetAAGVideoMetadata(videoData.id);
			if (existingVideo && existingVideo.isIndexed) {
				console.log(`Video ${videoData.id} already indexed, updating if needed`);
			}

			let transcript: { language: string; captions: Array<{ start: number; dur: number; text: string }> } | undefined;
			try {
				console.log(`Processing transcript for video ${videoData.id}. Captions available: ${videoData.captions ? 'yes' : 'no'}`);
				if (videoData.captions) {
					console.log(`Captions length: ${videoData.captions.length}`);
				}
				transcript = await this.ProcessVideoTranscriptForConsolidated(videoData);
				console.log(`Transcript result: ${transcript ? 'success' : 'no transcript'}, captions: ${transcript?.captions?.length || 0}`);
			} catch (error) {
				console.warn(`Failed to process transcript for video ${videoData.id}:`, error);
			}

			let chapters: Array<{ id: string; title: string; startTime: number; endTime: number; description?: string }> = [];
			try {
				chapters = await this.ProcessVideoChaptersForConsolidated(videoData, transcript);
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
				viewCount: videoData.viewCount ? parseInt(videoData.viewCount, 10) : 0,
				likeCount: videoData.likeCount ? parseInt(videoData.likeCount, 10) : 0,
				commentCount: videoData.commentCount ? parseInt(videoData.commentCount, 10) : 0,
				agendaUrl: videoData.agendaUrl || '',
				aiSummary: aiSummary || '',
				referenda: videoData.referenda || [],
				chapters,
				transcript: transcript || { language: 'en', captions: [] },
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

	static async IndexPlaylistVideos(
		playlistId: string,
		options?: {
			skipExisting?: boolean;
			maxVideos?: number;
			startFromVideo?: string;
		}
	): Promise<IAAGIndexingBatch> {
		const batchId = this.generateId();
		const batch: IAAGIndexingBatch = {
			batchId,
			videosProcessed: 0,
			videosSuccessful: 0,
			videosFailed: 0,
			errors: [],
			startTime: new Date(),
			status: 'processing'
		};

		try {
			await this.SaveIndexingBatch(batch);

			const playlistData = await YouTubeService.getPlaylistMetadata(playlistId, { includeCaptions: true, maxVideos: options?.maxVideos });
			if (!playlistData || !playlistData.videos) {
				throw new Error('Failed to fetch playlist data or no videos found');
			}

			let videosToProcess = playlistData.videos;

			if (options?.startFromVideo) {
				const startIndex = videosToProcess.findIndex((v) => v.id === options.startFromVideo);
				if (startIndex >= 0) {
					videosToProcess = videosToProcess.slice(startIndex);
				}
			}

			if (options?.maxVideos) {
				videosToProcess = videosToProcess.slice(0, options.maxVideos);
			}

			console.log(`Starting to index ${videosToProcess.length} videos from playlist ${playlistId}`);

			const batches = this.chunkArray(videosToProcess, this.BATCH_SIZE);

			await batches.reduce(async (previousPromise, videoBatch, batchIndex) => {
				await previousPromise;

				const batchPromises = videoBatch.map(async (video) => {
					try {
						if (options?.skipExisting) {
							const existing = await this.GetAAGVideoMetadata(video.id);
							if (existing && existing.isIndexed) {
								console.log(`Skipping already indexed video: ${video.id}`);
								batch.videosProcessed += 1;
								return;
							}
						}

						const aagVideoData = await this.ConvertYouTubeVideoToAAGFormat(video);
						const result = await this.IndexVideoMetadata(aagVideoData);
						batch.videosProcessed += 1;

						if (result.success) {
							batch.videosSuccessful += 1;
						} else {
							batch.videosFailed += 1;
							batch.errors.push(`Video ${result.videoId}: ${result.error || result.message}`);
						}
					} catch (error) {
						batch.videosProcessed += 1;
						batch.videosFailed += 1;
						const errorMsg = error instanceof Error ? error.message : this.UNKNOWN_ERROR_MESSAGE;
						batch.errors.push(`Video ${video.id}: ${errorMsg}`);
					}
				});

				await Promise.all(batchPromises);

				await this.UpdateIndexingBatch(batchId, {
					videosProcessed: batch.videosProcessed,
					videosSuccessful: batch.videosSuccessful,
					videosFailed: batch.videosFailed,
					errors: batch.errors
				});

				if (batchIndex < batches.length - 1) {
					await this.delay(2000);
				}
			}, Promise.resolve());

			batch.endTime = new Date();
			batch.status = batch.videosFailed === 0 ? 'completed' : 'failed';

			await this.UpdateIndexingBatch(batchId, {
				endTime: batch.endTime,
				status: batch.status,
				videosProcessed: batch.videosProcessed,
				videosSuccessful: batch.videosSuccessful,
				videosFailed: batch.videosFailed,
				errors: batch.errors
			});

			console.log(`Completed indexing batch ${batchId}: ${batch.videosSuccessful}/${batch.videosProcessed} successful`);

			return batch;
		} catch (error) {
			console.error(`Failed to index playlist ${playlistId}:`, error);

			batch.endTime = new Date();
			batch.status = 'failed';
			batch.errors.push(error instanceof Error ? error.message : this.UNKNOWN_ERROR_MESSAGE);

			await this.UpdateIndexingBatch(batchId, {
				endTime: batch.endTime,
				status: batch.status,
				errors: batch.errors
			});

			throw error;
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

	static async SaveIndexingBatch(batch: IAAGIndexingBatch): Promise<void> {
		await this.aagIndexingBatchCollectionRef().doc(batch.batchId).set(batch);
	}

	static async UpdateIndexingBatch(batchId: string, updates: Partial<IAAGIndexingBatch>): Promise<void> {
		await this.aagIndexingBatchCollectionRef().doc(batchId).set(updates, { merge: true });
	}

	static async GetIndexingBatch(batchId: string): Promise<IAAGIndexingBatch | null> {
		const doc = await this.aagIndexingBatchCollectionRef().doc(batchId).get();
		return doc.exists ? (doc.data() as IAAGIndexingBatch) : null;
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

	private static async ProcessVideoTranscriptForConsolidated(
		videoData: IAAGVideoData
	): Promise<{ language: string; captions: Array<{ start: number; dur: number; text: string }> } | undefined> {
		if (!videoData.captions || videoData.captions.length === 0) {
			console.log(`No captions found for video ${videoData.id}`);
			return undefined;
		}

		const captionsArray = videoData.captions;
		console.log(`Processing ${captionsArray.length} captions for video ${videoData.id}`);

		if (captionsArray.length === 0) {
			console.log(`Captions array is empty for video ${videoData.id}`);
			return undefined;
		}

		interface RawCaption {
			start?: number;
			dur?: number;
			text?: string;
		}

		const captions = captionsArray.map((c: RawCaption) => ({
			start: c.start || 0,
			dur: c.dur || 0,
			text: c.text || ''
		}));

		console.log(`Processed transcript for video ${videoData.id}: ${captions.length} captions`);

		return {
			language: 'en',
			captions
		};
	}

	private static async ProcessVideoChaptersForConsolidated(
		videoData: IAAGVideoData,
		transcript?: { language: string; captions: Array<{ start: number; dur: number; text: string }> }
	): Promise<Array<{ id: string; title: string; startTime: number; endTime: number; description?: string }>> {
		if (!videoData.chapters || videoData.chapters.length === 0) {
			return [];
		}

		const chapters: Array<{ id: string; title: string; startTime: number; endTime: number; description?: string }> = [];

		videoData.chapters.forEach((currentChapter, index) => {
			if (!currentChapter || typeof currentChapter.title !== 'string') {
				return;
			}

			const nextChapter = videoData.chapters && videoData.chapters[index + 1];

			let chapterText = '';
			if (transcript && transcript.captions) {
				const startTime = currentChapter.start || 0;
				const endTime = nextChapter ? nextChapter.start || 0 : Infinity;
				const chapterCaptions = transcript.captions.filter((cap) => cap.start >= startTime && cap.start < endTime);
				chapterText = chapterCaptions.map((cap) => cap.text).join(' ');
			}

			chapters.push({
				id: this.generateId(),
				title: currentChapter.title || 'Untitled Chapter',
				startTime: currentChapter.start || 0,
				endTime: nextChapter ? nextChapter.start || 0 : 0,
				description: chapterText.substring(0, 500)
			});
		});

		return chapters;
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
						const videoPublishedAt = new Date(video.publishedAt);
						if (!existingMetadata.updatedAt || videoPublishedAt > existingMetadata.updatedAt) {
							const aagVideoData = await this.ConvertYouTubeVideoToAAGFormat(video);
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

	private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
		const chunks: T[][] = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			chunks.push(array.slice(i, i + chunkSize));
		}
		return chunks;
	}

	private static delay(ms: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	private static generateId(): string {
		return `aag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
