// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from '@/app/_shared-components/Button';
import Image from 'next/image';
import AAGLogo from '@assets/icons/aag/AAG.svg';
import Host from '@assets/icons/aag/host.svg';
import { useState } from 'react';
import SocialLinks from '@/app/_shared-components/Profile/Address/SocialLinks';
import { ESocial } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import RequestToPresentModal from './RequestToPresentModal';

function AAGCard() {
	const t = useTranslations('AAG');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const socialLinks = [
		{
			platform: ESocial.TWITTER,
			url: 'https://x.com/KusDAO'
		},
		{
			platform: ESocial.DISCORD,
			url: 'https://discord.com/invite/CRNDnguJXx'
		},
		{
			platform: ESocial.GITHUB,
			url: 'https://github.com/TheKusamarian/stake-n-vote'
		}
	];

	const handleAddToCalendar = () => {
		const title = t('calendarEventTitle');
		const details = t('calendarEventDetails');
		const location = 'https://x.com/KusDAO';
		const now = new Date();
		const nextThursday = new Date(now);
		nextThursday.setDate(now.getDate() + ((4 + 7 - now.getDay()) % 7));
		nextThursday.setUTCHours(15, 0, 0, 0);

		if (now.getDay() === 4 && now.getTime() > nextThursday.getTime()) {
			nextThursday.setDate(nextThursday.getDate() + 7);
		}

		const startDate = nextThursday.toISOString().replace(/-|:|\.\d+/g, '');
		const endDate = new Date(nextThursday.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '');

		const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&dates=${startDate}/${endDate}&recur=RRULE:FREQ=WEEKLY`;

		window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
	};

	return (
		<div className='w-full bg-bg_modal p-4 md:p-8 md:px-20'>
			<div className='mx-auto flex w-full max-w-7xl gap-4'>
				<Image
					src={AAGLogo}
					alt='AAG Logo'
					width={24}
					height={24}
					className='h-16 w-16 flex-shrink-0 md:h-24 md:w-24'
				/>
				<div className='flex min-w-0 flex-1 flex-col'>
					<div className='flex w-full flex-col gap-4 md:flex-row md:items-start md:justify-between'>
						<div className='min-w-0 flex-1'>
							<div className='mb-1 flex flex-col gap-2 sm:flex-row sm:items-center md:gap-4'>
								<h1 className='text-xl font-semibold md:text-2xl'>{t('title')}</h1>
								<Button
									variant='secondary'
									className='w-fit'
									onClick={handleAddToCalendar}
								>
									{t('addToCalendar')}
								</Button>
							</div>
							<div className='mb-2 flex items-center gap-1'>
								<Image
									src={Host}
									alt='Host'
									width={24}
									height={24}
									className='h-5 w-5 md:h-6 md:w-6'
								/>
								<p className='text-lg font-medium md:text-lg'>{t('host')}</p>
							</div>
							<div className='mt-1 flex flex-wrap items-center gap-2 text-sm'>
								<p>
									{t('description')}{' '}
									<span>
										<button
											onClick={() => setIsModalOpen(true)}
											type='button'
											className='whitespace-nowrap font-semibold text-text_pink'
										>
											{t('requestToPresent')}
										</button>
									</span>
								</p>
							</div>
						</div>
						<div className='flex-shrink-0'>
							<SocialLinks socialLinks={socialLinks} />
						</div>
					</div>
				</div>
			</div>
			<RequestToPresentModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</div>
	);
}

export default AAGCard;
