import { IVoteData } from '@/_shared/types';
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import React, { useState } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { THEME_COLORS } from '@/app/_style/theme';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../Table';
import Address from '../../../Profile/Address/Address';
import { Button } from '../../../Button';
import LoadingLayover from '../../../LoadingLayover';
import classes from './VoteHistory.module.scss';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_shared-components/Collapsible';

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
				<TableBody className='flex-1 overflow-y-auto'>
					{table.getRowModel().rows.map((vote) => {
						const voteData = vote.original;
						const isOpen = openRow === voteData.voterAddress;
						const voterDelegations = voteData.delegatedVotes && Array.isArray(voteData.delegatedVotes) ? voteData.delegatedVotes : [];

						const renderCollapsible = voterDelegations.length > 0;

						return (
							<React.Fragment key={voteData.voterAddress}>
								{renderCollapsible ? (
									<Collapsible
										key={voteData.voterAddress}
										open={isOpen}
										onOpenChange={() => setOpenRow(isOpen ? null : voteData.voterAddress)}
									>
										<CollapsibleTrigger asChild>
											<TableRow className='cursor-pointer'>
												<TableCell className='max-w-[200px] py-4'>
													<div className='flex items-center gap-2'>
														<Address address={voteData.voterAddress} />
														<button className='collapsibleButton'>{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
													</div>
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
											</TableRow>
										</CollapsibleTrigger>

										<CollapsibleContent asChild>
											<TableRow className='collapsibleContent'>
												<TableCell colSpan={4}>
													<div className='pl-6 pt-2 text-xs text-muted-foreground'>
														<strong>Delegation List</strong>
														<div className='mt-2 space-y-1'>
															{voterDelegations.map((delegator: any, index) => (
																<div
																	key={index}
																	className='flex justify-between text-[11px] font-normal text-neutral-700 dark:text-neutral-300 sm:text-xs'
																>
																	<span>{delegator.delegator}</span>
																	<span>{formatBalance(delegator.capital)} /d</span>
																	<span>
																		{formatBalance(delegator.votingPower)} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
																	</span>
																</div>
															))}
														</div>
													</div>
												</TableCell>
											</TableRow>
										</CollapsibleContent>
									</Collapsible>
								) : (
									<TableRow className='cursor-pointer'>
										<TableCell className='max-w-[200px] py-4'>
											<div className='flex items-center gap-2'>
												<Address address={voteData.voterAddress} />
											</div>
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
