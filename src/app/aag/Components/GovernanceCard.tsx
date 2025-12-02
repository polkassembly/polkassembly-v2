// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import { Calendar, Clock, Play, Share2 } from 'lucide-react';
import { Button } from '@/app/_shared-components/Button';
import { useToast } from '@/hooks/useToast';
import { ENetwork, ENotificationStatus } from '@/_shared/types';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@assets/parachain-logos/kusama-logo.gif';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getNetworkFromDate } from '@/_shared/_utils/getNetworkFromDate';
import { KeyboardEvent, MouseEvent } from 'react';

const MAX_VISIBLE_REFERENDA = 7;

interface GovernanceCardProps {
	title: string;
	date: string;
	duration: string;
	thumbnail?: string;
	referenda?: { referendaNo: string }[];
	votingOutcomes?: string[];
	url?: string;
	videoId?: string;
	publishedAt?: string;
	agendaUrl?: string;
}

function GovernanceVideoCard({ title, date, duration, thumbnail, referenda, votingOutcomes, url, videoId, publishedAt, agendaUrl }: GovernanceCardProps) {
	const t = useTranslations('AAG');
	const { toast: showToast } = useToast();
	const currentPathname = usePathname();
	const activeNetwork = getCurrentNetwork();
	const videoDetailPath = videoId ? `/aag/${videoId}` : currentPathname;
	const videoShareUrl = typeof window !== 'undefined' ? `${window.location.origin}${videoDetailPath}` : '';

	const videoLinkHref = videoId ? `/aag/${videoId}` : url || '#';

	const videoAssociatedNetwork = publishedAt ? getNetworkFromDate(publishedAt) : null;

	const handleVideoShare = async (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!videoId) return;

		try {
			await navigator.clipboard.writeText(videoShareUrl);
			showToast({
				status: ENotificationStatus.SUCCESS,
				title: t('linkCopied'),
				description: t('linkCopiedDescription')
			});
		} catch {
			showToast({
				status: ENotificationStatus.ERROR,
				title: t('failedToCopyLink'),
				description: t('failedToCopyLinkDescription')
			});
		}
	};

	const handleAgendaClick = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (agendaUrl) {
			window.open(agendaUrl, '_blank', 'noopener,noreferrer');
		}
	};

	const handleCardClick = () => {
		if (videoLinkHref !== '#') {
			window.location.href = videoLinkHref;
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleCardClick();
		}
	};

	const formatVideoDate = (dateString: string): string => {
		const pubdate = new Date(dateString);
		const day = pubdate.getDate();
		const month = pubdate.toLocaleDateString('en-US', { month: 'short' });
		const year = pubdate.getFullYear().toString().slice(-2);
		return `${day} ${month} '${year}`;
	};

	return (
		<div
			className={`group relative cursor-pointer rounded-lg p-[1px] transition-all duration-300 ${videoAssociatedNetwork === ENetwork.POLKADOT ? '[background:linear-gradient(180deg,#D2D8E0_0%,#E5007A_100%)]' : '[background:linear-gradient(180deg,#D2D8E0_0%,#000000_100%)]'}`}
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
							<Play className='h-7 w-7 text-btn_primary_text' />
						</div>
					</div>
				</div>

				<div className='p-3 md:p-4'>
					<h3 className='text-base font-bold text-text_primary md:text-lg'>{title}</h3>
					<p className='mb-3 flex flex-col items-start gap-2 text-xs text-wallet_btn_text sm:flex-row sm:items-center sm:gap-3 md:mb-4'>
						<span className='flex items-center gap-1'>
							<Calendar className='h-3 w-3 md:h-3.5 md:w-3.5' /> {formatVideoDate(date)}
						</span>
						<span className='flex items-center gap-1'>
							<Clock className='h-3 w-3 md:h-3.5 md:w-3.5' />
							{duration}
						</span>
					</p>

					<div className='mb-3 flex flex-col gap-2 md:mb-4'>
						<div className='flex flex-wrap gap-2'>
							<p className='text-sm text-text_primary'>{referenda ? t('referenda') : t('votingOutcomes')}</p>
							{activeNetwork && referenda
								? referenda.slice(0, MAX_VISIBLE_REFERENDA).map((referendaItem) => {
										const networkBaseUrl = `https://${activeNetwork}.polkassembly.io`;
										const referendumUrl = `${networkBaseUrl}/referenda/${referendaItem.referendaNo}`;

										return (
											<a
												key={`${activeNetwork}-${referendaItem.referendaNo}`}
												href={referendumUrl}
												target='_blank'
												rel='noopener noreferrer'
												className='inline-flex items-center gap-1.5 rounded-full bg-bg_light_pink px-2 py-0.5 text-xs font-medium text-text_pink transition-colors hover:bg-bg_light_pink/80'
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													window.open(referendumUrl, '_blank', 'noopener,noreferrer');
												}}
											>
												# {referendaItem.referendaNo}
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
							{referenda && referenda.length > MAX_VISIBLE_REFERENDA && (
								<span className='rounded-full bg-bg_light_pink px-2 py-0.5 text-xs font-medium text-text_pink'>+{referenda.length - MAX_VISIBLE_REFERENDA}</span>
							)}
						</div>
					</div>

					<div className='flex flex-row items-center justify-between gap-3 border-t border-border_grey pt-3 md:pt-4'>
						<div className='flex items-center gap-2 md:gap-3'>
							{videoAssociatedNetwork && (
								<Image
									src={videoAssociatedNetwork === ENetwork.POLKADOT ? PolkadotLogo : KusamaLogo}
									alt={videoAssociatedNetwork === ENetwork.POLKADOT ? ENetwork.POLKADOT : ENetwork.KUSAMA}
									width={24}
									height={24}
									className='h-5 w-5 rounded-full md:h-6 md:w-6'
								/>
							)}
							{agendaUrl && (
								<Button
									variant='ghost'
									size='sm'
									className='rounded-full border border-text_pink px-2 py-0.5 text-xs text-text_pink hover:bg-bg_light_pink'
									onClick={handleAgendaClick}
								>
									{t('viewAgenda')}
								</Button>
							)}
						</div>
						<Button
							variant='ghost'
							size='icon'
							className='w-fit rounded-lg border border-border_grey bg-network_dropdown_bg p-1.5'
							onClick={handleVideoShare}
							title={t('shareVideo')}
						>
							<Share2 className='h-3.5 w-3.5 text-wallet_btn_text md:h-4 md:w-4' />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default GovernanceVideoCard;
