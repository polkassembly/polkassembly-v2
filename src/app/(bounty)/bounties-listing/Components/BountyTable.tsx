// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPostListing } from '@/_shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import styles from './Bounties.module.scss';

function BountyTable({ filteredItems }: { filteredItems: IPostListing[] }) {
	return (
		<Table>
			<TableHeader>
				<TableRow className={styles.tableRow}>
					<TableHead className={styles.tableCell_1}>#</TableHead>
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
					<TableRow
						className={styles.tableBodyRow}
						key={item.id}
					>
						<TableCell className={styles.tableCellBody_1}>{item.index}</TableCell>
						<TableCell className={styles.tableCell}>-</TableCell>
						<TableCell className={styles.tableCell}>{item.title}</TableCell>
						<TableCell className={styles.tableCell}>{item.dataSource}</TableCell>
						<TableCell className={styles.tableCell}>{dayjs.utc(item.onChainInfo?.createdAt).format("DD MMM 'YY")}</TableCell>
						<TableCell className={styles.tableCell}>{item.onChainInfo?.status}</TableCell>
						<TableCell className={styles.tableCellBody_last}>{item.tags?.join(', ')}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

export default BountyTable;
