// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/app/_shared-components/Button';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@assets/parachain-logos/kusama-logo.gif';

interface VideoCardProps {
	title: string;
	date: string;
	duration: string;
	referenda: string[];
	thumbnail: string;
	variant?: 'default' | 'aiPrompt' | 'aiInsightWithButton' | 'aiInsight';
	url?: string;
	videoId?: string;
	publishedAt?: string;
}

function VideoCard({ title, date, duration, referenda, thumbnail, url, videoId, publishedAt }: Omit<VideoCardProps, 'variant'>) {
	const href = videoId ? `/aag/${videoId}` : url || '#';

	const network = publishedAt
		? (() => {
				const date = new Date(publishedAt);
				const day = date.getUTCDay();
				if (day === 2) return 'kusama';
				if (day === 5) return 'polkadot';
				return null;
			})()
		: null;

	return (
		<Link
			href={href}
			className='block'
		>
			<div className='flex cursor-pointer items-start gap-4 rounded-lg p-[1px] transition-all duration-300 [background:linear-gradient(180deg,#D2D8E0_0%,#000000_100%)] hover:[background:linear-gradient(180deg,#D2D8E0_0%,#E5007A_100%)]'>
				<div className='flex w-full items-start gap-4 rounded-lg bg-bg_modal p-4 shadow-sm transition-shadow hover:shadow-md'>
					<div className='relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-md'>
						{thumbnail ? (
							<Image
								src={thumbnail}
								alt={title}
								width={160}
								height={96}
								className='h-full w-full object-cover'
							/>
						) : (
							<div className='text-text_secondary flex h-full items-center justify-center text-sm'>No Image</div>
						)}
					</div>

					<div className='flex-grow'>
						<h3 className='text-lg font-bold'>{title}</h3>

						<p className='mb-4 flex items-center gap-4 pt-1 text-sm text-wallet_btn_text'>
							<span className='flex items-center gap-1'>
								<Calendar className='h-3.5 w-3.5' /> {date}
							</span>
							<span className='flex items-center gap-1'>
								<Clock className='h-3.5 w-3.5' />
								{duration}
							</span>
						</p>

						<div className='mt-2 flex flex-wrap items-center gap-2'>
							<h4 className='text-sm text-text_primary'>Referenda</h4>
							{referenda &&
								referenda.map((tag: string) => (
									<span
										key={tag}
										className='rounded-full bg-bg_light_pink px-2 py-0.5 text-sm font-medium text-text_pink'
									>
										{tag}
									</span>
								))}
						</div>
					</div>

					<div className='flex flex-col items-end justify-between self-stretch'>
						<div className='flex flex-shrink-0 items-center gap-2'>
							<Button className='rounded-full'>View Agenda</Button>
							{network && (
								<Image
									src={network === 'polkadot' ? PolkadotLogo : KusamaLogo}
									alt={network === 'polkadot' ? 'Polkadot' : 'Kusama'}
									width={24}
									height={24}
									className='h-6 w-6 rounded-full'
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}

export default VideoCard;
