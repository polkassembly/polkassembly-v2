// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EVoteDecision, IVoteData } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { FIVE_MIN } from '@/app/api/_api-constants/timeConstants';
import { useQuery } from '@tanstack/react-query';
import React, { ReactNode, useState } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ThumbsDown, ThumbsUp, Ban } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../Table';
import Address from '../../Profile/Address/Address';

function VoteHistory({ proposalType, index }: { proposalType: EProposalType; index: string }) {
	const network = getCurrentNetwork();
	const [tab, setTab] = useState(EVoteDecision.AYE);

	const fetchVoteHistory = async () => {
		const { data, error } = await NextApiClientService.getVotesApi({ proposalType, index });

		if (error) {
			throw new Error(error.message || 'Failed to fetch data');
		}
		return data;
	};
	const { data } = useQuery({
		queryKey: ['voteHistory', proposalType, index],
		queryFn: fetchVoteHistory,
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

	const table = useReactTable({
		data: data?.votes || [],
		columns: [
			{ header: 'Account', accessorKey: 'voterAddress' },
			{ header: 'Capital', accessorKey: 'balanceValue' },
			{ header: 'Voting Power', accessorKey: 'selfVotingPower' },
			{ header: 'Delegated', accessorKey: 'delegatedVotingPower' }
		],
		getCoreRowModel: getCoreRowModel()
	});

	return (
		<div>
			<Tabs
				defaultValue={tab}
				onValueChange={(t) => setTab(t as EVoteDecision)}
			>
				<TabsList className='flex gap-x-2 rounded border border-border_grey p-1'>
					<TabsTrigger
						className='text-medium flex w-full items-center justify-center gap-x-2 rounded py-1.5 text-wallet_btn_text data-[state=active]:border-none data-[state=active]:bg-success data-[state=active]:text-white'
						value={EVoteDecision.AYE}
					>
						<ThumbsUp
							fill={tab === EVoteDecision.AYE ? '#fff' : '#485F7D'}
							className='h-4 w-4'
						/>
						Aye
					</TabsTrigger>
					<TabsTrigger
						className='text-medium flex w-full items-center justify-center gap-x-2 rounded py-1.5 text-wallet_btn_text data-[state=active]:border-none data-[state=active]:bg-failure data-[state=active]:text-white'
						value={EVoteDecision.NAY}
					>
						<ThumbsDown
							fill={tab === EVoteDecision.NAY ? '#fff' : '#485F7D'}
							className='h-4 w-4'
						/>
						Nay
					</TabsTrigger>
					<TabsTrigger
						className='text-medium flex w-full items-center justify-center gap-x-2 rounded py-1.5 text-wallet_btn_text data-[state=active]:border-none data-[state=active]:bg-decision_bar_indicator data-[state=active]:text-white'
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
					<Table className=''>
						<TableHeader className='w-full'>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>{header.column.columnDef.header as ReactNode}</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody className='flex-1 overflow-y-auto'>
							{ayeVotes?.map((vote) => (
								<TableRow key={`${vote.balanceValue}-${vote.voterAddress}`}>
									<TableCell className='py-4'>
										<Address address={vote.voterAddress} />
									</TableCell>
									<TableCell className='py-4'>{formatBnBalance(vote.balanceValue || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
									<TableCell className='py-4'>{formatBnBalance(vote.selfVotingPower || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
									<TableCell className='py-4'>{formatBnBalance(vote.delegatedVotingPower || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TabsContent>
				<TabsContent value={EVoteDecision.NAY}>
					<Table className=''>
						<TableHeader className='w-full'>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>{header.column.columnDef.header as ReactNode}</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody className='flex-1 overflow-y-auto'>
							{nayVotes?.map((vote) => (
								<TableRow key={`${vote.balanceValue}-${vote.voterAddress}`}>
									<TableCell className='py-4'>
										<Address address={vote.voterAddress} />
									</TableCell>
									<TableCell className='py-4'>{formatBnBalance(vote.balanceValue || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
									<TableCell className='py-4'>{formatBnBalance(vote.selfVotingPower || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
									<TableCell className='py-4'>{formatBnBalance(vote.delegatedVotingPower || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TabsContent>
				<TabsContent value={EVoteDecision.ABSTAIN}>
					<Table className=''>
						<TableHeader className='w-full'>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>{header.column.columnDef.header as ReactNode}</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody className='flex-1 overflow-y-auto'>
							{abstainVotes?.map((vote) => (
								<TableRow key={`${vote.balanceValue}-${vote.voterAddress}`}>
									<TableCell className='py-4'>
										<Address address={vote.voterAddress} />
									</TableCell>
									<TableCell className='py-4'>{formatBnBalance(vote.balanceValue || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
									<TableCell className='py-4'>{formatBnBalance(vote.selfVotingPower || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
									<TableCell className='py-4'>{formatBnBalance(vote.delegatedVotingPower || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default VoteHistory;
