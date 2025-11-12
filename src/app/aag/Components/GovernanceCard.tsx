// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, Clock, Share2 } from 'lucide-react';
import { Button } from '@/app/_shared-components/Button';
import { useToast } from '@/hooks/useToast';
import { ENotificationStatus, type IReferendaItem } from '@/_shared/types';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@assets/parachain-logos/kusama-logo.gif';
import { usePathname } from 'next/navigation';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';

interface GovernanceCardProps {
	title: string;
	date: string;
	duration: string;
	thumbnail?: string;
	referenda?: IReferendaItem[];
	votingOutcomes?: string[];
	url?: string;
	videoId?: string;
	publishedAt?: string;
	agendaUrl?: string;
}

function GovernanceCard({ title, date, duration, thumbnail, referenda, votingOutcomes, url, videoId, publishedAt, agendaUrl }: GovernanceCardProps) {
	const { toast } = useToast();
	const pathname = usePathname();
	const currentNetwork = getCurrentNetwork();
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

	const handleAgendaClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (agendaUrl) {
			window.open(agendaUrl, '_blank', 'noopener,noreferrer');
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
			<div className='overflow-hidden rounded-lg bg-bg_modal px-4 pb-3 pt-4 shadow-md transition-shadow hover:shadow-lg md:px-6 md:pt-6'>
				<div className='relative'>
					{thumbnail && (
						<Image
							src={thumbnail}
							alt={title}
							width={400}
							height={192}
							className='h-32 w-full rounded-lg object-cover md:h-48'
						/>
					)}
					<div className='absolute inset-0 flex items-center justify-center'>
						<div className='flex h-12 w-12 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm md:h-16 md:w-16'>
							<svg
								className='h-6 w-6 text-btn_primary_text md:h-8 md:w-8'
								fill='currentColor'
								viewBox='0 0 24 24'
							>
								<path d='M8 5v14l11-7z' />
							</svg>
						</div>
					</div>
				</div>

				<div className='p-3 md:p-4'>
					<h3 className='text-base font-bold md:text-lg'>{title}</h3>
					<p className='mb-3 flex flex-col items-start gap-2 text-xs text-wallet_btn_text sm:flex-row sm:items-center sm:gap-3 md:mb-4'>
						<span className='flex items-center gap-1'>
							<Calendar className='h-3 w-3 md:h-3.5 md:w-3.5' /> {date}
						</span>
						<span className='flex items-center gap-1'>
							<Clock className='h-3 w-3 md:h-3.5 md:w-3.5' />
							{duration}
						</span>
					</p>

					<div className='mb-3 flex flex-col gap-2 md:mb-4'>
						<div className='flex flex-wrap gap-2'>
							{referenda
								? referenda.slice(0, 7).map((ref) => {
										const baseUrl = `https://${currentNetwork}.polkassembly.io`;
										const refUrl = `${baseUrl}/referenda/${ref.referendaNo}`;

										return (
											<a
												key={`${currentNetwork}-${ref.referendaNo}`}
												href={refUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='inline-flex items-center gap-1.5 rounded-full bg-bg_light_pink px-2 py-0.5 text-xs font-medium text-text_pink transition-colors hover:bg-bg_light_pink/80'
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													window.open(refUrl, '_blank', 'noopener,noreferrer');
												}}
											>
												# {ref.referendaNo}
											</a>
										);
									})
								: votingOutcomes?.map((tag: string) => (
										<span
											key={tag}
											className='rounded-full bg-bg_light_pink px-2 py-0.5 text-xs font-medium text-text_pink'
										>
											{tag}
										</span>
									))}
							{referenda && referenda.length > 7 && <span className='rounded-full bg-bg_light_pink px-2 py-0.5 text-xs font-medium text-text_pink'>+{referenda.length - 7}</span>}
						</div>
					</div>

					<div className='flex flex-row items-center justify-between gap-3 border-t border-border_grey pt-3 md:pt-4'>
						<div className='flex items-center gap-2 md:gap-3'>
							{network && (
								<Image
									src={network === 'polkadot' ? PolkadotLogo : KusamaLogo}
									alt={network === 'polkadot' ? 'Polkadot' : 'Kusama'}
									width={24}
									height={24}
									className='h-5 w-5 rounded-full md:h-6 md:w-6'
								/>
							)}
							{agendaUrl && (
								<Button
									variant='ghost'
									size='sm'
									className='rounded-full border border-text_pink px-3 py-1.5 text-xs text-text_pink hover:bg-bg_light_pink md:px-4 md:py-2 md:text-sm'
									onClick={handleAgendaClick}
								>
									View Agenda
								</Button>
							)}
						</div>
						<Button
							variant='ghost'
							size='icon'
							className='w-fit rounded-lg border border-border_grey bg-network_dropdown_bg p-1.5 md:p-2'
							onClick={handleShare}
							title='Share video'
						>
							<Share2 className='h-3.5 w-3.5 text-wallet_btn_text md:h-4 md:w-4' />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default GovernanceCard;
