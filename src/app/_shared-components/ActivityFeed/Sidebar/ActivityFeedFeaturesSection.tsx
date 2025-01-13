// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MouseEvent, useEffect, useState } from 'react';
import delegationDashboard from '@assets/activityfeed/features/features1.svg';
import batchVoting from '@assets/activityfeed/features/features2.svg';
import bounty from '@assets/activityfeed/features/features3.svg';
import identity from '@assets/activityfeed/features/features4.svg';
import { useTranslations } from 'next-intl';

interface IFeature {
	title: string;
	description: string;
	image: string;
	path: string;
	id: string;
}

function ActivityFeedFeaturesSection() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const t = useTranslations();
	const features = [
		{
			id: 'delegation-dashboard',
			description: t('ActivityFeed.DelegationDashboardDescription'),
			image: delegationDashboard,
			path: '/delegation',
			title: t('ActivityFeed.DelegationDashboard')
		},
		{
			id: 'batch-voting',
			description: t('ActivityFeed.BatchVotingDescription'),
			image: batchVoting,
			path: '/batch-voting',
			title: t('ActivityFeed.BatchVoting')
		},
		{
			id: 'bounty',
			description: t('ActivityFeed.BountyDescription'),
			image: bounty,
			path: 'bounty',
			title: t('ActivityFeed.Bounty')
		},
		{
			id: 'identity',
			description: t('ActivityFeed.IdentityDescription'),
			image: identity,
			path: '',
			title: t('ActivityFeed.Identity')
		}
	];

	const handleDotClick = (index: number) => {
		setCurrentIndex(index);
	};

	const handleFeatureClick = (e: MouseEvent<HTMLAnchorElement>, feature: IFeature) => {
		if (feature?.title === 'Identity') {
			e.stopPropagation();
			e.preventDefault();
		}
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) => {
				const length = features?.length || 0;
				return (prevIndex + 1) % length;
			});
		}, 5000);

		return () => clearInterval(interval);
	}, [features?.length]);

	return (
		<div className='font-dmSans dark:bg-section-dark-overlay text_primary mt-5 rounded-xl border-[0.6px] border-solid border-[#D2D8E0] bg-bg_modal p-5 dark:border-[#4B4B4B]'>
			<div className='flex items-start justify-between gap-2'>
				<div className='flex items-center gap-2'>
					<p className='text-xl font-semibold text-text_primary dark:text-white'>{t('ActivityFeed.Features')}</p>
					<p className='mt-1 rounded-full bg-navbar_border px-2 py-0.5 text-[10px] font-bold text-white'>{t('ActivityFeed.Live')}</p>
				</div>
				<div className='flex gap-2'>
					{features?.map((feature) => (
						<button
							key={feature.id}
							type='button'
							className={`mt-2 h-2 w-2 cursor-pointer rounded-full ${features[currentIndex].id === feature.id ? 'bg-black dark:bg-[#9E9E9E]' : 'bg-[#D9D9D9]'}`}
							onClick={() => handleDotClick(features.indexOf(feature))}
							aria-label={`Show feature ${feature.title}`}
						/>
					))}
				</div>
			</div>
			<div className='mt-2'>
				<Link
					href={features[currentIndex]?.path}
					onClick={(e) => handleFeatureClick(e, features[currentIndex])}
				>
					<Image
						src={features[currentIndex]?.image}
						className='h-full w-full'
						alt={features[currentIndex]?.title}
						width={800}
						height={800}
					/>
					<div className='mt-3'>
						<p className='text-base font-semibold dark:text-white'>{features[currentIndex]?.title}</p>
						<p className='pt-1 text-sm dark:text-white'>{features[currentIndex]?.description}</p>
					</div>
				</Link>
			</div>
		</div>
	);
}

export default ActivityFeedFeaturesSection;
