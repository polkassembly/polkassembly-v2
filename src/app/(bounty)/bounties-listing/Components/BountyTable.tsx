// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPostListing } from '@/_shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import Address from '@ui/Profile/Address/Address';
import StatusTag from '@ui/StatusTag/StatusTag';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { Clock } from 'lucide-react';
import { useChildBounties } from '@/hooks/useChildBounties';
import { useTranslations } from 'next-intl';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import styles from './Bounties.module.scss';
import ChildBountiesRow from './ChildBountiesRow';

function BountyTable({ filteredItems }: { filteredItems: IPostListing[] }) {
	const { expandedRows, childBounties, loading, errors, toggleRow } = useChildBounties();
	const network = getCurrentNetwork();

	const t = useTranslations();
	return (
		<Table className={styles.table}>
			<TableHeader>
				<TableRow className={styles.tableRow}>
					<TableHead className={`${styles.tableCell_1} w-24 pl-10`}>#</TableHead>
					<TableHead className={styles.tableCell_2}>{t('Bounties.curator')}</TableHead>
					<TableHead className={styles.tableCell}>{t('Bounties.title')}</TableHead>
					<TableHead className={styles.tableCell}>{t('Bounties.amount')}</TableHead>
					<TableHead className={styles.tableCell}>{t('Bounties.date')}</TableHead>
					<TableHead className={styles.tableCell}>{t('Bounties.status')}</TableHead>
					<TableHead className={styles.tableCell_last}>{t('Bounties.categories')}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{filteredItems?.map((item) => (
					<>
						<TableRow
							className={styles.tableBodyRow}
							key={item?.index}
						>
							<TableCell className={styles.tableCellBody}>
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
							<TableCell className={styles.tableCell}>
								{item.onChainInfo?.reward
									? formatBnBalance(item.onChainInfo.reward.toString(), { withThousandDelimitor: false, withUnit: true, numberAfterComma: 2, compactNotation: true }, network)
									: '-'}
							</TableCell>
							<TableCell className={styles.tableCell_createdAt}>
								<Clock className='h-4 w-4' />
								{dayjs.utc(item.onChainInfo?.createdAt).format("DD MMM 'YY")}
							</TableCell>
							<TableCell className={styles.tableCell_status}>
								<StatusTag
									className='text-center'
									status={item.onChainInfo?.status}
								/>
							</TableCell>
							<TableCell className={styles.tableCellBody_last}>{item.tags && item.tags.length > 0 ? item.tags.join(', ') : 'N/A'}</TableCell>
						</TableRow>
						{expandedRows.includes(item.index ?? 0) && (
							<ChildBountiesRow
								parentIndex={item.index ?? 0}
								loading={loading}
								errors={errors[item.index ?? 0] || []}
								childBounties={childBounties[item.index ?? 0] || []}
							/>
						)}
					</>
				))}
			</TableBody>
		</Table>
	);
}

export default BountyTable;
