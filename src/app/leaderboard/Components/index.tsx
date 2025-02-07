// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IGenericListingResponse, IPublicUser } from '@/_shared/types';
import { useMemo } from 'react';
import Trophy from '@assets/leaderboard/Trophy.png';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@ui/Table';
import { PaginationWithLinks } from '@ui/PaginationWithLinks';
import RankCard from './RankCard';
import styles from './Leaderboard.module.scss';
import LeadboardRow from './LeadboardTable';

interface RankRange {
	startRank: number;
	endRank: number;
}

function Leaderboard({ data, top3RankData }: { data: IGenericListingResponse<IPublicUser>; top3RankData: IGenericListingResponse<IPublicUser> }) {
	const searchParams = useSearchParams();
	const page = parseInt(searchParams?.get('page') ?? '1', DEFAULT_LISTING_LIMIT);
	const router = useRouter();
	const t = useTranslations();
	const { user } = useUser();

	const calculateRankRange = (currentPage: number): RankRange => {
		if (currentPage === 1) {
			return { startRank: 4, endRank: 10 };
		}
		const allRanks = data.items
			.map((item) => item.rank ?? 0)
			.filter((rank) => rank > 10)
			.sort((a, b) => a - b);
		const itemsPerPage = DEFAULT_LISTING_LIMIT;
		const startIndex = (currentPage - 2) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage - 1;
		const startRank = allRanks[startIndex] ?? allRanks[0] ?? 0;
		const endRank = allRanks[Math.min(endIndex, allRanks.length - 1)] ?? allRanks[allRanks.length - 1] ?? 0;

		return {
			startRank,
			endRank
		};
	};

	const processItems = (): IPublicUser[] => {
		const { startRank, endRank } = calculateRankRange(page);
		let items;
		if (page === 1) {
			items = data.items.filter((item) => (item.rank ?? 0) >= 4 && (item.rank ?? 0) <= 10);
		} else {
			items = data.items
				.filter((item) => {
					const rank = item.rank ?? 0;
					return rank >= startRank && rank <= endRank;
				})
				.slice(0, DEFAULT_LISTING_LIMIT);
		}
		const rankGroups = items.reduce<Record<number, IPublicUser[]>>((acc, item) => {
			const rank = item.rank ?? 0;
			if (!acc[rank]) {
				acc[rank] = [];
			}
			acc[rank].push(item);
			return acc;
		}, {});
		if (!user?.publicUser) {
			return Object.values(rankGroups).flat();
		}
		const userRank = user.publicUser.rank ?? 0;
		if (userRank <= 3) {
			return Object.values(rankGroups).flat();
		}
		const isUserRankInCurrentPage = page === 1 ? userRank >= 4 && userRank <= 10 : userRank >= startRank && userRank <= endRank;
		if (!isUserRankInCurrentPage) {
			return Object.values(rankGroups).flat();
		}
		const userEntry: IPublicUser = {
			...user.publicUser,
			username: user.username ?? 'Unknown User'
		};
		const sameRankUsers = items.filter((item) => item.rank === userRank);
		const updatedRankGroups = {
			...rankGroups,
			[userRank]: [userEntry, ...sameRankUsers.filter((item) => item.id !== user.publicUser?.id)]
		};
		return Object.entries(updatedRankGroups)
			.sort(([rankA], [rankB]) => Number(rankA) - Number(rankB))
			.flatMap(([, users]) => users)
			.slice(0, DEFAULT_LISTING_LIMIT);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const processDisplayedItems = useMemo<IPublicUser[]>(() => processItems(), [data.items, page, user]);

	const shouldShowUserAtBottom = useMemo(() => {
		if (!user?.publicUser?.rank) return false;
		if (user.publicUser.rank <= 3) return false;

		const { startRank, endRank } = calculateRankRange(page);
		return user.publicUser.rank < startRank || user.publicUser.rank > endRank;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, page]);

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
				{top3RankData.items.map((item: IPublicUser, index: number) => (
					<RankCard
						key={item.id}
						item={item}
						place={index + 1}
					/>
				))}
			</div>

			<div className='rounded-lg bg-bg_modal p-6'>
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
						{processDisplayedItems?.map((item: IPublicUser) => (
							<LeadboardRow
								key={item.id}
								user={item}
								isCurrentUser={item.id === user?.publicUser?.id}
							/>
						))}
						{shouldShowUserAtBottom && user?.publicUser && (
							<LeadboardRow
								user={user.publicUser}
								isCurrentUser
								isBottom
							/>
						)}
					</TableBody>
				</Table>

				{data.totalCount > DEFAULT_LISTING_LIMIT && (
					<div className='mt-5 w-full'>
						<PaginationWithLinks
							page={page}
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
	);
}

export default Leaderboard;
