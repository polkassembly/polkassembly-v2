// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/app/_shared-components/Button';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@assets/parachain-logos/kusama-logo.gif';
import { ENetwork, type IReferendaItem } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';

interface VideoCardProps {
	title: string;
	date: string;
	duration: string;
	referenda: IReferendaItem[];
	thumbnail: string;
	variant?: 'default' | 'aiPrompt' | 'aiInsightWithButton' | 'aiInsight';
	url?: string;
	videoId?: string;
	publishedAt?: string;
	agendaUrl?: string;
}

function VideoCard({ title, date, duration, referenda, thumbnail, url, videoId, publishedAt, agendaUrl }: Omit<VideoCardProps, 'variant'>) {
	const href = videoId ? `/aag/${videoId}` : url || '#';
	const currentNetwork = getCurrentNetwork();
	const network = publishedAt
		? (() => {
				const publishDate = new Date(publishedAt);
				const day = publishDate.getUTCDay();
				if (day === 2) return ENetwork.KUSAMA;
				if (day === 5) return ENetwork.POLKADOT;
				return null;
			})()
		: null;

	const handleAgendaClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (agendaUrl) {
			window.open(agendaUrl, '_blank', 'noopener,noreferrer');
		}
	};

	return (
		<Link
			href={href}
			className='block'
		>
			<div className='flex cursor-pointer items-start gap-4 rounded-lg p-[1px] transition-all duration-300 [background:linear-gradient(180deg,#D2D8E0_0%,#000000_100%)] hover:[background:linear-gradient(180deg,#D2D8E0_0%,#E5007A_100%)]'>
				<div className='flex w-full flex-col items-start gap-4 rounded-lg bg-bg_modal p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row'>
					<div className='relative h-48 w-full flex-shrink-0 overflow-hidden rounded-md sm:h-24 sm:w-40'>
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

						<p className='mb-4 flex flex-col items-start gap-2 pt-1 text-sm text-wallet_btn_text sm:flex-row sm:items-center sm:gap-4'>
							<span className='flex items-center gap-1'>
								<Calendar className='h-3.5 w-3.5' /> {date}
							</span>
							<span className='flex items-center gap-1'>
								<Clock className='h-3.5 w-3.5' />
								{duration}
							</span>
						</p>

						{referenda && referenda.length > 0 && (
							<div className='mt-2 flex flex-wrap items-center gap-2'>
								{referenda.slice(0, 3).map((ref) => {
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
								})}
								{referenda.length > 3 && <span className='rounded-full bg-bg_light_pink px-2 py-0.5 text-xs font-medium text-text_pink'>+{referenda.length - 3} </span>}
							</div>
						)}
					</div>

					<div className='flex w-full flex-row items-center justify-between self-stretch sm:w-auto sm:flex-col sm:items-end sm:justify-between'>
						<div className='flex flex-shrink-0 items-center gap-2'>
							{agendaUrl && (
								<Button
									className='rounded-full text-xs sm:text-sm'
									onClick={handleAgendaClick}
								>
									View Agenda
								</Button>
							)}
							{network && (
								<Image
									src={network === ENetwork.POLKADOT ? PolkadotLogo : KusamaLogo}
									alt={network === ENetwork.POLKADOT ? ENetwork.POLKADOT : ENetwork.KUSAMA}
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
