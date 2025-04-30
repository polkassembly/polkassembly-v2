// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import rankStar from '@assets/profile/rank-star.svg';
import { IPublicUser } from '@/_shared/types';
import FirstPlace from '@assets/leaderboard/FirstPlace.svg';
import SecondPlace from '@assets/leaderboard/SecondPlace.svg';
import ThirdPlace from '@assets/leaderboard/ThirdPlace.svg';
import FirstPlaceDark from '@assets/leaderboard/FirstPlaceDark.svg';
import SecondPlaceDark from '@assets/leaderboard/SecondPlaceDark.svg';
import { useSidebar } from '@ui/Sidebar/Sidebar';
import ThirdPlaceDark from '@assets/leaderboard/ThirdPlaceDark.svg';
import UserIcon from '@assets/profile/user-icon.svg';
import { IoPersonAdd } from '@react-icons/all-files/io5/IoPersonAdd';
import { AiFillDollarCircle } from '@react-icons/all-files/ai/AiFillDollarCircle';
import Link from 'next/link';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { useTranslations } from 'next-intl';
import styles from './Leaderboard.module.scss';

function RankCard({ place, className, item }: { place: number; className?: string; item: IPublicUser }) {
	const t = useTranslations();
	const { state } = useSidebar();
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
	const imageWidth =
		place === 1 ? 'xl:w-[456px] xl:h-[217px] w-[320px] h-[160px] sm:w-[380px] sm:h-[180px]' : 'xl:w-[400px] xl:h-[197px] w-[320px] h-[160px] sm:w-[380px] sm:h-[180px]';
	const contentPadding = place === 1 ? 'px-6 sm:px-8 xl:px-10' : 'px-4 sm:px-8 xl:px-10';

	return (
		<div className={`relative flex flex-col items-center ${positionClasses} ${className}`}>
			<div className='relative'>
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

				{/* Content overlay with flex layout to separate top and bottom content */}
				<div className='absolute left-0 top-0 flex h-full w-full flex-col justify-between px-1 pb-5 sm:px-0'>
					{/* Top Section - Rank and Score */}
					<div className={`${state === 'collapsed' ? 'pt-2 xl:pt-2 2xl:pt-1' : 'pt-1.5 xl:pt-3 2xl:pt-1'} flex flex-col items-center`}>
						<p className={`${styles.rankCardText} text-xs sm:text-sm`}>
							{t('Profile.rank')} 0{place}
						</p>
						<span className={`${styles.rankStar} flex items-center gap-1`}>
							<Image
								src={rankStar}
								alt='Rank Star'
								width={14}
								height={14}
								className='sm:h-4 sm:w-4'
							/>
							<span className='text-xs font-medium text-leaderboard_score sm:text-sm'>{item?.profileScore}</span>
						</span>
					</div>

					{/* Bottom Section - User Info */}
					<div className={`flex flex-col gap-2 sm:gap-3 ${contentPadding} pb-2 sm:pb-3`}>
						<span className='flex w-full items-center justify-between'>
							<Link
								href={`/user/username/${item?.username}`}
								className='flex items-center gap-x-1 sm:gap-x-2'
							>
								<Image
									src={UserIcon}
									alt='User Icon'
									className='h-5 w-5 sm:h-6 sm:w-6'
									width={20}
									height={20}
								/>
								<span className='max-w-[100px] truncate text-xs font-medium sm:max-w-[150px] sm:text-sm'>{item?.username}</span>
							</Link>
							<div className='flex items-center gap-x-1 sm:gap-x-2'>
								<IoPersonAdd className='text-base text-text_primary sm:text-lg' />
								<AiFillDollarCircle className='text-xl text-text_primary sm:text-2xl' />
							</div>
						</span>

						<hr className='w-full border-t border-border_grey' />

						<div>
							<span className='flex items-center gap-x-1 text-[10px] sm:gap-x-2 sm:text-xs'>
								<p className='text-wallet_btn_text'>{t('Profile.userSince')}:</p>
								<Image
									src={CalendarIcon}
									alt='calendar'
									width={16}
									height={16}
									className='sm:h-5 sm:w-5'
								/>
								<span className='whitespace-nowrap'>{dayjs(item.createdAt).format("Do MMM 'YY")}</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default RankCard;
