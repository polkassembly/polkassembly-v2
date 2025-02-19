// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IChildBounty, IPostListing, EProposalStatus } from '@/_shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import Address from '@ui/Profile/Address/Address';
import StatusTag from '@ui/StatusTag/StatusTag';
import { useState } from 'react';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import Image from 'next/image';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import ChildBountiesIcon from '@assets/bounties/bountieslistingchildlevelone.svg';
import ChildBountiesLevelZeroIcon from '@assets/bounties/bountieslistingchildlevelzero.svg';
import styles from './Bounties.module.scss';

interface IChildBountiesResponse {
	totalCount: number;
	items: IChildBounty[];
}

function BountyTable({ filteredItems }: { filteredItems: IPostListing[] }) {
	const [expandedRows, setExpandedRows] = useState<number[]>([]);
	const [childBounties, setChildBounties] = useState<Record<number, IChildBountiesResponse>>({});
	const [loading, setLoading] = useState<Record<number, boolean>>({});
	const [errors, setErrors] = useState<Record<number, string>>({});
	const network = getCurrentNetwork();

	const fetchChildBounties = async (index: number) => {
		try {
			setLoading({ ...loading, [index]: true });
			setErrors({ ...errors, [index]: '' });

			const response = await NextApiClientService.fetchChildBountiesApi({ bountyIndex: index });

			if (response.error) {
				throw new Error(response.error.message || 'Failed to fetch child bounties');
			}

			if (!response.data) {
				throw new Error('No data received from API');
			}

			const childBountiesResponse: IChildBountiesResponse = {
				totalCount: response.data.totalCount ?? 0,
				items:
					response.data.items?.map((item) => ({
						index: item.index ?? 0,
						title: item.title ?? '',
						tags: item.tags ?? [],
						proposalType: item.proposalType,
						network: item.network,
						onChainInfo: {
							status: item.onChainInfo?.status ?? EProposalStatus.Unknown,
							reward: item.onChainInfo?.reward ?? '',
							createdAt: item.onChainInfo?.createdAt ? new Date(item.onChainInfo.createdAt) : new Date(),
							curator: item.onChainInfo?.curator ?? undefined,
							description: item.onChainInfo?.description ?? '',
							index: item.onChainInfo?.index ?? 0,
							origin: item.onChainInfo?.origin ?? '',
							proposer: item.onChainInfo?.proposer ?? '',
							type: item.onChainInfo?.type ?? item.proposalType,
							hash: item.onChainInfo?.hash ?? ''
						}
					})) ?? []
			};

			setChildBounties({ ...childBounties, [index]: childBountiesResponse });
		} catch (error) {
			setErrors({
				...errors,
				[index]: error instanceof Error ? error.message : 'Failed to fetch child bounties'
			});
		} finally {
			setLoading({ ...loading, [index]: false });
		}
	};
	const toggleRow = async (index: number) => {
		if (expandedRows.includes(index)) {
			setExpandedRows(expandedRows.filter((id) => id !== index));
		} else {
			setExpandedRows([...expandedRows, index]);
			if (!childBounties[index as number]) {
				await fetchChildBounties(index);
			}
		}
	};

	const renderChildBounties = (parentIndex: number) => {
		if (loading[parentIndex as number]) {
			return (
				<TableRow className={styles.childBountyRow}>
					<TableCell
						colSpan={7}
						className='p-4 text-center'
					>
						<div className='flex items-center justify-center space-x-2'>
							<div className='h-4 w-4 animate-spin rounded-full border-b-2 border-primary' />
							<span>Loading child bounties...</span>
						</div>
					</TableCell>
				</TableRow>
			);
		}

		if (errors[parentIndex as number]) {
			return (
				<TableRow className={styles.childBountyRow}>
					<TableCell
						colSpan={7}
						className='p-4 text-center text-red-500'
					>
						{errors[parentIndex as number]}
					</TableCell>
				</TableRow>
			);
		}

		const childBountiesData = childBounties[parentIndex as number];
		if (!childBountiesData?.items?.length) {
			return (
				<TableRow className={styles.childBountyRow}>
					<TableCell
						colSpan={7}
						className='p-4 text-center'
					>
						No child bounties found
					</TableCell>
				</TableRow>
			);
		}
		return childBountiesData.items.map((childBounty, index) => (
			<TableRow
				key={childBounty.index}
				className={`${styles.tableBodyRow} ${styles.childBountyRow}`}
			>
				<TableCell className={styles.tableCellBody_1}>
					<div className='flex h-6 items-center justify-start space-x-4 pl-2 pt-1'>
						{childBountiesData.items.length === 1 || index === childBountiesData.items.length - 1 ? (
							<Image
								src={ChildBountiesLevelZeroIcon}
								alt='Child Bounty Icon'
								width={10}
								height={4}
								priority
							/>
						) : (
							<Image
								src={ChildBountiesIcon}
								alt='Child Bounty Icon'
								width={9}
								height={9}
								priority
							/>
						)}
						<span className='ml-8'>{childBounty.index}</span>
					</div>
				</TableCell>
				<TableCell className={styles.tableCell}>{childBounty.onChainInfo?.curator ? <Address address={childBounty.onChainInfo.curator} /> : '-'}</TableCell>
				<TableCell className={styles.tableCell}>{childBounty.title || '-'}</TableCell>
				<TableCell className={styles.tableCell}>
					{childBounty.onChainInfo?.reward
						? formatBnBalance(childBounty.onChainInfo.reward.toString(), { withThousandDelimitor: false, withUnit: true, numberAfterComma: 2 }, network)
						: '-'}
				</TableCell>
				<TableCell className={styles.tableCell}>{childBounty.onChainInfo?.createdAt ? dayjs.utc(childBounty.onChainInfo.createdAt).format("DD MMM 'YY") : '-'}</TableCell>
				<TableCell className={styles.tableCell_status}>
					{childBounty.onChainInfo?.status ? (
						<StatusTag
							className='text-center'
							status={childBounty.onChainInfo.status}
						/>
					) : (
						'-'
					)}
				</TableCell>
				<TableCell className={styles.tableCellBody_last}>{childBounty.tags?.length > 0 ? childBounty.tags.join(', ') : 'N/A'}</TableCell>
			</TableRow>
		));
	};
	return (
		<Table className={styles.table}>
			<TableHeader>
				<TableRow className={styles.tableRow}>
					<TableHead className={`${styles.tableCell_1} w-24 pl-10`}>#</TableHead>
					<TableHead className={styles.tableCell_2}>Curator</TableHead>
					<TableHead className={styles.tableCell}>Title</TableHead>
					<TableHead className={styles.tableCell}>Amount</TableHead>
					<TableHead className={styles.tableCell}>Date</TableHead>
					<TableHead className={styles.tableCell}>Status</TableHead>
					<TableHead className={styles.tableCell_last}>Categories</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{filteredItems?.map((item) => (
					<>
						<TableRow
							className={styles.tableBodyRow}
							key={item?.index}
						>
							<TableCell className={styles.tableCellBody_1}>
								<div className='flex items-center gap-2'>
									{item.onChainInfo?.childBountiesCount && item.onChainInfo?.childBountiesCount > 0 ? (
										<div className='flex items-center gap-2'>
											<div className='w-6'>
												<button
													type='button'
													onClick={() => toggleRow(item.index ?? 0)}
													className='rounded p-1 transition-colors'
													title={`${expandedRows.includes(item.index ?? 0) ? 'Hide' : 'Show'} child bounties`}
												>
													{expandedRows.includes(item.index ?? 0) ? <FaCaretUp className='h-4 w-4 text-navbar_border' /> : <FaCaretDown className='h-4 w-4' />}
												</button>
											</div>
											<span>{item.index}</span>
										</div>
									) : (
										<div className='pl-8'>
											<span>{item.index}</span>
										</div>
									)}
								</div>
							</TableCell>
							<TableCell className={styles.tableCell}>{item.onChainInfo?.curator ? <Address address={item.onChainInfo?.curator} /> : '-'}</TableCell>
							<TableCell className={styles.tableCell}>{item.title}</TableCell>
							<TableCell className={styles.tableCell}>{item.dataSource}</TableCell>
							<TableCell className={styles.tableCell}>{dayjs.utc(item.onChainInfo?.createdAt).format("DD MMM 'YY")}</TableCell>
							<TableCell className={styles.tableCell_status}>
								<StatusTag
									className='text-center'
									status={item.onChainInfo?.status}
								/>
							</TableCell>
							<TableCell className={styles.tableCellBody_last}>{item.tags && item.tags.length > 0 ? item.tags.join(', ') : 'N/A'}</TableCell>
						</TableRow>
						{expandedRows.includes(item.index ?? 0) && renderChildBounties(item.index ?? 0)}
					</>
				))}
			</TableBody>
		</Table>
	);
}

export default BountyTable;
