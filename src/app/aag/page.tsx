// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState, useMemo } from 'react';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useTranslations } from 'next-intl';
import { useAAGVideos } from '@/hooks/useAAGVideos';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { Search, X } from 'lucide-react';
import GovernanceVideoCard from './Components/GovernanceCard';
import AAGVideoListingComponent from './Components/VideoList';
import AAGCard from './Components/AAGCard';

const FEATURED_VIDEOS_COUNT = 3;

function AttemptsAtGovernancePage() {
	const t = useTranslations('AAG');
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);

	const {
		data: aagVideosData,
		isLoading: isPlaylistLoading,
		error: playlistError,
		isFetching
	} = useAAGVideos({
		q: searchQuery || undefined,
		limit: DEFAULT_LISTING_LIMIT,
		sort: 'latest'
	});

	// Filter videos client-side for more comprehensive search
	const filteredVideos = useMemo(() => {
		const videos = aagVideosData?.items || [];
		if (!searchQuery.trim()) return videos;

		const query = searchQuery.toLowerCase().trim();

		return videos.filter((video) => {
			// Search by title, referenda number, or video ID
			return video.title.toLowerCase().includes(query) || video.referenda?.some((ref) => ref.referendaNo.includes(query)) || video.id.toLowerCase().includes(query);
		});
	}, [aagVideosData?.items, searchQuery]);

	const featuredVideosList = searchQuery ? [] : filteredVideos.slice(0, FEATURED_VIDEOS_COUNT);
	const remainingVideosList = searchQuery ? filteredVideos : filteredVideos.slice(FEATURED_VIDEOS_COUNT);

	const handleSearch = (value: string) => {
		setSearchQuery(value);
		setIsSearching(true);
		// Reset searching state after a short delay
		setTimeout(() => setIsSearching(false), 300);
	};

	const clearSearch = () => {
		setSearchQuery('');
		setIsSearching(false);
	};

	return (
		<div className='min-h-screen bg-page_background text-text_primary'>
			<AAGCard />
			<div className='mx-auto max-w-6xl px-4'>
				{/* Search Bar */}
				<div className='mb-6 mt-4'>
					<div className='relative'>
						<div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
							<Search className={`h-5 w-5 ${isSearching || isFetching ? 'animate-pulse text-text_pink' : 'text-wallet_btn_text'}`} />
						</div>
						<input
							type='text'
							value={searchQuery}
							onChange={(e) => handleSearch(e.target.value)}
							placeholder={t('searchPlaceholder') || 'Search by title, video ID, or referenda number...'}
							className='w-full rounded-lg border border-border_grey bg-bg_modal py-3 pl-10 pr-10 text-sm text-text_primary placeholder:text-wallet_btn_text focus:border-text_pink focus:outline-none focus:ring-1 focus:ring-text_pink'
						/>
						{searchQuery && (
							<button
								type='button'
								onClick={clearSearch}
								className='absolute inset-y-0 right-0 flex items-center pr-3 text-wallet_btn_text hover:text-text_primary'
								aria-label='Clear search'
							>
								<X className='h-5 w-5' />
							</button>
						)}
					</div>
					{searchQuery && (
						<div className='mt-2 text-sm text-wallet_btn_text'>
							{isSearching || isFetching ? (
								<span className='flex items-center gap-2'>
									<span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-text_pink border-t-transparent' />
									{t('searching') || 'Searching...'}
								</span>
							) : (
								<span>
									{filteredVideos.length} {filteredVideos.length === 1 ? t('result') || 'result' : t('results') || 'results'} found
								</span>
							)}
						</div>
					)}
				</div>
				{searchQuery && filteredVideos.length === 0 && !isPlaylistLoading && !isFetching ? (
					<div className='col-span-full flex flex-col items-center justify-center py-12'>
						<Search className='mb-4 h-12 w-12 text-wallet_btn_text' />
						<h3 className='mb-2 text-lg font-semibold text-text_primary'>{t('noResultsFound') || 'No results found'}</h3>
						<p className='mb-4 text-sm text-wallet_btn_text'>{t('noResultsMessage') || 'Try searching with different keywords or referenda numbers'}</p>
						<button
							type='button'
							onClick={clearSearch}
							className='rounded-lg border border-border_grey bg-bg_modal px-4 py-2 text-sm font-medium text-text_primary hover:bg-opacity-80'
						>
							{t('clearSearch') || 'Clear search'}
						</button>
					</div>
				) : (
					<>
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
										{t('errorLoadingVideos')}: {playlistError.message}
									</div>
								</div>
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
					</>
				)}
			</div>
		</div>
	);
}

export default AttemptsAtGovernancePage;
