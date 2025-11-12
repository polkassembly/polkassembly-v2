// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, Clock, Share2 } from 'lucide-react';
import { Button } from '@/app/_shared-components/Button';
import { useToast } from '@/hooks/useToast';
import { ENotificationStatus } from '@/_shared/types';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@assets/parachain-logos/kusama-logo.gif';
import { usePathname } from 'next/navigation';

interface GovernanceCardProps {
	title: string;
	date: string;
	duration: string;
	thumbnail?: string;
	referenda?: string[];
	votingOutcomes?: string[];
	url?: string;
	videoId?: string;
	publishedAt?: string;
}

function GovernanceCard({ title, date, duration, thumbnail, referenda, votingOutcomes, url, videoId, publishedAt }: GovernanceCardProps) {
	const tags = referenda || votingOutcomes;
	const tagTitle = referenda ? 'Referenda' : 'Voting Outcomes';
	const { toast } = useToast();
	const pathname = usePathname();
	const path = videoId ? `/aag/${videoId}` : pathname;
	const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${path}` : '';

	const href = videoId ? `/aag/${videoId}` : url || '#';

	const network = publishedAt
		? (() => {
				const pubdate = new Date(publishedAt);
				const day = pubdate.getUTCDay();
				if (day === 2) return 'kusama';
				if (day === 5) return 'polkadot';
				return null;
			})()
		: null;

	const handleShare = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!videoId) return;

		try {
			await navigator.clipboard.writeText(shareUrl);
			toast({
				status: ENotificationStatus.SUCCESS,
				title: 'Link copied!',
				description: 'Video link has been copied to clipboard'
			});
		} catch {
			toast({
				status: ENotificationStatus.ERROR,
				title: 'Failed to copy link',
				description: 'Could not copy link to clipboard'
			});
		}
	};

	const handleCardClick = () => {
		if (href !== '#') {
			window.location.href = href;
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleCardClick();
		}
	};

	return (
		<div
			className='group relative cursor-pointer rounded-lg p-[1px] transition-all duration-300 [background:linear-gradient(180deg,#D2D8E0_0%,#000000_100%)] hover:[background:linear-gradient(180deg,#D2D8E0_0%,#E5007A_100%)]'
			onClick={handleCardClick}
			onKeyDown={handleKeyDown}
			role='button'
			tabIndex={0}
			aria-label={`View video: ${title}`}
		>
			<div className='overflow-hidden rounded-lg bg-bg_modal px-6 pb-3 pt-6 shadow-md transition-shadow hover:shadow-lg'>
				<div className='relative'>
					{thumbnail && (
						<Image
							src={thumbnail}
							alt={title}
							width={400}
							height={192}
							className='h-48 w-full rounded-lg object-cover'
						/>
					)}
					<div className='absolute inset-0 flex items-center justify-center'>
						<div className='flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm'>
							<svg
								className='h-8 w-8 text-btn_primary_text'
								fill='currentColor'
								viewBox='0 0 24 24'
							>
								<path d='M8 5v14l11-7z' />
							</svg>
						</div>
					</div>
				</div>

				<div className='p-4'>
					<h3 className='text-lg font-bold'>{title}</h3>
					<p className='mb-4 flex items-center gap-3 text-xs text-wallet_btn_text'>
						<span className='flex items-center gap-1'>
							<Calendar className='h-3.5 w-3.5' /> {date}
						</span>
						<span className='flex items-center gap-1'>
							<Clock className='h-3.5 w-3.5' />
							{duration}
						</span>
					</p>

					<div className='mb-4 flex items-center gap-2'>
						<h4 className='text-sm text-text_primary'>{tagTitle}</h4>
						<div className='flex flex-wrap gap-2'>
							{tags &&
								tags.map((tag: string) => (
									<span
										key={tag}
										className='rounded-full bg-bg_light_pink px-2 py-0.5 text-sm font-medium text-text_pink'
									>
										{tag}
									</span>
								))}
						</div>
					</div>

					<div className='flex items-center justify-between border-t border-border_grey pt-4'>
						<div className='flex items-center gap-3'>
							{network && (
								<Image
									src={network === 'polkadot' ? PolkadotLogo : KusamaLogo}
									alt={network === 'polkadot' ? 'Polkadot' : 'Kusama'}
									width={24}
									height={24}
									className='h-6 w-6 rounded-full'
								/>
							)}
							<Button
								variant='ghost'
								size='sm'
								className='rounded-full border border-text_pink px-4 py-2 text-text_pink hover:bg-bg_light_pink'
							>
								View Agenda
							</Button>
						</div>
						<Button
							variant='ghost'
							size='icon'
							className='rounded-lg border border-border_grey bg-network_dropdown_bg p-2'
							onClick={handleShare}
							title='Share video'
						>
							<Share2 className='h-4 w-4 text-wallet_btn_text' />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default GovernanceCard;
