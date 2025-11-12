// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import type { IAAGVideoData } from '@/_shared/types';
import { useYouTubeData } from '@/hooks/useYouTubeData';
import { AAG_YOUTUBE_PLAYLIST_URL } from '@/_shared/_constants/AAGPlaylist';
import GovernanceCard from './Components/GovernanceCard';
import VideoList from './Components/VideoList';
import AAGCard from './Components/AAGCard';

function AAG() {
	const {
		data: playlistData,
		loading,
		error
	} = useYouTubeData({
		playlistUrl: AAG_YOUTUBE_PLAYLIST_URL,
		maxVideos: 10
	});

	const featuredVideos = playlistData?.videos?.slice(0, 3) || [];
	const listVideos = playlistData?.videos?.slice(3) || [];

	return (
		<div className='min-h-screen bg-page_background text-text_primary'>
			<AAGCard />
			<div className='mx-auto max-w-6xl px-4'>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3'>
					{loading && (
						<div className='col-span-full flex justify-center py-8'>
							<div className='text-gray-500'>Loading YouTube playlist...</div>
						</div>
					)}
					{error && (
						<div className='col-span-full flex justify-center py-8'>
							<div className='text-toast_warning_text'>Error loading videos: {error}</div>
						</div>
					)}
					{!loading &&
						!error &&
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
						))}
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
