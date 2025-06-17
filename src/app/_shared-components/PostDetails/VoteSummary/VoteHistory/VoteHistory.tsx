// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EVoteDecision, EVoteSortOptions } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ThumbsDown, ThumbsUp, Ban } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/Tabs';
import { THEME_COLORS } from '@/app/_style/theme';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import VoteHistoryTable from './VoteHistoryTable';
import classes from './VoteHistory.module.scss';

function VoteHistory({ proposalType, index }: { proposalType: EProposalType; index: string }) {
	const t = useTranslations();
	const [tab, setTab] = useState<EVoteDecision>(EVoteDecision.AYE);
	const [page, setPage] = useState(1);
	const [sortBy, setSortBy] = useState<EVoteSortOptions>(EVoteSortOptions.CreatedAtBlockDESC);

	const fetchVoteHistory = async (pageNumber: number, decision: EVoteDecision, orderBy: EVoteSortOptions) => {
		const { data, error } = await NextApiClientService.getVotesHistory({ proposalType, index, page: pageNumber, decision, orderBy });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};
	const { data, isLoading } = useQuery({
		queryKey: ['voteHistory', proposalType, index, page, tab, sortBy],
		queryFn: ({ queryKey }) => fetchVoteHistory(queryKey[3] as number, queryKey[4] as EVoteDecision, queryKey[5] as EVoteSortOptions),
		placeholderData: (previousData) => previousData,
		retry: true,
		refetchOnWindowFocus: true,
		refetchOnMount: true
	});

	return (
		<div>
			<Tabs
				defaultValue={tab}
				onValueChange={(voteTab) => {
					setTab(voteTab as EVoteDecision);
					setPage(1);
				}}
				className='mb-2'
			>
				<TabsList className='flex w-full items-center justify-between gap-x-2 rounded border border-border_grey p-1'>
					<TabsTrigger
						className={cn(
							classes.tabs,
							'w-full py-1.5 data-[state=active]:rounded-lg data-[state=active]:border-none data-[state=active]:bg-success data-[state=active]:text-white'
						)}
						value={EVoteDecision.AYE}
					>
						<ThumbsUp
							fill={tab === EVoteDecision.AYE ? THEME_COLORS.light.btn_primary_text : THEME_COLORS.light.wallet_btn_text}
							className='h-4 w-4'
						/>
						{t('PostDetails.aye')} {ValidatorService.isValidNumber(data?.totalCounts?.[EVoteDecision.AYE]) && `(${data?.totalCounts?.[EVoteDecision.AYE]})`}
					</TabsTrigger>
					<TabsTrigger
						className={cn(
							classes.tabs,
							'w-full py-1.5 data-[state=active]:rounded-lg data-[state=active]:border-none data-[state=active]:bg-failure data-[state=active]:text-white'
						)}
						value={EVoteDecision.NAY}
					>
						<ThumbsDown
							fill={tab === EVoteDecision.NAY ? THEME_COLORS.light.btn_primary_text : THEME_COLORS.light.wallet_btn_text}
							className='h-4 w-4'
						/>
						{t('PostDetails.nay')} {ValidatorService.isValidNumber(data?.totalCounts?.[EVoteDecision.NAY]) && `(${data?.totalCounts?.[EVoteDecision.NAY]})`}
					</TabsTrigger>
					<TabsTrigger
						className={cn(
							classes.tabs,
							'w-full py-1.5 data-[state=active]:rounded-lg data-[state=active]:border-none data-[state=active]:bg-decision_bar_indicator data-[state=active]:text-white'
						)}
						value={EVoteDecision.SPLIT_ABSTAIN}
					>
						<Ban className='h-4 w-4' />
						{t('PostDetails.abstain')} {ValidatorService.isValidNumber(data?.totalCounts?.[EVoteDecision.SPLIT_ABSTAIN]) && `(${data?.totalCounts?.[EVoteDecision.SPLIT_ABSTAIN]})`}
					</TabsTrigger>
				</TabsList>
				<TabsContent value={EVoteDecision.AYE}>
					<VoteHistoryTable
						votes={data?.votes || []}
						loading={isLoading}
						orderBy={sortBy}
						onOrderByChange={(newSortBy) => setSortBy(newSortBy)}
					/>
				</TabsContent>
				<TabsContent value={EVoteDecision.NAY}>
					<VoteHistoryTable
						votes={data?.votes || []}
						loading={isLoading}
						orderBy={sortBy}
						onOrderByChange={(newSortBy) => setSortBy(newSortBy)}
					/>
				</TabsContent>
				<TabsContent value={EVoteDecision.SPLIT_ABSTAIN}>
					<VoteHistoryTable
						votes={data?.votes || []}
						loading={isLoading}
						orderBy={sortBy}
						onOrderByChange={(newSortBy) => setSortBy(newSortBy)}
					/>
				</TabsContent>
			</Tabs>
			{!!data?.totalCounts?.[`${tab}`] && (
				<PaginationWithLinks
					page={page}
					pageSize={DEFAULT_LISTING_LIMIT}
					totalCount={data?.totalCounts?.[`${tab}`] || 0}
					onPageChange={(newPage) => setPage(newPage)}
				/>
			)}
		</div>
	);
}

export default VoteHistory;
