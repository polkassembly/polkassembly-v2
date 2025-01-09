// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IVoteData } from '@/_shared/types';
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import React, { useState } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { THEME_COLORS } from '@/app/_style/theme';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../Table';
import Address from '../../Profile/Address/Address';
import { Button } from '../../Button';
import LoadingLayover from '../../LoadingLayover';

function SortingIcon({ sort }: { sort: 'asc' | 'desc' | false }) {
	return sort === 'asc' ? (
		<ChevronUp
			className='text-xs text-wallet_btn_text'
			fill={THEME_COLORS.light.wallet_btn_text}
		/>
	) : (
		<ChevronDown
			className='text-xs text-wallet_btn_text'
			fill={THEME_COLORS.light.wallet_btn_text}
		/>
	);
}

const columns: ColumnDef<IVoteData>[] = [
	{ header: 'Account', accessorKey: 'voterAddress' },
	{
		header: ({ column }) => (
			<Button
				variant='ghost'
				className='flex items-center gap-x-2 text-xs font-medium text-wallet_btn_text'
				onClick={() => column.toggleSorting()}
			>
				Capital
				<SortingIcon sort={column.getIsSorted()} />
			</Button>
		),
		accessorKey: 'balanceValue'
	},
	{
		header: ({ column }) => (
			<Button
				variant='ghost'
				className='flex items-center gap-x-2 text-xs font-medium text-wallet_btn_text'
				onClick={() => column.toggleSorting()}
			>
				Voting Power
				<SortingIcon sort={column.getIsSorted()} />
			</Button>
		),
		accessorKey: 'selfVotingPower'
	},
	{
		header: ({ column }) => (
			<Button
				variant='ghost'
				className='flex items-center gap-x-2 text-xs font-medium text-wallet_btn_text'
				onClick={() => column.toggleSorting()}
			>
				Delegated
				<SortingIcon sort={column.getIsSorted()} />
			</Button>
		),
		accessorKey: 'delegatedVotingPower'
	}
];

function VoteHistoryTable({ votes, loading }: { votes: IVoteData[]; loading?: boolean }) {
	const network = getCurrentNetwork();

	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data: votes,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting
		}
	});

	return (
		<Table className='relative'>
			{loading && <LoadingLayover />}
			<TableHeader className='w-full'>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<TableHead
								className='text-xs font-medium text-wallet_btn_text'
								key={header.id}
							>
								{flexRender(header.column.columnDef.header, header.getContext())}
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody className='flex-1 overflow-y-auto'>
				{table.getRowModel().rows.map((vote) => (
					<TableRow key={`${vote.original.balanceValue}-${vote.original.voterAddress}`}>
						<TableCell className='py-4'>
							<Address address={vote.original.voterAddress} />
						</TableCell>
						<TableCell className='py-4'>{formatBnBalance(vote.original.balanceValue || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
						<TableCell className='py-4'>{formatBnBalance(vote.original.selfVotingPower || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
						<TableCell className='py-4'>{formatBnBalance(vote.original.delegatedVotingPower || '0', { withUnit: true, numberAfterComma: 2 }, network)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

export default VoteHistoryTable;
