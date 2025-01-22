// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Link from 'next/link';
import { MouseEvent, useEffect, useState } from 'react';
import { Icon, IconName } from '@/app/_shared-components/Icon';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/app/_shared-components/carousel';
import { useTranslations } from 'next-intl';
import { useSidebar } from '@/app/_shared-components/Sidebar/Sidebar';
import { useUser } from '@/hooks/useUser';
import styles from './ActivityFeedFeaturesSection.module.scss';

interface IFeature {
	title: string;
	description: string;
	image: IconName;
	path: string;
	id: string;
}

function ActivityFeedFeaturesSection() {
	const { user } = useUser();
	const [api, setApi] = useState<CarouselApi>();
	const { state } = useSidebar();

	const [current, setCurrent] = useState(0);
	const t = useTranslations();
	const features: IFeature[] = [
		{
			id: 'delegation-dashboard',
			description: t('ActivityFeed.DelegationDashboardDescription'),
			image: 'activityfeed/features/features1',
			path: '/delegation',
			title: t('ActivityFeed.DelegationDashboard')
		},
		{
			id: 'batch-voting',
			description: t('ActivityFeed.BatchVotingDescription'),
			image: 'activityfeed/features/features2',
			path: '/batch-voting',
			title: t('ActivityFeed.BatchVoting')
		},
		{
			id: 'bounty',
			description: t('ActivityFeed.BountyDescription'),
			image: 'activityfeed/features/features3',
			path: 'bounty',
			title: t('ActivityFeed.Bounty')
		},
		{
			id: 'identity',
			description: t('ActivityFeed.IdentityDescription'),
			image: 'activityfeed/features/features4',
			path: '',
			title: t('ActivityFeed.Identity')
		}
	];

	const handleFeatureClick = (e: MouseEvent<HTMLAnchorElement>, feature: IFeature) => {
		if (feature?.title === 'Identity') {
			e.stopPropagation();
			e.preventDefault();
		}
	};

	useEffect(() => {
		if (!api) {
			return () => {};
		}
		const handleSelect = () => setCurrent(api.selectedScrollSnap());
		api.on('select', handleSelect);

		const autoplayInterval = setInterval(() => {
			api.scrollNext();
		}, 5000);
		return () => {
			clearInterval(autoplayInterval);
			api.off('select', handleSelect);
		};
	}, [api]);

	return (
		<div className={`${state === 'collapsed' ? styles.featuresContainerClosed : styles.featuresContainerOpen} ${!user?.id ? styles.featuresContainerNotLogin : ''}`}>
			<div className='flex items-start justify-between gap-2'>
				<div className='flex items-center gap-2'>
					<p className={`${styles.featuresTitle} dark:text-white`}>{t('ActivityFeed.Features')}</p>
					<p className={styles.featuresLive}>{t('ActivityFeed.Live')}</p>
				</div>
				<div className='flex gap-2'>
					{features.map((feature, index) => (
						<button
							key={feature.id}
							type='button'
							className={`mt-2 h-2 w-2 cursor-pointer rounded-full ${current === index ? 'bg-black dark:bg-text_primary' : 'bg-primary_border'}`}
							onClick={() => api?.scrollTo(index)}
							aria-label={`Show feature ${index + 1}`}
						/>
					))}
				</div>
			</div>

			<div className='mt-2'>
				<Carousel
					opts={{ loop: true, align: 'start' }}
					setApi={setApi}
					className={`${state === 'collapsed' ? 'xl:w-66' : 'w-54 2xl:w-72'} m-0 p-0`}
				>
					<CarouselContent className='m-0 p-0'>
						{features.map((feature) => (
							<CarouselItem
								key={feature.id}
								className='m-0 p-0'
							>
								<Link
									href={feature.path}
									onClick={(e) => handleFeatureClick(e, feature)}
								>
									<Icon
										name={feature.image}
										className='h-24 w-60'
									/>
									<div className='mt-3'>
										<p className='text-base font-semibold dark:text-white'>{feature.title}</p>
										<p className='pt-1 text-sm dark:text-white'>{feature.description}</p>
									</div>
								</Link>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>
		</div>
	);
}

export default ActivityFeedFeaturesSection;
