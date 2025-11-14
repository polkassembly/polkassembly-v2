// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ExternalLink } from 'lucide-react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';

const getCategoryColor = (category: string): string => {
	switch (category) {
		case 'GOV':
			return 'bg-blue-500/20 text-blue-200';
		case 'CORE':
			return 'bg-green-500/20 text-green-200';
		case 'PARA':
			return 'bg-purple-500/20 text-purple-200';
		case 'ECO':
			return 'bg-orange-500/20 text-orange-200';
		case 'EVT':
			return 'bg-pink-500/20 text-pink-200';
		default:
			return 'bg-white/20 text-white';
	}
};

interface INewsItem {
	Category: string;
	Title: string;
	URL: string;
	Source: string;
	Priority: string;
	Status: string;
}

const fetchNewsItems = async (): Promise<INewsItem[]> => {
	try {
		const response = await NextApiClientService.getGoogleSheetData<INewsItem[]>();
		const { data } = response;

		if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
			const activeStatuses = ['active', 'deciding', 'executed', 'announced', 'upcoming', 'ongoing', 'submitted', 'pending', 'open', 'released', 'outlook'];
			return data.data.filter((item: INewsItem) => item.Status && activeStatuses.includes(item.Status.toLowerCase()));
		}

		return [];
	} catch (error) {
		console.error('Error fetching news items', error);
		return [];
	}
};

function NewsBanner() {
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

	if (!newsItems || newsItems.length === 0) {
		return null;
	}

	const duplicatedNewsItems = [...newsItems, ...newsItems, ...newsItems];

	return (
		<div className='fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'>
			<div className='relative h-8 overflow-hidden'>
				<div className='animate-marquee flex items-center whitespace-nowrap pt-1'>
					{duplicatedNewsItems.map((item: INewsItem) => (
						<div
							key={`news-item-${(item.URL ?? item.Title).replace(/[^a-zA-Z0-9-_]/g, '-')}`}
							className='mx-6 inline-block'
						>
							<div className='flex items-center'>
								<span className={`mr-3 rounded px-2 py-1 text-xs font-semibold ${getCategoryColor(item.Category)}`}>{item.Category}</span>
								<a
									href={item.URL}
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 transition-colors duration-200 hover:text-yellow-200 hover:underline'
								>
									<span className='text-sm font-medium'>{item.Title}</span>
									<ExternalLink size={12} />
								</a>
								<div className='mx-6 text-white/50'>•</div>
							</div>
						</div>
					))}
				</div>
				<div className='pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 bg-gradient-to-r from-pink-600 to-transparent' />
				<div className='pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 bg-gradient-to-l from-purple-600 to-transparent' />
			</div>
		</div>
	);
}

export default NewsBanner;
