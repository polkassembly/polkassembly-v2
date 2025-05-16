// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EVoteSortOptions, IVoteData } from '@/_shared/types';
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import React, { useState } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { THEME_COLORS } from '@/app/_style/theme';
import { useTranslations } from 'next-intl';
import { Collapsible, CollapsibleContent } from '@/app/_shared-components/Collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../Table';
import Address from '../../../Profile/Address/Address';
import { Button } from '../../../Button';
import LoadingLayover from '../../../LoadingLayover';
import classes from './VoteHistory.module.scss';
import DelegatedVotesDropdown from './DelegatedVotesDropdown/DelegatedVotesDropdown';

function SortingIcon({ sort }: { sort: 'asc' | 'desc' | false }) {
	return sort === 'desc' ? (
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

const columns = (t: (key: string) => string, orderBy: EVoteSortOptions, onOrderByChange: (orderBy: EVoteSortOptions) => void): ColumnDef<IVoteData>[] => [
	{ header: t('PostDetails.account'), accessorKey: 'voterAddress' },
	{
		header: () => (
			<Button
				variant='ghost'
				className='flex items-center gap-x-2 p-0 text-xs font-medium text-wallet_btn_text'
				onClick={() => onOrderByChange(orderBy === EVoteSortOptions.BalanceValueDESC ? EVoteSortOptions.BalanceValueASC : EVoteSortOptions.BalanceValueDESC)}
			>
				{t('PostDetails.capital')}
				<SortingIcon sort={orderBy === EVoteSortOptions.BalanceValueDESC ? 'desc' : 'asc'} />
			</Button>
		),
		accessorKey: 'balanceValue'
	},
	{
		header: () => (
			<Button
				variant='ghost'
				className='flex items-center gap-x-2 p-0 text-xs font-medium text-wallet_btn_text'
				onClick={() => onOrderByChange(orderBy === EVoteSortOptions.SelfVotingPowerDESC ? EVoteSortOptions.SelfVotingPowerASC : EVoteSortOptions.SelfVotingPowerDESC)}
			>
				{t('PostDetails.votingPower')}
				<SortingIcon sort={orderBy === EVoteSortOptions.SelfVotingPowerDESC ? 'desc' : 'asc'} />
			</Button>
		),
		accessorKey: 'selfVotingPower'
	},
	{
		header: () => (
			<Button
				variant='ghost'
				className='flex items-center gap-x-2 p-0 text-xs font-medium text-wallet_btn_text'
				onClick={() =>
					onOrderByChange(orderBy === EVoteSortOptions.DelegatedVotingPowerDESC ? EVoteSortOptions.DelegatedVotingPowerASC : EVoteSortOptions.DelegatedVotingPowerDESC)
				}
			>
				{t('PostDetails.delegated')}
				<SortingIcon sort={orderBy === EVoteSortOptions.DelegatedVotingPowerDESC ? 'desc' : 'asc'} />
			</Button>
		),
		accessorKey: 'delegatedVotingPower'
	}
];

function VoteHistoryTable({
	votes,
	loading,
	orderBy,
	onOrderByChange
}: {
	votes: IVoteData[];
	loading?: boolean;
	orderBy: EVoteSortOptions;
	onOrderByChange: (orderBy: EVoteSortOptions) => void;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const [sorting, setSorting] = useState<SortingState>([]);
	const [openRow, setOpenRow] = useState<string | null>(null);

	const table = useReactTable({
		data: votes,
		columns: columns(t, orderBy, onOrderByChange),
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting
		}
	});

	return (
		<div className={classes.tableContainer}>
			{loading && <LoadingLayover />}
			<Table className={classes.table}>
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
				<TableBody>
					{table.getRowModel().rows.map((vote) => {
						const voteData = vote.original;
						const isOpen = openRow === voteData.voterAddress;
						const voterDelegations = Array.isArray(voteData.delegatedVotes) ? voteData.delegatedVotes : [];
						const hasDelegatedVotes = voterDelegations.length > 0;

						const lockPeriod = !voteData.lockPeriod || voteData.lockPeriod === 0 ? 0.1 : voteData.lockPeriod;

						return (
							<React.Fragment key={voteData.voterAddress}>
								<TableRow
									className={hasDelegatedVotes ? 'cursor-pointer' : ''}
									onClick={() => hasDelegatedVotes && setOpenRow(isOpen ? null : voteData.voterAddress)}
								>
									<TableCell className='max-w-[200px] py-4'>
										<Address address={voteData.voterAddress} />
									</TableCell>
									<TableCell className='py-4'>
										<div className='flex items-center justify-between gap-x-4'>
											{formatBnBalance(voteData.balanceValue || '0', { compactNotation: true, withUnit: true, numberAfterComma: 2 }, network)}
											<span className='text-xs text-wallet_btn_text'>
												{lockPeriod}x{hasDelegatedVotes && '/d'}
											</span>
										</div>
									</TableCell>
									<TableCell className='py-4'>
										{formatBnBalance(voteData.selfVotingPower || '0', { compactNotation: true, withUnit: true, numberAfterComma: 2 }, network)}
									</TableCell>
									<TableCell className='py-4'>
										{formatBnBalance(voteData.delegatedVotingPower || '0', { compactNotation: true, withUnit: true, numberAfterComma: 2 }, network)}
									</TableCell>
									<TableCell className='py-4'>
										{hasDelegatedVotes && (
											<button
												type='button'
												className='collapsibleButton'
												onClick={() => setOpenRow(isOpen ? null : voteData.voterAddress)}
											>
												{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
											</button>
										)}
									</TableCell>
								</TableRow>
								<TableCell
									className='p-0'
									colSpan={5}
								>
									{hasDelegatedVotes && (
										<Collapsible open={openRow === voteData.voterAddress}>
											<CollapsibleContent asChild>
												<DelegatedVotesDropdown
													voteData={voteData}
													voterDelegations={voterDelegations}
												/>
											</CollapsibleContent>
										</Collapsible>
									)}
								</TableCell>
							</React.Fragment>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}

export default VoteHistoryTable;
