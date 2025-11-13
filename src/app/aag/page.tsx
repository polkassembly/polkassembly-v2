// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import type { IAAGVideoData } from '@/_shared/types';
import { useYouTubeData } from '@/hooks/useYouTubeData';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import GovernanceCard from './Components/GovernanceCard';
import VideoList from './Components/VideoList';
import AAGCard from './Components/AAGCard';
import { AAG_YOUTUBE_PLAYLIST_ID } from '../api/_api-constants/apiEnvVars';

function AAG() {
	const {
		data: playlistData,
		loading,
		error
	} = useYouTubeData({
		playlistId: AAG_YOUTUBE_PLAYLIST_ID,
		maxVideos: 10
	});

	const refinedVideos = playlistData?.videos?.filter((video: IAAGVideoData) => video.duration !== '00:00') || [];

	const featuredVideos = refinedVideos.slice(0, 3);
	const listVideos = refinedVideos.slice(3);

	return (
		<div className='min-h-screen bg-page_background text-text_primary'>
			<AAGCard />
			<div className='mx-auto max-w-6xl px-4'>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3'>
					{loading ? (
						<>
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className='overflow-hidden rounded-lg border border-border_grey bg-bg_modal shadow-sm'
								>
									<Skeleton className='aspect-video w-full' />
									<div className='space-y-3 p-4'>
										<Skeleton className='h-5 w-3/4' />
										<div className='flex gap-4'>
											<Skeleton className='h-4 w-20' />
											<Skeleton className='h-4 w-16' />
										</div>
									</div>
								</div>
							))}
						</>
					) : error ? (
						<div className='col-span-full flex justify-center py-8'>
							<div className='text-toast_warning_text'>Error loading videos: {error}</div>
						</div>
					) : (
						featuredVideos.map((video: IAAGVideoData) => (
							<GovernanceCard
								key={video.id}
								title={video.title}
								date={video.date}
								duration={video.duration}
								thumbnail={video.thumbnail}
								url={video.url}
								videoId={video.id}
								referenda={video.referenda}
								publishedAt={video.publishedAt}
								agendaUrl={video.agendaUrl}
							/>
						))
					)}
				</div>
				<VideoList
					videos={listVideos}
					loading={loading}
					error={error}
				/>
			</div>
		</div>
	);
}

export default AAG;
