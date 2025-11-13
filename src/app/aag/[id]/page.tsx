// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import type { IAAGVideoData } from '@/_shared/types';
import { useYouTubeData, useVideoData, useTranscript } from '@/hooks/useYouTubeData';
import { useToast } from '@/hooks/useToast';
import { ENetwork, ENotificationStatus } from '@/_shared/types';
import { getNetworkFromDate } from '@/_shared/_utils/getNetworkFromDate';
import { Button } from '@/app/_shared-components/Button';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Calendar, Clock, Eye, Share2, Sparkles } from 'lucide-react';
import PolkadotLogo from '@/_assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@/_assets/parachain-logos/kusama-logo.gif';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import { Separator } from '@/app/_shared-components/Separator';
import { AAG_YOUTUBE_PLAYLIST_ID } from '@/app/api/_api-constants/apiEnvVars';
import RequestToPresentModal from '../Components/RequestToPresentModal';
import AAGCard from '../Components/AAGCard';
import VideoList from '../Components/VideoList';
import TranscriptSection from '../Components/TranscriptSection';

const SUGGESTED_VIDEOS_LIMIT = 5;

function VideoDetailPage() {
	const routeParams = useParams();
	const currentVideoId = routeParams?.id as string;
	const currentPathname = usePathname();
	const videoDetailPath = currentVideoId ? `/aag/${currentVideoId}` : currentPathname;
	const videoShareUrl = typeof window !== 'undefined' ? `${window.location.origin}${videoDetailPath}` : '';
	const { toast: showToast } = useToast();

	const [selectedVideo, setSelectedVideo] = useState<IAAGVideoData | null>(null);
	const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);

	const { data: playlistDataFromYouTube } = useYouTubeData({
		playlistId: AAG_YOUTUBE_PLAYLIST_ID
	});

	const { data: videoMetadata } = useVideoData({
		videoId: currentVideoId || undefined,
		enabled: Boolean(currentVideoId)
	});

	const { data: videoTranscriptData, loading: isTranscriptLoading } = useTranscript({
		videoId: currentVideoId || undefined,
		enabled: Boolean(currentVideoId),
		generateSummary: true
	});

	const videoAssociatedNetwork = selectedVideo ? getNetworkFromDate(selectedVideo.publishedAt) : null;

	useEffect(() => {
		if (playlistDataFromYouTube?.videos && currentVideoId) {
			const matchingVideoFromPlaylist = playlistDataFromYouTube.videos.find((videoItem: IAAGVideoData) => videoItem.id === currentVideoId);
			if (matchingVideoFromPlaylist) {
				setSelectedVideo({
					...matchingVideoFromPlaylist,
					agendaUrl: videoMetadata?.agendaUrl || matchingVideoFromPlaylist.agendaUrl,
					chapters: videoMetadata?.chapters || matchingVideoFromPlaylist.chapters || []
				});
			}
		}
	}, [playlistDataFromYouTube, currentVideoId, videoMetadata]);

	const videoChaptersList = videoMetadata?.chapters || selectedVideo?.chapters || [];
	const videoAgendaUrl = videoMetadata?.agendaUrl || selectedVideo?.agendaUrl;
	const relatedVideosList = playlistDataFromYouTube?.videos?.filter((videoItem: IAAGVideoData) => videoItem.id !== currentVideoId)?.slice(0, SUGGESTED_VIDEOS_LIMIT) || [];

	const handleVideoAgendaClick = () => {
		if (videoAgendaUrl) {
			window.open(videoAgendaUrl, '_blank', 'noopener,noreferrer');
		}
	};

	const handleVideoShare = async () => {
		try {
			await navigator.clipboard.writeText(videoShareUrl);
			showToast({
				status: ENotificationStatus.SUCCESS,
				title: 'Link copied!',
				description: 'Video link has been copied to clipboard'
			});
		} catch {
			showToast({
				status: ENotificationStatus.ERROR,
				title: 'Failed to copy link',
				description: 'Could not copy link to clipboard'
			});
		}
	};

	const handleVideoChapterClick = (chapterStartTime?: number) => {
		if (chapterStartTime !== undefined) {
			const youTubeIframe = document.querySelector('iframe');
			if (youTubeIframe?.contentWindow) {
				youTubeIframe.contentWindow.postMessage(
					JSON.stringify({
						event: 'command',
						func: 'seekTo',
						args: [chapterStartTime, true]
					}),
					'*'
				);
			}
		}
	};

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

			<div className='mx-auto max-w-7xl p-4 md:p-6'>
				<div className='flex flex-col gap-6 lg:flex-row'>
					<div className='flex w-full flex-1 flex-col'>
						<div className='flex flex-col overflow-hidden rounded-lg border border-border_grey bg-bg_modal shadow-sm'>
							<div className='relative aspect-[16/9] w-full bg-bg_modal sm:aspect-video'>
								<iframe
									src={`https://www.youtube.com/embed/${currentVideoId}?enablejsapi=1&autoplay=1&rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
									title={selectedVideo.title}
									className='absolute inset-0 h-full w-full'
									allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
									allowFullScreen
								/>
							</div>

							<div className='p-3 sm:p-4 md:p-6'>
								<div className='mb-4 flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
									<h1 className='break-words text-lg font-bold leading-tight text-text_primary sm:text-xl md:text-2xl'>{selectedVideo.title}</h1>

									<div className='flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap'>
										{videoAgendaUrl && (
											<Button
												className='flex-1 rounded-full text-sm sm:flex-none'
												onClick={handleVideoAgendaClick}
											>
												View Agenda
											</Button>
										)}
										<Button
											variant='ghost'
											size='icon'
											className='rounded-lg border border-border_grey bg-network_dropdown_bg p-2 sm:p-2.5'
											onClick={handleVideoShare}
											title='Share video'
										>
											<Share2 className='h-4 w-4 text-wallet_btn_text' />
										</Button>
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
											{selectedVideo.date}
										</span>

										{selectedVideo.viewCount && (
											<span className='flex shrink-0 items-center gap-1'>
												<Eye className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
												{parseInt(selectedVideo.viewCount, 10).toLocaleString()} views
											</span>
										)}

										{videoAssociatedNetwork && (
											<div className='flex shrink-0 items-center gap-2'>
												<Image
													src={videoAssociatedNetwork === ENetwork.POLKADOT ? PolkadotLogo : KusamaLogo}
													alt={videoAssociatedNetwork === ENetwork.POLKADOT ? ENetwork.POLKADOT : ENetwork.KUSAMA}
													width={20}
													height={20}
													className='h-4 w-4 rounded-full sm:h-5 sm:w-5'
												/>
												<span className='text-[11px] capitalize text-text_primary sm:text-xs'>{videoAssociatedNetwork}</span>
											</div>
										)}
									</div>

									{isTranscriptLoading ? (
										<div className='space-y-4'>
											<div className='space-y-2'>
												<div className='mb-2 flex items-center gap-2'>
													<Sparkles className='h-4 w-4 text-bar_chart_purple' />
													<Skeleton className='h-4 w-24' />
												</div>
												<div className='space-y-2'>
													{[1, 2, 3, 4].map((i) => (
														<Skeleton
															key={i}
															className='h-4 w-full'
														/>
													))}
												</div>
											</div>
											<Separator className='my-4' />
											<div className='space-y-2'>
												<Skeleton className='h-4 w-20' />
												{[1, 2, 3].map((i) => (
													<Skeleton
														key={i}
														className='h-8'
													/>
												))}
											</div>
										</div>
									) : videoTranscriptData?.transcript?.length ? (
										<div>
											{videoTranscriptData.summary ? (
												<div>
													<div className='mb-2 flex items-center gap-2'>
														<Sparkles className='h-4 w-4 text-bar_chart_purple' />
														<h3 className='text-sm font-semibold text-text_primary'>AI Summary</h3>
													</div>
													<MarkdownViewer
														markdown={videoTranscriptData.summary}
														truncate
													/>
													<Separator className='my-4' />
												</div>
											) : null}
											<TranscriptSection
												transcript={videoTranscriptData.transcript}
												loading={false}
											/>
										</div>
									) : null}
								</div>
							</div>
						</div>
					</div>

					<div className='flex w-full flex-col lg:w-[350px]'>
						<div className='max-h-96 overflow-auto rounded-lg border border-border_grey bg-bg_modal p-3 shadow-sm md:p-4 lg:max-h-none'>
							<h2 className='mb-3 text-base font-semibold text-text_primary md:mb-4 md:text-lg'>Chapters</h2>

							{videoChaptersList.length > 0 ? (
								<div className='max-h-64 space-y-2 overflow-auto md:max-h-[450px]'>
									{videoChaptersList.map((chapterData) => (
										<button
											key={chapterData.id}
											type='button'
											onClick={() => handleVideoChapterClick(chapterData.start)}
											className='w-full rounded-lg border border-transparent p-2 text-left transition-colors hover:bg-bg_light_pink md:p-3'
										>
											<div className='flex items-start justify-between'>
												<div className='min-w-0 flex-1'>
													<div className='mb-1 flex items-center gap-2'>
														<span className='rounded bg-border_blue/15 px-1.5 py-0.5 font-mono text-xs text-border_blue md:px-2 md:py-1'>{chapterData.timestamp}</span>
													</div>
													<h3 className='mb-1 text-xs font-medium text-text_primary md:text-sm'>{chapterData.title}</h3>
												</div>
											</div>
										</button>
									))}
								</div>
							) : (
								<p className='text-sm text-text_primary'>No chapters available.</p>
							)}
						</div>
					</div>
				</div>

				<div className='mt-4 md:mt-6'>
					<VideoList videos={relatedVideosList} />
				</div>
			</div>

			<RequestToPresentModal
				isOpen={isPresentationModalOpen}
				onClose={() => setIsPresentationModalOpen(false)}
			/>
		</div>
	);
}

export default VideoDetailPage;
