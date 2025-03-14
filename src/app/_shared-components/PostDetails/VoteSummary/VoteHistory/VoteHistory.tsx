// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EVoteDecision } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ThumbsDown, ThumbsUp, Ban } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/Tabs';
import { THEME_COLORS } from '@/app/_style/theme';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import VoteHistoryTable from './VoteHistoryTable';
import classes from './VoteHistory.module.scss';

function VoteHistory({ proposalType, index }: { proposalType: EProposalType; index: string }) {
	const t = useTranslations();
	const [tab, setTab] = useState(EVoteDecision.AYE);
	const [page, setPage] = useState(1);

	const fetchVoteHistory = async (pageNumber: number, decision: EVoteDecision) => {
		const { data, error } = await NextApiClientService.getVotesHistory({ proposalType, index, page: pageNumber, decision });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};
	const { data, isFetching } = useQuery({
		queryKey: ['voteHistory', proposalType, index, page, tab],
		queryFn: ({ queryKey }) => fetchVoteHistory(queryKey[3] as number, queryKey[4] as EVoteDecision),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI
	});

	return (
		<div>
			<Tabs
				defaultValue={tab}
				onValueChange={(voteTab) => {
					setTab(voteTab as EVoteDecision);
					setPage(1);
				}}
			>
				<TabsList className='flex gap-x-2 rounded border border-border_grey p-1'>
					<TabsTrigger
						className={cn(classes.tabs, 'py-1.5 data-[state=active]:border-none data-[state=active]:bg-success data-[state=active]:text-white')}
						value={EVoteDecision.AYE}
					>
						<ThumbsUp
							fill={tab === EVoteDecision.AYE ? THEME_COLORS.light.btn_primary_text : THEME_COLORS.light.wallet_btn_text}
							className='h-4 w-4'
						/>
						{t('PostDetails.aye')}
					</TabsTrigger>
					<TabsTrigger
						className={cn(classes.tabs, 'py-1.5 data-[state=active]:border-none data-[state=active]:bg-failure data-[state=active]:text-white')}
						value={EVoteDecision.NAY}
					>
						<ThumbsDown
							fill={tab === EVoteDecision.NAY ? THEME_COLORS.light.btn_primary_text : THEME_COLORS.light.wallet_btn_text}
							className='h-4 w-4'
						/>
						{t('PostDetails.nay')}
					</TabsTrigger>
					<TabsTrigger
						className={cn(classes.tabs, 'py-1.5 data-[state=active]:border-none data-[state=active]:bg-decision_bar_indicator data-[state=active]:text-white')}
						value={EVoteDecision.SPLIT_ABSTAIN}
					>
						<Ban className='h-4 w-4' />
						{t('PostDetails.abstain')}
					</TabsTrigger>
				</TabsList>
				<TabsContent value={EVoteDecision.AYE}>
					<VoteHistoryTable
						votes={data?.votes || []}
						loading={isFetching}
					/>
				</TabsContent>
				<TabsContent value={EVoteDecision.NAY}>
					<VoteHistoryTable
						votes={data?.votes || []}
						loading={isFetching}
					/>
				</TabsContent>
				<TabsContent value={EVoteDecision.SPLIT_ABSTAIN}>
					<VoteHistoryTable
						votes={data?.votes || []}
						loading={isFetching}
					/>
				</TabsContent>
			</Tabs>
			<PaginationWithLinks
				page={page}
				pageSize={DEFAULT_LISTING_LIMIT}
				totalCount={data?.totalCount || 0}
				onClick={(pageNumber) => {
					setPage(pageNumber);
				}}
			/>
		</div>
	);
}

export default VoteHistory;
