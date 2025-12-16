// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ExternalLink } from 'lucide-react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSidebar } from '../Sidebar/Sidebar';
import styles from './NewsBanner.module.scss';

const getCategoryColor = (category: string): string => {
	switch (category) {
		case 'GOV':
			return 'bg-blue-500/20 text-blue-600';
		case 'CORE':
			return 'bg-green-500/20 text-green-600';
		case 'PARA':
			return 'bg-purple-500/20 text-purple-600';
		case 'ECO':
			return 'bg-orange-500/20 text-orange-600';
		case 'EVT':
			return 'bg-pink-500/20 text-pink-600';
		default:
			return 'bg-gray-500/20 text-gray-600';
	}
};

interface INewsItem {
	Category: string;
	Title: string;
	URL: string;
	Source: string;
	Priority: string | number;
	Status: string;
	id?: string;
}

const fetchNewsItems = async (): Promise<INewsItem[]> => {
	try {
		const response = await NextApiClientService.getGoogleSheetData<INewsItem[]>();
		const { data, error } = response;

		if (error || !data) {
			console.error('Error fetching news items', error);
			return [];
		}

		if (Array.isArray(data) && data.length > 0) {
			const activeStatuses = ['active', 'deciding', 'executed', 'announced', 'upcoming', 'ongoing', 'submitted', 'pending', 'open', 'released', 'outlook'];
			const filtered = data.filter((item: INewsItem) => {
				return item.Status && activeStatuses.includes(item.Status.toLowerCase());
			});

			return filtered.sort((a, b) => Number(a.Priority) - Number(b.Priority));
		}

		return [];
	} catch (error) {
		console.error('Error fetching news items', error);
		return [];
	}
};

function NewsBanner() {
	const { state } = useSidebar();
	const isMobileDevice = useIsMobile();
	const marqueeRef = useRef<HTMLDivElement>(null);
	const [animationDuration, setAnimationDuration] = useState(60);

	const { data: newsItems = [] } = useQuery({
		queryKey: ['polkadot-news'],
		queryFn: fetchNewsItems,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
	});

	useEffect(() => {
		if (!marqueeRef.current) return;

		const width = marqueeRef.current.scrollWidth;
		const duration = width / 80;
		setAnimationDuration(duration);
	}, [newsItems]);

	const duplicatedNewsItems = useMemo(() => {
		return [...newsItems.map((item) => ({ ...item, id: `${item.Title}-1` })), ...newsItems.map((item) => ({ ...item, id: `${item.Title}-2` }))];
	}, [newsItems]);

	if (!newsItems || newsItems.length === 0) {
		return null;
	}

	const sidebarWidth = state === 'expanded' ? '15.4rem' : '5rem';

	return (
		<div
			className='fixed bottom-0 right-0 z-20 max-h-8 min-h-8 w-full flex-none bg-[#FEC021] pb-[env(safe-area-inset-bottom)] shadow-lg'
			style={{
				left: isMobileDevice ? '0' : sidebarWidth,
				height: '32px',
				transform: 'translate3d(0,0,0)',
				backfaceVisibility: 'hidden',
				WebkitBackfaceVisibility: 'hidden',
				WebkitTransform: 'translate3d(0,0,0)',
				WebkitOverflowScrolling: 'touch',
				willChange: 'transform'
			}}
		>
			<div
				className='relative overflow-hidden'
				style={{
					height: '32px',
					minHeight: '32px',
					maxHeight: '32px'
				}}
			>
				<div
					ref={marqueeRef}
					className={`${styles.animateMarquee} flex items-center whitespace-nowrap pt-1`}
					style={{ animationDuration: `${animationDuration}s` }}
				>
					{duplicatedNewsItems.map((item) => (
						<div
							key={item.id}
							className='mr-6 inline-block'
						>
							<div className='flex items-center'>
								<span className={`mr-3 rounded px-2 py-1 text-xs font-semibold ${getCategoryColor(item.Category)}`}>{item.Category}</span>
								<a
									href={item.URL}
									target='_blank'
									rel='noopener noreferrer'
									style={{ color: '#000000' }}
									className='flex items-center gap-2 transition-colors duration-200 hover:text-orange-600 hover:underline'
								>
									<span className='text-sm font-medium'>{item.Title}</span>
									<ExternalLink size={12} />
								</a>
								<div
									className='ml-6'
									style={{ color: '#000000', opacity: 0.5 }}
								>
									•
								</div>
							</div>
						</div>
					))}
				</div>
				<div
					className='pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16'
					style={{ background: 'linear-gradient(to right, #FEC021, transparent)' }}
				/>
				<div
					className='pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16'
					style={{ background: 'linear-gradient(to left, #FEC021, transparent)' }}
				/>
			</div>
		</div>
	);
}

export default NewsBanner;
