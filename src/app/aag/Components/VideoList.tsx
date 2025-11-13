// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Filter, MenuIcon, SearchIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ENetwork, type IAAGVideoData } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/_shared-components/DropdownMenu';
import { useTranslations } from 'next-intl';
import { getNetworkFromDate } from '@/_shared/_utils/getNetworkFromDate';
import AAGVideoCard from './VideoCard';

const FILTER_OPTIONS = {
	ALL: 'all',
	POLKADOT: ENetwork.POLKADOT,
	KUSAMA: ENetwork.KUSAMA
} as const;

const ACTIVE_ITEM_CLASS = 'bg-grey_bg';

interface VideoListProps {
	videos: IAAGVideoData[];
	loading?: boolean;
	error?: string | null;
}

type SortOption = 'latest' | 'oldest';
type FilterOption = 'all' | ENetwork.POLKADOT | ENetwork.KUSAMA;

function AAGVideoListingComponent({ videos = [], loading: isVideosLoading = false, error: videosError = null }: VideoListProps) {
	const t = useTranslations('AAG');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedSortOption, setSelectedSortOption] = useState<SortOption>('latest');
	const [selectedFilterOption, setSelectedFilterOption] = useState<FilterOption>(FILTER_OPTIONS.ALL);

	const filteredAndSortedVideos = useMemo(() => {
		let filtered = videos;

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((video) => video.title.toLowerCase().includes(query) || video.referenda?.some((ref) => ref.referendaNo.toLowerCase().includes(query)));
		}

		if (selectedFilterOption !== FILTER_OPTIONS.ALL) {
			filtered = filtered.filter((video) => getNetworkFromDate(video.publishedAt) === selectedFilterOption);
		}

		if (selectedSortOption === 'latest') {
			filtered = [...filtered].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
		} else {
			filtered = [...filtered].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
		}

		return filtered;
	}, [videos, searchQuery, selectedSortOption, selectedFilterOption]);

	return (
		<div className='my-8 max-w-7xl rounded-lg bg-bg_modal p-4 md:my-16 md:p-6'>
			<div className='mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<h2 className='text-xl font-bold text-text_primary'>{t('moreVideos')}</h2>

				<div className='flex w-full flex-col items-stretch gap-3 text-wallet_btn_text sm:w-auto sm:flex-row sm:items-center'>
					<div className='relative w-full sm:w-auto'>
						<input
							type='text'
							placeholder={t('searchPlaceholder')}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className='w-full rounded-md border border-border_grey py-2 pl-10 pr-4 text-sm sm:w-72'
						/>
						<div className='absolute inset-y-0 left-0 flex items-center pl-3'>
							<SearchIcon className='h-5 w-5' />
						</div>
					</div>

					<div className='flex items-center gap-3'>
						<DropdownMenu>
							<DropdownMenuTrigger noArrow>
								<Filter className='h-6 w-6' />
							</DropdownMenuTrigger>
							<DropdownMenuContent className='w-24 min-w-max'>
								<DropdownMenuItem
									onClick={() => setSelectedFilterOption(FILTER_OPTIONS.ALL)}
									className={selectedFilterOption === FILTER_OPTIONS.ALL ? ACTIVE_ITEM_CLASS : ''}
								>
									{t('allNetworks')}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setSelectedFilterOption(FILTER_OPTIONS.POLKADOT)}
									className={selectedFilterOption === FILTER_OPTIONS.POLKADOT ? ACTIVE_ITEM_CLASS : ''}
								>
									{t('polkadot')}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setSelectedFilterOption(FILTER_OPTIONS.KUSAMA)}
									className={selectedFilterOption === FILTER_OPTIONS.KUSAMA ? ACTIVE_ITEM_CLASS : ''}
								>
									{t('kusama')}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger noArrow>
								<MenuIcon className='h-6 w-6' />
							</DropdownMenuTrigger>
							<DropdownMenuContent className='w-24 min-w-max'>
								<DropdownMenuItem
									onClick={() => setSelectedSortOption('latest')}
									className={selectedSortOption === 'latest' ? ACTIVE_ITEM_CLASS : ''}
								>
									{t('latest')}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setSelectedSortOption('oldest')}
									className={selectedSortOption === 'oldest' ? ACTIVE_ITEM_CLASS : ''}
								>
									{t('oldest')}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			<div className='flex flex-col gap-4'>
				{isVideosLoading ? (
					<>
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className='flex flex-col gap-4 overflow-hidden rounded-lg border border-border_grey bg-bg_modal p-4 sm:flex-row'
							>
								<Skeleton className='aspect-video w-full rounded sm:w-64' />
								<div className='flex flex-1 flex-col justify-between space-y-3'>
									<Skeleton className='h-5 w-3/4' />
									<div className='flex gap-4'>
										<Skeleton className='h-4 w-20' />
										<Skeleton className='h-4 w-16' />
									</div>
								</div>
							</div>
						))}
					</>
				) : videosError ? (
					<div className='flex justify-center py-8'>
						<div className='text-toast_warning_text'>
							{t('errorLoadingVideos')}: {videosError}
						</div>
					</div>
				) : filteredAndSortedVideos.length === 0 ? (
					<div className='flex justify-center py-8'>
						<div className='text-text_primary'>{t('noVideosFound')}</div>
					</div>
				) : (
					filteredAndSortedVideos.map((video) => (
						<AAGVideoCard
							key={video.id}
							title={video.title}
							date={video.date}
							duration={video.duration}
							thumbnail={video.thumbnail}
							publishedAt={video.publishedAt}
							url={video.url}
							videoId={video.id}
							referenda={video.referenda}
							agendaUrl={video.agendaUrl}
						/>
					))
				)}
			</div>
		</div>
	);
}

export default AAGVideoListingComponent;
