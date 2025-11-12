// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { INewsItem } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';

function NewsBanner() {
	const [newsItems, setNewsItems] = useState<INewsItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchNews = async () => {
			try {
				const { data, error } = await NextApiClientService.getGoogleSheetNews({
					sheetId: '1fJwOupuORTFnNT9X1JA7SKcqq8L7TfeasPxuXq2W37c',
					sheetName: 'Sheet1'
				});

				if (error) {
					console.error('Failed to fetch news:', error);
					return;
				}

				if (data?.success && Array.isArray(data.data)) {
					setNewsItems(data.data);
				} else {
					console.error('Unexpected data format:', data);
				}
			} catch (error) {
				console.error('Failed to fetch news:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchNews();

		const interval = setInterval(fetchNews, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, []);

	if (loading || newsItems.length === 0) {
		return null;
	}

	return (
		<div className='fixed bottom-0 left-0 right-0 z-[100] bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'>
			<div className='relative h-8 overflow-hidden'>
				<div className='absolute inset-0 flex items-center'>
					<div className='animate-marquee flex items-center whitespace-nowrap'>
						{newsItems.map((item) => (
							<div
								key={`first-${item.title}`}
								className='mx-8 flex items-center'
							>
								<span className='mr-3 rounded-full bg-white bg-opacity-20 px-2 py-1 text-xs font-semibold'>BREAKING</span>
								<a
									href={item.link}
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 transition-colors duration-200 hover:text-yellow-200 hover:underline'
								>
									<span className='font-medium'>{item.title}</span>
									<ExternalLink size={14} />
								</a>
								<div className='mx-8 text-white/50'>•</div>
							</div>
						))}
						{newsItems.map((item) => (
							<div
								key={`duplicate-${item.title}`}
								className='mx-8 flex items-center'
							>
								<span className='mr-3 rounded-full bg-white bg-opacity-20 px-2 py-1 text-xs font-semibold'>BREAKING</span>
								<a
									href={item.link}
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 transition-colors duration-200 hover:text-yellow-200 hover:underline'
								>
									<span className='font-medium'>{item.title}</span>
									<ExternalLink size={14} />
								</a>
								<div className='mx-8 text-white/50'>•</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default NewsBanner;
