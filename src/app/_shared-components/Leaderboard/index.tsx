// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IGenericListingResponse, IPublicUser } from '@/_shared/types';
import { dayjs } from '@shared/_utils/dayjsInit';
import React from 'react';
import Trophy from '@assets/leaderboard/Trophy.png';
import rankStar from '@assets/profile/rank-star.svg';
import CalendarIcon from '@assets/icons/calendar-icon.svg';
import UserIcon from '@assets/profile/user-icon.svg';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { IoPersonAdd } from 'react-icons/io5';
// import { MdOutlineSearch } from 'react-icons/md';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { HiMiniCurrencyDollar } from 'react-icons/hi2';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './Leaderboard.module.scss';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
// import { Input } from '../Input';
import { PaginationWithLinks } from '../PaginationWithLinks';
import RankCard from './RankCard';

function Leaderboard({ data }: { data: IGenericListingResponse<IPublicUser> }) {
	const searchParams = useSearchParams();
	const page = parseInt(searchParams.get('page') || '1', DEFAULT_LISTING_LIMIT) || 1;
	const router = useRouter();
	const displayedItems = page === 1 ? data.items.slice(3, DEFAULT_LISTING_LIMIT) : data.items;
	const t = useTranslations();
	return (
		<div className='bg-page_background'>
			<div className={styles.Card}>
				<div className='relative flex flex-row items-center justify-center'>
					<div className='relative flex justify-center md:justify-start'>
						<Image
							src={Trophy}
							alt='Cup'
							className='z-10 h-auto w-40 md:w-60 lg:w-72'
							width={100}
							height={100}
						/>
					</div>
					<div className='flex flex-col items-center gap-1 text-center md:items-start md:text-left'>
						<p className='text-4xl font-semibold text-white'>{t('Leaderboard.leaderboard')}</p>
						<p className='text-white'>{t('Leaderboard.findYourRank')}</p>
					</div>
				</div>
			</div>
			<div className='my-5 flex flex-wrap items-center justify-center gap-4 xl:my-10 xl:flex-nowrap'>
				{data.items.slice(0, 3).map((item, index) => {
					return (
						<RankCard
							key={item.id}
							item={item}
							place={index + 1}
						/>
					);
				})}
			</div>
			<div className='rounded-lg bg-bg_modal p-6'>
				{/* <div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<div className='relative'>
							<Input
								className={styles.input_container}
								placeholder={t('Leaderboard.searchUsername')}
							/>
							<MdOutlineSearch className={styles.input_search} />
						</div>
					</div> 
				</div>  */}
				<div>
					<Table>
						<TableHeader>
							<TableRow className={styles.tableRow}>
								<TableHead className={styles.tableCell_1}>{t('Profile.rank')}</TableHead>
								<TableHead className={styles.tableCell_2}>{t('Leaderboard.username')}</TableHead>
								<TableHead className={styles.tableCell}>{t('Leaderboard.astrals')}</TableHead>
								<TableHead className={styles.tableCell}>{t('Leaderboard.userSince')}</TableHead>
								<TableHead className={styles.tableCell_last}>{t('Leaderboard.actions')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{displayedItems.map((item) => {
								return (
									<TableRow key={item.id}>
										<TableCell className={styles.tableCell_1}>{item.rank}</TableCell>
										<TableCell className={styles.tableCell_2}>
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
										</TableCell>
										<TableCell className='p-4'>
											<span className='flex w-20 items-center gap-1 rounded-lg bg-rank_card_bg px-1.5 py-0.5 font-medium'>
												<Image
													src={rankStar}
													alt='Rank Star'
													width={16}
													height={16}
												/>
												<span className='text-leaderboard_score text-sm font-medium'>{item?.profileScore}</span>
											</span>
										</TableCell>
										<TableCell className={styles.tableCell}>
											<span className='flex items-center gap-x-2 text-xs'>
												<Image
													src={CalendarIcon}
													alt='calendar'
													width={20}
													height={20}
												/>
												<span className='whitespace-nowrap'>{dayjs(item.createdAt).format("Do MMM 'YY")}</span>
											</span>
										</TableCell>
										<TableCell className={styles.tableContentCell_last}>
											<IoPersonAdd className='text-lg text-text_primary' />
											<HiMiniCurrencyDollar className='text-2xl text-text_primary' />
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
					{data.totalCount && data.totalCount > DEFAULT_LISTING_LIMIT && (
						<div className='mt-5 w-full'>
							<PaginationWithLinks
								page={Number(page)}
								pageSize={DEFAULT_LISTING_LIMIT}
								totalCount={data.totalCount}
								onClick={(pageNumber) => {
									router.push(`/leaderboard?page=${pageNumber}`);
								}}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Leaderboard;
