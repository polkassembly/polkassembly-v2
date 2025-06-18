// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IGenericListingResponse, IPublicUser } from '@/_shared/types';
import { useMemo } from 'react';
import Trophy from '@assets/leaderboard/Trophy.png';
import { useSearchParams } from 'next/navigation';
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
	const t = useTranslations();
	const { user } = useUser();

	const calculateRankRange = (currentPage: number): RankRange => {
		if (currentPage === 1) {
			return { startRank: 4, endRank: 10 };
		}

		const uniqueRanks = [...new Set(data.items.filter((item) => item.rank != null).map((item) => item.rank!))].sort((a, b) => a - b);
		const startIndex = (currentPage - 1) * DEFAULT_LISTING_LIMIT - 3;
		const endIndex = startIndex + DEFAULT_LISTING_LIMIT - 1;

		return {
			startRank: uniqueRanks[startIndex ?? 0] ?? 0,
			endRank: uniqueRanks[endIndex ?? 0] ?? uniqueRanks[uniqueRanks.length - 1] ?? 0
		};
	};

	const processItems = (): IPublicUser[] => {
		const { startRank, endRank } = calculateRankRange(page);
		const items =
			page === 1
				? data.items.filter((item) => item.rank != null && item.rank >= 4 && item.rank <= 10)
				: page === 2
					? data.items.filter((item) => item.rank != null && item.rank >= 11 && item.rank <= 20)
					: data.items.filter((item) => item.rank != null && item.rank >= startRank && item.rank <= endRank);

		const rankGroups = items.reduce<Record<number, IPublicUser[]>>((acc, item) => {
			const rank = item.rank ?? 0;
			return {
				...acc,
				[rank]: [...(acc[rank as number] || []), item]
			};
		}, {});

		if (!user?.publicUser) {
			return Object.values(rankGroups).flat();
		}

		const userRank = user.publicUser.rank ?? 0;
		if (userRank <= 3) {
			return Object.values(rankGroups).flat();
		}

		const sameRankUsers = data.items.filter((item) => item.rank != null && item.rank === userRank);
		const isUserRankInCurrentPage = page === 1 ? userRank >= 4 && userRank <= 10 : userRank >= startRank && userRank <= endRank;

		if (!isUserRankInCurrentPage) {
			return Object.values(rankGroups).flat();
		}

		const userEntry: IPublicUser = {
			...user.publicUser,
			username: user.username ?? 'Unknown User'
		};

		const updatedRankGroups = {
			...rankGroups,
			[userRank]: [userEntry, ...sameRankUsers.filter((item) => item.id !== user.publicUser?.id)]
		};

		return Object.entries(updatedRankGroups)
			.sort(([rankA], [rankB]) => Number(rankA) - Number(rankB))
			.flatMap(([, users]) => users);
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
				<div className='flex min-h-[200px] items-center justify-center'>
					<div className='flex w-full items-center justify-center md:-ml-60'>
						<div className='relative flex-shrink-0'>
							<Image
								src={Trophy}
								alt='Cup'
								width={256}
								height={256}
								className='h-auto w-24 md:w-52 lg:w-64'
								priority
							/>
						</div>
						<div className='flex flex-col items-center justify-center text-center'>
							<p className='text-2xl font-semibold text-white lg:text-4xl'>{t('Leaderboard.leaderboard')}</p>
							<p className='text-white md:whitespace-nowrap'>{t('Leaderboard.findYourRank')}</p>
						</div>
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
							pageSearchParam='page'
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default Leaderboard;
