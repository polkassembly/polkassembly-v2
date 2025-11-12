// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import type { IAAGVideoData } from '@/_shared/types';
import { useYouTubeData } from '@/hooks/useYouTubeData';
import { useYouTubeChapters } from '@/hooks/useYouTubeChapters';
import { useToast } from '@/hooks/useToast';
import { ENotificationStatus } from '@/_shared/types';
import { Button } from '@/app/_shared-components/Button';
import { Calendar, Clock, Eye, Share2 } from 'lucide-react';
import PolkadotLogo from '@/_assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@/_assets/parachain-logos/kusama-logo.gif';
import { AAG_YOUTUBE_PLAYLIST_URL } from '@/_shared/_constants/AAGPlaylist';
import RequestToPresentModal from '../Components/RequestToPresentModal';
import AAGCard from '../Components/AAGCard';
import VideoList from '../Components/VideoList';

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

	const network = currentVideo
		? (() => {
				const date = new Date(currentVideo.publishedAt);
				const day = date.getUTCDay();
				if (day === 2) return 'kusama';
				if (day === 5) return 'polkadot';
				return null;
			})()
		: null;

	const { data: playlistData } = useYouTubeData({
		playlistUrl: AAG_YOUTUBE_PLAYLIST_URL
	});

	const {
		data: chaptersData,
		loading: chaptersLoading,
		error: chaptersError
	} = useYouTubeChapters({
		videoUrl: currentVideo?.url,
		enabled: Boolean(currentVideo?.url)
	});

	useEffect(() => {
		if (playlistData?.videos && videoId) {
			const video = playlistData.videos.find((v: IAAGVideoData) => v.id === videoId);
			setCurrentVideo(video || null);
		}
	}, [playlistData, videoId]);

	const chapters = chaptersData?.chapters || [];

	const suggestedVideos = playlistData?.videos?.filter((v: IAAGVideoData) => v.id !== videoId)?.slice(0, 5) || [];

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

	if (!currentVideo) {
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

			<div className='mx-auto max-w-7xl p-6'>
				<div className='flex flex-col gap-6 lg:flex-row'>
					<div className='flex flex-1 flex-col'>
						<div className='flex flex-col overflow-hidden rounded-lg border border-border_grey bg-bg_modal shadow-sm'>
							<div className='relative aspect-video bg-bg_modal'>
								<iframe
									src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&rel=0&origin=${window.location.origin}`}
									title={currentVideo.title}
									className='absolute inset-0 h-full w-full'
									allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
									allowFullScreen
								/>
							</div>

							<div className='p-6'>
								<div className='mb-4 flex items-start justify-between'>
									<div className='flex-1'>
										<h1 className='mb-2 text-2xl font-bold text-text_primary'>{currentVideo.title}</h1>
									</div>

									<div className='ml-4 flex items-center gap-2'>
										<Button className='rounded-full'>View Agenda</Button>
										<Button
											variant='ghost'
											size='icon'
											className='rounded-lg border border-border_grey bg-network_dropdown_bg p-2'
											onClick={handleShare}
											title='Share video'
										>
											<Share2 className='h-4 w-4 text-wallet_btn_text' />
										</Button>
									</div>
								</div>

								<div className='rounded-lg bg-page_background p-4'>
									<div className='mb-4 flex flex-wrap items-center gap-4 text-sm text-text_primary'>
										<span className='flex items-center gap-1'>
											<Clock className='h-3.5 w-3.5' />
											{currentVideo.duration}
										</span>
										<span className='flex items-center gap-1'>
											<Calendar className='h-3.5 w-3.5' />
											{currentVideo.date}
										</span>
										{currentVideo.viewCount && (
											<span className='flex items-center gap-1'>
												<Eye className='h-3.5 w-3.5' />
												{parseInt(currentVideo.viewCount, 10).toLocaleString()} views
											</span>
										)}
										{network && (
											<div className='flex items-center gap-2'>
												<Image
													src={network === 'polkadot' ? PolkadotLogo : KusamaLogo}
													alt={network === 'polkadot' ? 'Polkadot' : 'Kusama'}
													width={20}
													height={20}
													className='h-5 w-5 rounded-full'
												/>
												<span className='text-xs capitalize text-text_primary'>{network}</span>
											</div>
										)}
									</div>

									{currentVideo.description && (
										<div className='max-h-48 overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-wallet_btn_text'>{currentVideo.description}</div>
									)}
								</div>
							</div>
						</div>
					</div>

					<div className='flex w-full flex-col lg:w-[350px]'>
						<div className='overflow-auto rounded-lg border border-border_grey bg-bg_modal p-4 shadow-sm'>
							<h2 className='mb-4 flex items-center text-lg font-semibold text-text_primary'>
								Chapters
								{chaptersLoading && <div className='ml-2 h-4 w-4 animate-spin rounded-full border-b-2 border-bar_chart_purple' />}
							</h2>

							{chaptersLoading ? (
								<div className='space-y-2'>
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className='bg-bg_grey h-16 animate-pulse rounded-lg'
										/>
									))}
								</div>
							) : chaptersError ? (
								<div className='rounded-lg border p-3'>
									<p className='text-sm text-toast_warning_text'>Failed to load chapters: {chaptersError}</p>
								</div>
							) : chapters.length > 0 ? (
								<div className='max-h-[450px] space-y-2 overflow-auto'>
									{chapters.map((chapter) => (
										<button
											key={chapter.id}
											type='button'
											onClick={() => handleChapterClick(chapter.id, chapter.start)}
											className={`w-full rounded-lg p-3 text-left transition-colors ${
												activeChapter === chapter.id ? 'border border-bg_light_pink bg-border_grey/60' : 'border border-transparent hover:bg-bg_light_pink'
											}`}
										>
											<div className='flex items-start justify-between'>
												<div className='min-w-0 flex-1'>
													<div className='mb-1 flex items-center gap-2'>
														<span className='rounded bg-border_blue/15 px-2 py-1 font-mono text-xs text-border_blue'>{chapter.timestamp}</span>
													</div>
													<h3 className='mb-1 text-sm font-medium text-text_primary'>{chapter.title}</h3>
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

				<div className='mt-6'>
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
