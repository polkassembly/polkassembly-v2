// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { ENetwork, type IAAGVideoSummary } from '@/_shared/types';
import { getNetworkFromDate } from '@/_shared/_utils/getNetworkFromDate';
import { Button } from '@/app/_shared-components/Button';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Calendar, Clock, Eye, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import PolkadotLogo from '@/_assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@/_assets/parachain-logos/kusama-logo.gif';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import { Separator } from '@/app/_shared-components/Separator';
import { useAAGVideoById, useAAGVideos, useYouTubePlayer } from '@/hooks/useAAGVideos';
import RequestToPresentModal from '../Components/RequestToPresentModal';
import AAGCard from '../Components/AAGCard';
import VideoList from '../Components/VideoList';
import TranscriptSection from '../Components/TranscriptSection';

const SUGGESTED_VIDEOS_LIMIT = 5;

function formatTime(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function VideoDetailPage() {
	const t = useTranslations('AAG');
	const routeParams = useParams();
	const currentVideoId = routeParams?.id as string;

	const [selectedVideo, setSelectedVideo] = useState<IAAGVideoSummary | null>(null);
	const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
	const chaptersContainerRef = useRef<HTMLDivElement>(null);
	const activeChapterRef = useRef<HTMLButtonElement>(null);

	const { currentTime: currentVideoTime, seekToTime } = useYouTubePlayer(currentVideoId || '');

	const { data: videoMetadata } = useAAGVideoById({
		videoId: currentVideoId || '',
		enabled: Boolean(currentVideoId)
	});

	const { data: relatedVideosData } = useAAGVideos({
		limit: SUGGESTED_VIDEOS_LIMIT + 1
	});

	const videoAssociatedNetwork = useMemo(() => {
		return selectedVideo ? getNetworkFromDate(selectedVideo.publishedAt) : null;
	}, [selectedVideo]);

	const transcriptData = useMemo(() => {
		if (videoMetadata?.transcript?.captions) {
			return {
				transcript: videoMetadata.transcript.captions.map((caption) => ({
					text: caption.text,
					offset: caption.start,
					duration: caption.dur
				})),
				summary: videoMetadata.aiSummary || undefined
			};
		}
		return null;
	}, [videoMetadata?.transcript, videoMetadata?.aiSummary]);

	const isLoadingTranscript = useMemo(() => {
		return !videoMetadata;
	}, [videoMetadata]);

	const videoChaptersList = useMemo(() => {
		return (
			videoMetadata?.chapters?.map((chapter) => ({
				id: chapter.id,
				title: chapter.title,
				start: chapter.startTime,
				timestamp: formatTime(chapter.startTime),
				description: chapter.description,
				duration: chapter.endTime > 0 ? formatTime(chapter.endTime - chapter.startTime) : undefined
			})) || []
		);
	}, [videoMetadata?.chapters]);

	const videoAgendaUrl = useMemo(() => {
		return videoMetadata?.agendaUrl || selectedVideo?.agendaUrl;
	}, [videoMetadata?.agendaUrl, selectedVideo?.agendaUrl]);

	const relatedVideosList = useMemo(() => {
		return relatedVideosData?.items?.filter((videoItem: IAAGVideoSummary) => videoItem.id !== currentVideoId)?.slice(0, SUGGESTED_VIDEOS_LIMIT) || [];
	}, [relatedVideosData?.items, currentVideoId]);

	const activeChapterIndex = useMemo(() => {
		if (!videoChaptersList.length) {
			return -1;
		}

		if (currentVideoTime <= 0) {
			return 0;
		}

		let foundIndex = -1;
		for (let i = 0; i < videoChaptersList.length; i += 1) {
			const currentChapter = videoChaptersList[i];
			const nextChapter = videoChaptersList[i + 1];

			if (currentVideoTime >= currentChapter.start && (!nextChapter || currentVideoTime < nextChapter.start)) {
				foundIndex = i;
				break;
			}
		}

		if (foundIndex === -1 && videoChaptersList.length > 0) {
			if (currentVideoTime < videoChaptersList[0].start) {
				foundIndex = 0;
			} else {
				foundIndex = videoChaptersList.length - 1;
			}
		}

		return foundIndex;
	}, [currentVideoTime, videoChaptersList]);

	useEffect(() => {
		if (videoMetadata && currentVideoId) {
			setSelectedVideo({
				id: videoMetadata.id,
				title: videoMetadata.title,
				thumbnail: videoMetadata.thumbnail,
				duration: videoMetadata.duration,
				publishedAt: typeof videoMetadata.publishedAt === 'string' ? videoMetadata.publishedAt : videoMetadata.publishedAt?.toISOString() || new Date().toISOString(),
				url: videoMetadata.url,
				agendaUrl: videoMetadata.agendaUrl || '',
				network: videoMetadata.network,
				referenda: videoMetadata.referenda || []
			});
		}
	}, [videoMetadata, currentVideoId]);

	const handleVideoAgendaClick = useCallback(() => {
		if (videoAgendaUrl) {
			window.open(videoAgendaUrl, '_blank', 'noopener,noreferrer');
		}
	}, [videoAgendaUrl]);

	const handleVideoChapterClick = useCallback(
		(chapterStartTime?: number) => {
			if (chapterStartTime !== undefined) {
				seekToTime(chapterStartTime);
			}
		},
		[seekToTime]
	);

	useEffect(() => {
		if (!chaptersContainerRef.current || !activeChapterRef.current || activeChapterIndex < 0) return undefined;

		const scrollTimeout = setTimeout(() => {
			const container = chaptersContainerRef.current;
			const activeElement = activeChapterRef.current;
			if (!container || !activeElement) return;

			const containerRect = container.getBoundingClientRect();
			const elementRect = activeElement.getBoundingClientRect();
			const padding = 10;

			const delta = elementRect.top - containerRect.top;
			const targetTop = container.scrollTop + delta - padding;

			container.scrollTo({
				top: Math.max(0, targetTop),
				behavior: 'smooth'
			});
		}, 50);

		return () => clearTimeout(scrollTimeout);
	}, [activeChapterIndex]);

	if (!selectedVideo) {
		return (
			<div className='min-h-screen bg-page_background'>
				<AAGCard />
				<div className='mx-auto max-w-7xl p-4 md:p-6'>
					<div className='flex flex-col gap-6 lg:flex-row'>
						<div className='flex w-full flex-1 flex-col'>
							<div className='overflow-hidden rounded-lg border border-border_grey bg-bg_modal shadow-sm'>
								<Skeleton className='aspect-video w-full' />
								<div className='space-y-4 p-6'>
									<Skeleton className='h-8 w-3/4' />
									<div className='flex gap-4'>
										<Skeleton className='h-10 w-32 rounded-full' />
										<Skeleton className='h-10 w-10' />
									</div>
									<div className='space-y-3 rounded-lg bg-page_background p-4'>
										<div className='flex gap-4'>
											{[1, 2, 3].map((i) => (
												<Skeleton
													key={i}
													className='h-4 w-20'
												/>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className='w-full lg:w-[350px]'>
							<div className='rounded-lg border border-border_grey bg-bg_modal p-4'>
								<Skeleton className='mb-4 h-6 w-24' />
								<div className='space-y-2'>
									{[1, 2, 3].map((i) => (
										<Skeleton
											key={i}
											className='h-16'
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-page_background text-text_primary'>
			<AAGCard />

			<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-10'>
				<div className='flex flex-col gap-6 lg:flex-row'>
					<div className='flex w-full flex-1 flex-col'>
						<div className='flex flex-col overflow-hidden rounded-lg border border-border_grey bg-bg_modal shadow-sm'>
							<div className='relative aspect-[16/9] w-full bg-black sm:aspect-video'>
								<div
									id='youtube-player'
									className='absolute inset-0 h-full w-full'
								/>
							</div>
							<div className='p-3 sm:p-4 md:p-6'>
								<div className='mb-4 flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
									<h1 className='break-words text-lg font-bold leading-tight text-text_primary'>{selectedVideo.title}</h1>

									<div className='flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap'>
										{videoAssociatedNetwork && (
											<div className='flex shrink-0 items-center gap-2'>
												<Image
													src={videoAssociatedNetwork === ENetwork.POLKADOT ? PolkadotLogo : KusamaLogo}
													alt={videoAssociatedNetwork === ENetwork.POLKADOT ? ENetwork.POLKADOT : ENetwork.KUSAMA}
													width={20}
													height={20}
													className='h-4 w-4 rounded-full sm:h-5 sm:w-5'
												/>
											</div>
										)}
										{videoAgendaUrl && (
											<Button
												variant='ghost'
												size='icon'
												className='rounded-full border border-text_pink px-2 py-1 text-xs text-text_pink hover:bg-bg_light_pink'
												onClick={handleVideoAgendaClick}
											>
												{t('viewAgenda')}
											</Button>
										)}
									</div>
								</div>

								<div className='rounded-lg bg-page_background p-3 md:p-4'>
									<div className='mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-text_primary sm:text-sm md:mb-4 md:gap-4'>
										<span className='flex shrink-0 items-center gap-1'>
											<Clock className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
											{selectedVideo.duration}
										</span>
										<span className='flex shrink-0 items-center gap-1'>
											<Calendar className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
											{new Date(selectedVideo.publishedAt).toLocaleDateString()}
										</span>
										{videoMetadata?.viewCount && (
											<span className='flex shrink-0 items-center gap-1'>
												<Eye className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
												{videoMetadata.viewCount.toLocaleString()} {t('views')}
											</span>
										)}{' '}
									</div>

									{isLoadingTranscript ? (
										<div className='space-y-4'>
											<div className='space-y-2'>
												<div className='mb-2 flex items-center gap-2'>
													<Sparkles className='h-4 w-4 text-bar_chart_purple' />
													<Skeleton className='h-4 w-24' />
												</div>
												<div className='space-y-2'>
													{[1, 2, 3, 4, 5].map((i) => (
														<Skeleton
															key={i}
															className='h-4 w-full'
														/>
													))}
													<Skeleton className='h-4 w-3/4' />
												</div>
											</div>
											<Separator className='my-4' />
											<div className='space-y-2'>
												<div className='mb-2 flex items-center gap-2'>
													<Skeleton className='h-4 w-20' />
													<Skeleton className='h-4 w-16' />
												</div>
												{[1, 2, 3, 4].map((i) => (
													<Skeleton
														key={i}
														className='h-12 w-full'
													/>
												))}
											</div>
										</div>
									) : transcriptData?.transcript?.length ? (
										<div>
											{transcriptData.summary ? (
												<div>
													<div className='mb-2 flex items-center gap-2'>
														<Sparkles className='h-4 w-4 text-bar_chart_purple' />
														<h3 className='text-sm font-semibold text-text_primary'>{t('aiSummary')}</h3>
													</div>
													<MarkdownViewer
														markdown={transcriptData.summary}
														truncate
													/>
													<Separator className='my-4' />
												</div>
											) : null}
											<TranscriptSection
												transcript={transcriptData.transcript}
												loading={false}
												currentTime={currentVideoTime}
												onSeek={seekToTime}
											/>
										</div>
									) : null}
								</div>
							</div>
						</div>
					</div>

					<div className='flex w-full flex-col lg:w-[350px]'>
						<div className='rounded-lg border border-border_grey bg-bg_modal p-3 shadow-sm md:p-4'>
							<h2 className='mb-3 text-base font-semibold text-text_primary md:mb-4 md:text-lg'>{t('chapters')}</h2>

							{videoChaptersList.length > 0 ? (
								<div
									ref={chaptersContainerRef}
									className='max-h-64 space-y-2 overflow-y-auto overflow-x-hidden md:max-h-[450px]'
								>
									{videoChaptersList.map((chapterData, index) => {
										const isActive = index === activeChapterIndex;

										return (
											<button
												key={chapterData.id}
												type='button'
												ref={isActive ? activeChapterRef : null}
												onClick={() => handleVideoChapterClick(chapterData.start)}
												className={`w-full rounded-lg border p-2 text-left transition-colors md:p-3 ${
													isActive ? 'border-text_pink bg-bg_light_pink' : 'border-transparent hover:bg-bg_light_pink'
												}`}
											>
												<div className='flex items-start justify-between'>
													<div className='min-w-0 flex-1'>
														<div className='mb-1 flex items-center gap-2'>
															<span
																className={`rounded px-1.5 py-0.5 text-sm font-medium md:px-2 md:py-1 ${
																	isActive ? 'bg-text_pink/20 text-text_pink' : 'bg-border_blue/15 text-border_blue'
																}`}
															>
																{chapterData.timestamp || formatTime(chapterData.start)}
															</span>
														</div>
														<h3 className={`mb-1 text-xs font-bold ${isActive ? 'text-text_pink' : 'text-text_primary'}`}>{chapterData.title}</h3>
													</div>
												</div>
											</button>
										);
									})}
								</div>
							) : (
								<p className='text-sm text-text_primary'>{t('noChaptersAvailable')}</p>
							)}
						</div>
					</div>
				</div>

				<VideoList videos={relatedVideosList} />
			</div>

			<RequestToPresentModal
				isOpen={isPresentationModalOpen}
				onClose={() => setIsPresentationModalOpen(false)}
			/>
		</div>
	);
}

export default VideoDetailPage;
