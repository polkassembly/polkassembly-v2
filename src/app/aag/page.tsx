// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import type { IAAGVideoData } from '@/_shared/types';
import { useYouTubeData } from '@/hooks/useYouTubeData';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useTranslations } from 'next-intl';
import GovernanceVideoCard from './Components/GovernanceCard';
import AAGVideoListingComponent from './Components/VideoList';
import AAGCard from './Components/AAGCard';
import { AAG_YOUTUBE_PLAYLIST_ID } from '../api/_api-constants/apiEnvVars';

const FEATURED_VIDEOS_COUNT = 3;
const MAX_VIDEOS_TO_FETCH = 10;
const DURATION_FILTER_THRESHOLD = '00:00';

function AttemptsAtGovernancePage() {
	const t = useTranslations('AAG');
	const {
		data: youTubePlaylistData,
		loading: isPlaylistLoading,
		error: playlistError
	} = useYouTubeData({
		playlistId: AAG_YOUTUBE_PLAYLIST_ID,
		maxVideos: MAX_VIDEOS_TO_FETCH
	});

	const videosWithValidDuration = youTubePlaylistData?.videos?.filter((video: IAAGVideoData) => video.duration !== DURATION_FILTER_THRESHOLD) || [];

	const featuredVideosList = videosWithValidDuration.slice(0, FEATURED_VIDEOS_COUNT);
	const remainingVideosList = videosWithValidDuration.slice(FEATURED_VIDEOS_COUNT);

	return (
		<div className='min-h-screen bg-page_background text-text_primary'>
			<AAGCard />
			<div className='mx-auto max-w-6xl px-4'>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3'>
					{isPlaylistLoading ? (
						<>
							{[1, 2, 3].map((skeletonIndex) => (
								<div
									key={skeletonIndex}
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
					) : playlistError ? (
						<div className='col-span-full flex justify-center py-8'>
							<div className='text-toast_warning_text'>
								{t('errorLoadingVideos')}: {playlistError}
							</div>
						</div>
					) : (
						featuredVideosList.map((featuredVideo: IAAGVideoData) => (
							<GovernanceVideoCard
								key={featuredVideo.id}
								title={featuredVideo.title}
								date={featuredVideo.date}
								duration={featuredVideo.duration}
								thumbnail={featuredVideo.thumbnail}
								url={featuredVideo.url}
								videoId={featuredVideo.id}
								referenda={featuredVideo.referenda}
								publishedAt={featuredVideo.publishedAt}
								agendaUrl={featuredVideo.agendaUrl}
							/>
						))
					)}
				</div>
				<AAGVideoListingComponent
					videos={remainingVideosList}
					loading={isPlaylistLoading}
					error={playlistError}
				/>
			</div>
		</div>
	);
}

export default AttemptsAtGovernancePage;
