// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EVoteDecision, IVoteData } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { FIVE_MIN } from '@/app/api/_api-constants/timeConstants';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ThumbsDown, ThumbsUp, Ban } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/Tabs';
import { cn } from '@/lib/utils';
import { THEME_COLORS } from '@/app/_style/theme';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import classes from './VoteHistory.module.scss';
import VoteHistoryTable from '../VoteHistoryTable';

function VoteHistory({ proposalType, index }: { proposalType: EProposalType; index: string }) {
	const [tab, setTab] = useState(EVoteDecision.AYE);
	const [page, setPage] = useState(1);

	const fetchVoteHistory = async (pageNumber: number) => {
		const { data, error } = await NextApiClientService.getVotesHistoryApi({ proposalType, index, page: pageNumber });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};
	const { data, refetch, isFetching } = useQuery({
		queryKey: ['voteHistory', proposalType, index, page],
		queryFn: ({ queryKey }) => fetchVoteHistory(queryKey[3] as number),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN
	});
	const ayeVotes: IVoteData[] = [];
	const nayVotes: IVoteData[] = [];
	const abstainVotes: IVoteData[] = [];

	data?.votes?.forEach((vote: IVoteData) => {
		if (vote.decision === EVoteDecision.AYE) {
			ayeVotes.push(vote);
		} else if (vote.decision === EVoteDecision.NAY) {
			nayVotes.push(vote);
		} else if (vote.decision === EVoteDecision.ABSTAIN) {
			abstainVotes.push(vote);
		}
	});
	return (
		<div>
			<Tabs
				defaultValue={tab}
				onValueChange={(t) => setTab(t as EVoteDecision)}
			>
				<TabsList className={classes.tabsList}>
					<TabsTrigger
						className={cn(classes.tabsTrigger, 'data-[state=active]:bg-success')}
						value={EVoteDecision.AYE}
					>
						<ThumbsUp
							fill={tab === EVoteDecision.AYE ? THEME_COLORS.light.btn_primary_text : THEME_COLORS.light.wallet_btn_text}
							className='h-4 w-4'
						/>
						Aye
					</TabsTrigger>
					<TabsTrigger
						className={cn(classes.tabsTrigger, 'data-[state=active]:bg-failure')}
						value={EVoteDecision.NAY}
					>
						<ThumbsDown
							fill={tab === EVoteDecision.NAY ? THEME_COLORS.light.btn_primary_text : THEME_COLORS.light.wallet_btn_text}
							className='h-4 w-4'
						/>
						Nay
					</TabsTrigger>
					<TabsTrigger
						className={cn(classes.tabsTrigger, 'data-[state=active]:bg-decision_bar_indicator')}
						value={EVoteDecision.ABSTAIN}
					>
						<Ban className='h-4 w-4' />
						Abstain
					</TabsTrigger>
				</TabsList>
				<TabsContent
					value={EVoteDecision.AYE}
					className='flex max-h-[500px] flex-col'
				>
					<VoteHistoryTable
						votes={ayeVotes}
						loading={isFetching}
					/>
				</TabsContent>
				<TabsContent value={EVoteDecision.NAY}>
					<VoteHistoryTable
						votes={nayVotes}
						loading={isFetching}
					/>
				</TabsContent>
				<TabsContent value={EVoteDecision.ABSTAIN}>
					<VoteHistoryTable
						votes={abstainVotes}
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
					refetch();
				}}
			/>
		</div>
	);
}

export default VoteHistory;
