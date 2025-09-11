// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IGenericListingResponse, IPublicUser } from '@/_shared/types';
import { useMemo, useState, useCallback, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@ui/Table';
import { PaginationWithLinks } from '@ui/PaginationWithLinks';
import { ListFilter, Search } from 'lucide-react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import RankCard from './RankCard';
import styles from './Leaderboard.module.scss';
import LeadboardRow from './LeadboardTable';

interface RankRange {
	startRank: number;
	endRank: number;
}

function Leaderboard({ data, top3RankData }: { data: IGenericListingResponse<IPublicUser>; top3RankData: IGenericListingResponse<IPublicUser> }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const page = parseInt(searchParams?.get('page') ?? '1', DEFAULT_LISTING_LIMIT);
	const searchParamTerm = searchParams?.get('search') ?? '';
	const [searchTerm, setSearchTerm] = useState<string>(searchParamTerm);
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const [searchResults, setSearchResults] = useState<IGenericListingResponse<IPublicUser> | null>(null);
	const t = useTranslations();
	const { user } = useUser();

	const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	}, []);

	const handleSearch = useCallback(async () => {
		if (!searchTerm.trim()) {
			setSearchResults(null);
			const url = new URL(window.location.href);
			url.searchParams.delete('search');
			router.push(url.pathname + url.search);
			return;
		}

		setIsSearching(true);
		try {
			const { data: searchData } = await NextApiClientService.fetchLeaderboardApi({
				page: 1,
				searchTerm: searchTerm.trim()
			});

			setSearchResults(searchData || null);

			const url = new URL(window.location.href);
			url.searchParams.set('search', searchTerm.trim());
			url.searchParams.set('page', '1');
			router.push(url.pathname + url.search);
		} catch {
			setIsSearching(false);
		} finally {
			setIsSearching(false);
		}
	}, [searchTerm, router]);

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
		if (searchResults) {
			return searchResults.items;
		}

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
	const processDisplayedItems = useMemo<IPublicUser[]>(() => processItems(), [data.items, page, user, searchResults, searchTerm]);

	const shouldShowUserAtBottom = useMemo(() => {
		if (!user?.publicUser?.rank) return false;
		if (user.publicUser.rank <= 3) return false;

		if (searchResults) {
			return !searchResults.items.some((item) => item.id === user.publicUser?.id);
		}

		const { startRank, endRank } = calculateRankRange(page);
		return user.publicUser.rank < startRank || user.publicUser.rank > endRank;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, page, searchResults]);

	return (
		<div>
			<div className='flex flex-wrap items-center justify-center gap-4 xl:flex-nowrap'>
				{top3RankData.items.map((item: IPublicUser, index: number) => (
					<RankCard
						key={item.id}
						item={item}
						place={index + 1}
					/>
				))}
			</div>

			<div className='mt-6 rounded-2xl border border-primary_border bg-bg_modal p-6 lg:mx-20'>
				<div className='flex flex-wrap items-center justify-between gap-4 pb-5'>
					<div>
						<p className='text-lg font-semibold'>{t('Leaderboard.top50Ranks')}</p>
					</div>
					<div className='flex items-center gap-3'>
						<div className='flex items-center gap-2 rounded-md border border-primary_border bg-bg_modal px-3 py-1'>
							<input
								type='search'
								placeholder={t('Leaderboard.enterAddressToSearch')}
								className='w-28 bg-transparent text-sm outline-none placeholder:text-placeholder lg:w-60'
								aria-label={t('Leaderboard.searchAria')}
								value={searchTerm}
								onChange={handleSearchChange}
								onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
								disabled={isSearching}
							/>
							<button
								type='button'
								aria-label={t('Leaderboard.searchAria')}
								className='ml-2 rounded-md bg-transparent p-1 text-sm'
								onClick={handleSearch}
								disabled={isSearching}
							>
								{isSearching ? <div className='h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent' /> : <Search className='h-4 w-4' />}
							</button>
						</div>
						<button
							type='button'
							className='rounded-md border border-primary_border bg-bg_modal px-4 py-2 text-sm'
							onClick={() => {
								setSearchTerm('');
								setSearchResults(null);
								const url = new URL(window.location.href);
								url.searchParams.delete('search');
								router.push(url.pathname + url.search);
							}}
							disabled={isSearching}
						>
							{searchParamTerm ? t('Leaderboard.clearSearch') : t('Leaderboard.current')}
						</button>
						<button
							type='button'
							aria-label={t('Leaderboard.filtersAria')}
							className='flex h-10 w-10 items-center justify-center rounded-md border border-primary_border bg-bg_modal'
						>
							<ListFilter className='h-4 w-4' />
						</button>
					</div>
				</div>

				<div className='w-full overflow-x-auto'>
					<div className='inline-block min-w-full align-middle'>
						<Table className='min-w-[680px]'>
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
								{isSearching ? (
									<TableRow>
										<td
											colSpan={5}
											className='py-10 text-center'
										>
											<div className='flex justify-center'>
												<div className='h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent' />
											</div>
											<p className='mt-4 text-sm text-muted-foreground'>{t('Leaderboard.searching')}</p>
										</td>
									</TableRow>
								) : (
									<>
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
									</>
								)}
							</TableBody>
						</Table>
					</div>
				</div>

				{(searchResults ? searchResults.totalCount : data.totalCount) > DEFAULT_LISTING_LIMIT && (
					<div className='mt-5 w-full'>
						<PaginationWithLinks
							page={page}
							pageSize={DEFAULT_LISTING_LIMIT}
							totalCount={searchResults ? searchResults.totalCount : data.totalCount}
							pageSearchParam='page'
						/>
					</div>
				)}
			</div>
		</div>
	);
}

export default Leaderboard;
