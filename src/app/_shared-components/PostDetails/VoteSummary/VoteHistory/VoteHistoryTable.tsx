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
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { useTranslations } from 'next-intl';
import { Collapsible, CollapsibleContent } from '@/app/_shared-components/Collapsible';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../Table';
import Address from '../../../Profile/Address/Address';
import { Button } from '../../../Button';
import LoadingLayover from '../../../LoadingLayover';
import classes from './VoteHistory.module.scss';

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

const columns = (t: (key: string) => string): ColumnDef<IVoteData>[] => [
	{ header: t('PostDetails.account'), accessorKey: 'voterAddress' },
	{
		header: ({ column }) => (
			<Button
				variant='ghost'
				className='flex items-center gap-x-2 p-0 text-xs font-medium text-wallet_btn_text'
				onClick={() => column.toggleSorting()}
			>
				{t('PostDetails.capital')}
				<SortingIcon sort={column.getIsSorted()} />
			</Button>
		),
		accessorKey: 'balanceValue'
	},
	{
		header: ({ column }) => (
			<Button
				variant='ghost'
				className='flex items-center gap-x-2 p-0 text-xs font-medium text-wallet_btn_text'
				onClick={() => column.toggleSorting()}
			>
				{t('PostDetails.votingPower')}
				<SortingIcon sort={column.getIsSorted()} />
			</Button>
		),
		accessorKey: 'selfVotingPower'
	},
	{
		header: ({ column }) => (
			<Button
				variant='ghost'
				className='flex items-center gap-x-2 p-0 text-xs font-medium text-wallet_btn_text'
				onClick={() => column.toggleSorting()}
			>
				{t('PostDetails.delegated')}
				<SortingIcon sort={column.getIsSorted()} />
			</Button>
		),
		accessorKey: 'delegatedVotingPower'
	}
];

function VoteHistoryTable({ votes, loading }: { votes: IVoteData[]; loading?: boolean }) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

	const [sorting, setSorting] = useState<SortingState>([]);
	const [openRow, setOpenRow] = useState<string | null>(null);

	const table = useReactTable({
		data: votes,
		columns: columns(t),
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting
		}
	});

	const formatBalance = (balance: string) => {
		return formatter.format(Number(formatBnBalance(balance, { withThousandDelimitor: false }, network)));
	};

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
						const renderCollapsible = voterDelegations.length > 0;

						return (
							<React.Fragment key={voteData.voterAddress}>
								<TableRow className='cursor-pointer'>
									<TableCell className='max-w-[200px] py-4'>
										<Address address={voteData.voterAddress} />
									</TableCell>
									<TableCell className='py-4'>
										{formatBalance(voteData.balanceValue || '0')} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
									</TableCell>
									<TableCell className='py-4'>
										{formatBalance(voteData.selfVotingPower || '0')} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
									</TableCell>
									<TableCell className='py-4'>
										{formatBalance(voteData.delegatedVotingPower || '0')} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
									</TableCell>
									<TableCell className='py-4'>
										{renderCollapsible && (
											<button
												type='submit'
												className='collapsibleButton'
												onClick={() => setOpenRow(isOpen ? null : voteData.voterAddress)}
											>
												{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
											</button>
										)}
									</TableCell>
								</TableRow>

								{renderCollapsible && (
									<TableRow>
										<TableCell colSpan={5}>
											<Collapsible
												open={isOpen}
												onOpenChange={() => setOpenRow(isOpen ? null : voteData.voterAddress)}
											>
												<CollapsibleContent asChild>
													<div>
														<div>
															<div className='mb-3 mt-2 flex items-center justify-between'>
																<span className='text-sm font-medium text-basic_text dark:text-btn_primary_text'>Vote Detail</span>
																<span className='text-xs text-text_primary'>{dayjs(voteData.createdAt ?? '').format("Do MMM 'YY")}</span>
															</div>
															<div className='flex justify-between'>
																<div className='flex w-[200px] flex-col gap-1'>
																	<div className='text-xs font-medium text-basic_text dark:text-btn_primary_text'>Self Votes</div>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-xs text-basic_text'>Voting Power</span>
																		<span className='text-xs text-basic_text dark:text-btn_primary_text'>0 dot</span>
																	</div>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-xs text-basic_text'>Conviction</span>
																		<span className='text-xs text-basic_text dark:text-btn_primary_text'>0x</span>
																	</div>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-xs text-basic_text'>Capital</span>
																		<span className='text-xs text-basic_text dark:text-btn_primary_text'>0 dot</span>
																	</div>
																</div>
																<div className='border-y-0 border-l-2 border-r-0 border-dashed border-primary_border' />
																<div className='mr-3 flex w-[200px] flex-col gap-1'>
																	<div className='text-xs font-medium text-basic_text dark:text-btn_primary_text'>Delegated Votes</div>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-xs text-basic_text'>Voting Power</span>
																		<span className='text-xs text-basic_text dark:text-btn_primary_text'>0 dot</span>
																	</div>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-xs text-basic_text'>Delegators</span>
																		<span className='text-xs text-basic_text dark:text-btn_primary_text'>0x</span>
																	</div>
																	<div className='flex justify-between'>
																		<span className='flex items-center gap-1 text-xs text-basic_text'>Capital</span>
																		<span className='text-xs text-basic_text dark:text-btn_primary_text'>0 dot</span>
																	</div>
																</div>
															</div>
														</div>

														<div className='mt-3 border-b-0 border-l-0 border-r-0 border-t-2 border-dashed border-primary_border pt-2 text-xs text-muted-foreground'>
															<span className='mb-2.5 mt-1 text-sm font-medium text-basic_text dark:text-btn_primary_text'>Delegation List</span>
															<div className='flex items-center justify-between'>
																<span className='text-xs font-medium text-basic_text dark:text-btn_primary_text'>Delegators</span>
																<span className='text-xs font-medium text-basic_text dark:text-btn_primary_text'>Capital</span>
																<span className='text-xs font-medium text-btn_primary_text'>Voting Power</span>
															</div>
															{voterDelegations.map((delegator: IVoteData) => (
																<div
																	key={delegator?.voterAddress}
																	className='my-2 space-y-1 border-b border-dashed border-primary_border'
																>
																	<div className='flex justify-between text-[11px] font-normal text-neutral-700 dark:text-neutral-300 sm:text-xs'>
																		<Address address={delegator?.voterAddress} />
																		<span>{delegator?.lockPeriod || '0'} /d</span>
																		<span>
																			{formatBalance(delegator?.totalVotingPower?.toString() || '0')} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
																		</span>
																	</div>
																</div>
															))}
														</div>
													</div>
												</CollapsibleContent>
											</Collapsible>
										</TableCell>
									</TableRow>
								)}
							</React.Fragment>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}

export default VoteHistoryTable;
