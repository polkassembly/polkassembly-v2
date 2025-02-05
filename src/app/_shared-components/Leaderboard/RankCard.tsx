// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Image from 'next/image';
import rankStar from '@assets/profile/rank-star.svg';
import { IPublicUser } from '@/_shared/types';
import FirstPlace from '@assets/leaderboard/FirstPlace.svg';
import SecondPlace from '@assets/leaderboard/SecondPlace.svg';
import ThirdPlace from '@assets/leaderboard/ThirdPlace.svg';
import FirstPlaceDark from '@assets/leaderboard/FirstPlaceDark.svg';
import SecondPlaceDark from '@assets/leaderboard/SecondPlaceDark.svg';
import ThirdPlaceDark from '@assets/leaderboard/ThirdPlaceDark.svg';
import UserIcon from '@assets/profile/user-icon.svg';
import { IoPersonAdd } from 'react-icons/io5';
import { HiMiniCurrencyDollar } from 'react-icons/hi2';
import Link from 'next/link';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { useTranslations } from 'next-intl';
import { useSidebar } from '../Sidebar/Sidebar';
import styles from './Leaderboard.module.scss';

function RankCard({ place, className, item }: { place: number; className?: string; item: IPublicUser }) {
	const { state } = useSidebar();
	const t = useTranslations();
	const placeImageMap: Record<number, string> = {
		1: FirstPlace,
		2: SecondPlace,
		3: ThirdPlace
	};
	const placeImageMapDark: Record<number, string> = {
		1: FirstPlaceDark,
		2: SecondPlaceDark,
		3: ThirdPlaceDark
	};

	const positionClasses = place === 1 ? 'xl:order-2 xl:z-10 ' : place === 2 ? 'xl:order-1 xl:translate-y-4' : 'xl:order-3 xl:translate-y-4';
	const imageWidth = place === 1 ? 'xl:w-[456px] xl:h-[217px] w-[380px] h-[180px]' : 'xl:w-[400px] xl:h-[197px] w-[380px] h-[180px]';

	return (
		<div className={`relative flex flex-col items-center ${positionClasses} ${className}`}>
			<Image
				src={placeImageMap[place as keyof typeof placeImageMap]}
				alt={`Rank ${place}`}
				width={200}
				height={100}
				className={`relative bg-cover bg-center bg-no-repeat ${imageWidth} dark:hidden`}
			/>
			<Image
				src={placeImageMapDark[place as keyof typeof placeImageMapDark]}
				alt={`Rank ${place}`}
				width={200}
				height={100}
				className={`relative bg-cover bg-center bg-no-repeat ${imageWidth} hidden dark:block`}
			/>
			<div className='absolute left-0 top-0 h-full w-full'>
				<div className={`flex flex-col items-center pt-1 ${state === 'expanded' ? 'xl:pt-3' : ''}`}>
					<p className={styles.rankCardText}>
						{t('Profile.rank')} 0{place}
					</p>
					<span className={styles.rankStar}>
						<Image
							src={rankStar}
							alt='Rank Star'
							width={16}
							height={16}
						/>
						<span className='text-leaderboard_score text-sm font-medium'>{item?.profileScore}</span>
					</span>
				</div>
				<div className='flex flex-col gap-3 px-10'>
					<span className='flex w-full items-center justify-between pt-4 xl:pt-10'>
						<Link
							href={`/user/${item?.id}`}
							className='flex items-center gap-x-2'
						>
							<Image
								src={UserIcon}
								alt='User Icon'
								className='h-6 w-6'
								width={20}
								height={20}
							/>
							<span className='text-sm font-medium'>{item?.username}</span>
						</Link>
						<div className='flex items-center gap-x-2'>
							<IoPersonAdd className='text-lg text-text_primary' />
							<HiMiniCurrencyDollar className='text-2xl text-text_primary' />
						</div>
					</span>
					<hr className='w-full border-t border-border_grey' />
					<div>
						<span className='flex items-center gap-x-2 text-xs'>
							<p className='text-wallet_btn_text'>{t('Profile.userSince')}:</p>
							<Image
								src={CalendarIcon}
								alt='calendar'
								width={20}
								height={20}
							/>
							<span className='whitespace-nowrap'>{dayjs(item.createdAt).format("Do MMM 'YY")}</span>
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default RankCard;
