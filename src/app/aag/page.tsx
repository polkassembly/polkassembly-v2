// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useAAGVideos } from '@/hooks/useAAGVideos';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import GovernanceVideoCard from './Components/GovernanceCard';
import AAGVideoListingComponent from './Components/VideoList';
import AAGCard from './Components/AAGCard';

const FEATURED_VIDEOS_COUNT = 3;

function AttemptsAtGovernancePage() {
	const {
		data: aagVideosData,
		isLoading: isPlaylistLoading,
		error: playlistError
	} = useAAGVideos({
		limit: DEFAULT_LISTING_LIMIT,
		sort: 'latest'
	});

	const allVideos = aagVideosData?.items || [];
	const featuredVideosList = allVideos.slice(0, FEATURED_VIDEOS_COUNT);
	const remainingVideosList = allVideos.slice(FEATURED_VIDEOS_COUNT);

	return (
		<div className='min-h-screen bg-page_background text-text_primary'>
			<AAGCard />
			<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-10'>
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
					) : (
						featuredVideosList.map((featuredVideo) => (
							<GovernanceVideoCard
								key={featuredVideo.id}
								title={featuredVideo.title}
								date={featuredVideo.publishedAt}
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
					error={playlistError?.message || null}
				/>
			</div>
		</div>
	);
}

export default AttemptsAtGovernancePage;
