// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import type { IAAGVideoData } from '@/_shared/types';
import { useYouTubeData } from '@/hooks/useYouTubeData';
import { useVideoData } from '@/hooks/useVideoData';
import { useTranscript } from '@/hooks/useTranscript';
import { useToast } from '@/hooks/useToast';
import { ENotificationStatus } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { Calendar, Clock, Eye, Share2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import PolkadotLogo from '@/_assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@/_assets/parachain-logos/kusama-logo.gif';
import { AAG_YOUTUBE_PLAYLIST_URL } from '@/_shared/_constants/AAGPlaylist';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import { Separator } from '@/app/_shared-components/Separator';
import RequestToPresentModal from '../Components/RequestToPresentModal';
import AAGCard from '../Components/AAGCard';
import VideoList from '../Components/VideoList';

interface TranscriptSegment {
	text: string;
	offset: number;
	duration: number;
}

interface TranscriptSectionProps {
	transcript: TranscriptSegment[];
	loading?: boolean;
}

function TranscriptSection({ transcript, loading }: TranscriptSectionProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const initialDisplayCount = 10;
	const displayTranscript = isExpanded ? transcript : transcript.slice(0, initialDisplayCount);

	const formatTimestamp = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	if (loading) {
		return (
			<div>
				<div className='mb-3 flex items-center gap-2'>
					<div className='bg-bg_grey h-4 w-20 animate-pulse rounded' />
				</div>
				<div className='space-y-2'>
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className='bg-bg_grey h-8 animate-pulse rounded'
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className='rounded-lg p-4'>
			<div className='mb-3 flex items-center justify-between'>
				<h3 className='text-sm font-semibold text-text_primary'>Transcript</h3>
				<span className='text-xs text-wallet_btn_text'>{transcript.length} segments</span>
			</div>
			<div className='max-h-64 space-y-1.5 overflow-auto'>
				{displayTranscript.map((segment) => (
					<div
						key={`${segment.offset}-${segment.text.substring(0, 20)}`}
						className='hover:bg-bg_grey flex gap-3 rounded p-1.5'
					>
						<span className='min-w-[45px] text-xs font-medium text-bar_chart_purple'>{formatTimestamp(segment.offset)}</span>
						<p className='text-xs leading-relaxed text-wallet_btn_text'>{segment.text}</p>
					</div>
				))}
			</div>
			{transcript.length > initialDisplayCount && (
				<button
					type='button'
					onClick={() => setIsExpanded(!isExpanded)}
					className='bg-bg_grey mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-border_grey px-3 py-2 text-xs font-medium text-text_primary transition-colors hover:bg-opacity-80'
				>
					{isExpanded ? (
						<>
							<span>View Less</span>
							<ChevronUp className='h-3 w-3' />
						</>
					) : (
						<>
							<span>View More ({transcript.length - initialDisplayCount} more)</span>
							<ChevronDown className='h-3 w-3' />
						</>
					)}
				</button>
			)}
		</div>
	);
}

function VideoViewPage() {
	const params = useParams();
	const videoId = params?.id as string;
	const pathname = usePathname();
	const path = videoId ? `/aag/${videoId}` : pathname;
	const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${path}` : '';
	const { toast } = useToast();

	const [currentVideo, setCurrentVideo] = useState<IAAGVideoData | null>(null);
	const [activeChapter, setActiveChapter] = useState('1');
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { data: playlistData } = useYouTubeData({
		playlistUrl: AAG_YOUTUBE_PLAYLIST_URL
	});

	const { data: videoData, loading: videoLoading } = useVideoData({
		videoId: videoId || undefined,
		enabled: Boolean(videoId)
	});

	const { data: transcriptData, loading: transcriptLoading } = useTranscript({
		videoId: videoId || undefined,
		enabled: Boolean(videoId),
		generateSummary: true
	});

	const network = currentVideo
		? (() => {
				const date = new Date(currentVideo.publishedAt);
				const day = date.getUTCDay();
				if (day === 2) return 'kusama';
				if (day === 5) return 'polkadot';
				return null;
			})()
		: null;

	useEffect(() => {
		if (playlistData?.videos && videoId) {
			const video = playlistData.videos.find((v: IAAGVideoData) => v.id === videoId);
			if (video && videoData) {
				setCurrentVideo({
					...video,
					agendaUrl: videoData.agendaUrl,
					chapters: videoData.chapters
				});
			} else if (video) {
				setCurrentVideo(video);
			}
		}
	}, [playlistData, videoId, videoData]);

	const chapters = videoData?.chapters || currentVideo?.chapters || [];
	const agendaUrl = videoData?.agendaUrl || currentVideo?.agendaUrl;

	const suggestedVideos = playlistData?.videos?.filter((v: IAAGVideoData) => v.id !== videoId)?.slice(0, 5) || [];

	const handleAgendaClick = () => {
		if (agendaUrl) {
			window.open(agendaUrl, '_blank', 'noopener,noreferrer');
		}
	};

	const handleShare = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			toast({
				status: ENotificationStatus.SUCCESS,
				title: 'Link copied!',
				description: 'Video link has been copied to clipboard'
			});
		} catch {
			toast({
				status: ENotificationStatus.ERROR,
				title: 'Failed to copy link',
				description: 'Could not copy link to clipboard'
			});
		}
	};

	const handleChapterClick = (chapterId: string, startTime?: number) => {
		setActiveChapter(chapterId);

		if (startTime !== undefined) {
			const iframe = document.querySelector('iframe');
			if (iframe && iframe.contentWindow) {
				const message = {
					event: 'command',
					func: 'seekTo',
					args: [startTime, true]
				};
				iframe.contentWindow.postMessage(JSON.stringify(message), '*');
			}

			setActiveChapter(chapterId);
		}
	};

	if (!currentVideo || videoLoading) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<div className='text-center'>
					<div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-bg_pink' />
					<p className='text-text_primary'>Loading video...</p>
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
									src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
									title={currentVideo.title}
									className='absolute inset-0 h-full w-full'
									allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
									allowFullScreen
								/>
							</div>

							<div className='p-3 sm:p-4 md:p-6'>
								<div className='mb-4 flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
									<h1 className='break-words text-lg font-bold leading-tight text-text_primary sm:text-xl md:text-2xl'>{currentVideo.title}</h1>

									<div className='flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap'>
										{agendaUrl && (
											<Button
												className='flex-1 rounded-full text-sm sm:flex-none'
												onClick={handleAgendaClick}
											>
												View Agenda
											</Button>
										)}
										<Button
											variant='ghost'
											size='icon'
											className='rounded-lg border border-border_grey bg-network_dropdown_bg p-2 sm:p-2.5'
											onClick={handleShare}
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
											{currentVideo.duration}
										</span>

										<span className='flex shrink-0 items-center gap-1'>
											<Calendar className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
											{currentVideo.date}
										</span>

										{currentVideo.viewCount && (
											<span className='flex shrink-0 items-center gap-1'>
												<Eye className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
												{parseInt(currentVideo.viewCount, 10).toLocaleString()} views
											</span>
										)}

										{network && (
											<div className='flex shrink-0 items-center gap-2'>
												<Image
													src={network === 'polkadot' ? PolkadotLogo : KusamaLogo}
													alt={network === 'polkadot' ? 'Polkadot' : 'Kusama'}
													width={20}
													height={20}
													className='h-4 w-4 rounded-full sm:h-5 sm:w-5'
												/>
												<span className='text-[11px] capitalize text-text_primary sm:text-xs'>{network}</span>
											</div>
										)}
									</div>
									{transcriptData?.summary && transcriptData?.transcript && transcriptData.transcript.length > 0 && (
										<div>
											<div>
												<div className='mb-2 flex items-center gap-2'>
													<Sparkles className='h-4 w-4 text-bar_chart_purple' />
													<h3 className='text-sm font-semibold text-text_primary'>AI Summary</h3>
												</div>
												<MarkdownViewer
													markdown={transcriptData.summary}
													truncate
												/>
											</div>
											<Separator className='my-4' />

											<TranscriptSection
												transcript={transcriptData.transcript}
												loading={transcriptLoading}
											/>
										</div>
									)}
									{!transcriptData?.summary && currentVideo.description && (
										<div className='max-h-40 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-wallet_btn_text sm:max-h-48 sm:text-sm md:max-h-56'>
											{currentVideo.description}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					<div className='flex w-full flex-col lg:w-[350px]'>
						<div className='max-h-96 overflow-auto rounded-lg border border-border_grey bg-bg_modal p-3 shadow-sm md:p-4 lg:max-h-none'>
							<h2 className='mb-3 flex items-center text-base font-semibold text-text_primary md:mb-4 md:text-lg'>
								Chapters
								{videoLoading && <div className='ml-2 h-3 w-3 animate-spin rounded-full border-b-2 border-bar_chart_purple md:h-4 md:w-4' />}
							</h2>

							{videoLoading ? (
								<div className='space-y-2'>
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className='bg-bg_grey h-12 animate-pulse rounded-lg md:h-16'
										/>
									))}
								</div>
							) : chapters.length > 0 ? (
								<div className='max-h-64 space-y-2 overflow-auto md:max-h-[450px]'>
									{chapters.map((chapter) => (
										<button
											key={chapter.id}
											type='button'
											onClick={() => handleChapterClick(chapter.id, chapter.start)}
											className={`w-full rounded-lg p-2 text-left transition-colors md:p-3 ${
												activeChapter === chapter.id ? 'border border-bg_light_pink bg-border_grey/60' : 'border border-transparent hover:bg-bg_light_pink'
											}`}
										>
											<div className='flex items-start justify-between'>
												<div className='min-w-0 flex-1'>
													<div className='mb-1 flex items-center gap-2'>
														<span className='rounded bg-border_blue/15 px-1.5 py-0.5 font-mono text-xs text-border_blue md:px-2 md:py-1'>{chapter.timestamp}</span>
													</div>
													<h3 className='mb-1 text-xs font-medium text-text_primary md:text-sm'>{chapter.title}</h3>
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
					<VideoList videos={suggestedVideos} />
				</div>
			</div>

			<RequestToPresentModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</div>
	);
}

export default VideoViewPage;
