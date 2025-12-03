// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useAAGVideosByReferendum } from '@/hooks/useAAGVideos';
import { Skeleton } from '@ui/Skeleton';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@ui/Collapsible';
import AAGLogo from '@assets/icons/aag/AAG.svg';
import AAGVideoCard from '@/app/aag/Components/VideoCard';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import { ChevronDown } from 'lucide-react';

interface AAGVideosTabProps {
	referendaId: string;
}

function AAGVideosTab({ referendaId }: AAGVideosTabProps) {
	const t = useTranslations('AAG');

	const {
		data: videosData,
		isLoading,
		error
	} = useAAGVideosByReferendum({
		referendaId,
		limit: 20
	});

	const videos = videosData?.items || [];

	if (isLoading) {
		return (
			<div className='flex flex-col gap-4'>
				<div className='flex flex-col gap-4 overflow-hidden rounded-lg border border-border_grey bg-bg_modal p-4 sm:flex-row'>
					<Skeleton className='aspect-video w-full rounded sm:w-64' />
					<div className='flex flex-1 flex-col justify-between space-y-3'>
						<Skeleton className='h-5 w-3/4' />
						<div className='flex gap-4'>
							<Skeleton className='h-4 w-20' />
							<Skeleton className='h-4 w-16' />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex justify-center rounded-lg border border-border_grey bg-bg_modal p-8'>
				<div className='text-center'>
					<p className='text-sm text-toast_warning_text'>{t('errorLoadingVideos')}</p>
					<p className='mt-1 text-xs text-wallet_btn_text'>{error.message}</p>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-4'>
			<div className='rounded-lg border border-border_grey bg-[linear-gradient(to_bottom,#f5f8ff,#fcfcfc)] p-4 dark:bg-[linear-gradient(to_bottom,#202331,#1a1c25)]'>
				<Collapsible>
					<CollapsibleTrigger className='group flex w-full items-center gap-2 rounded-lg'>
						<Image
							src={AAGLogo}
							alt='AAG Logo'
							width={24}
							height={24}
							className='h-6 w-6'
						/>
						<span className='text-[16px] font-semibold text-listing_page_btn'>{t('aboutAAG')}</span>
						<ChevronDown className='ml-auto h-4 w-4 text-text_primary transition-transform group-data-[state=open]:rotate-180' />
					</CollapsibleTrigger>
					<CollapsibleContent className='mt-2 p-4'>
						<p className='text-sm text-text_primary'>{t('description')}</p>
					</CollapsibleContent>
				</Collapsible>
			</div>

			{videos.length === 0 ? (
				<div className='flex flex-col items-center justify-center'>
					<Image
						src={NoActivity}
						alt='empty state'
						className='h-80 w-80 p-0'
						width={320}
						height={320}
					/>
					<p className='text-xl font-semibold text-text_primary'>{t('noVideosLinked')}</p>
				</div>
			) : (
				<div>
					<p className='text-xl font-medium text-text_primary'>
						{t('klarafound')} <span className='font-semibold text-text_pink'>{videos.length}</span> {t('aagfound')} {videos.length === 1 ? t('video') : t('videos')}{' '}
						{t('wherethisrefismentioned')}
					</p>
					<div className='mt-4 flex flex-col gap-4'>
						{videos.map((video) => (
							<AAGVideoCard
								key={video.id}
								title={video.title}
								date={video.publishedAt}
								duration={video.duration}
								thumbnail={video.thumbnail}
								publishedAt={video.publishedAt}
								url={video.url}
								videoId={video.id}
								referenda={video.referenda}
								agendaUrl={video.agendaUrl}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export default AAGVideosTab;
