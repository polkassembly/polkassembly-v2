// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPostListing } from '@/_shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import Address from '@ui/Profile/Address/Address';
import StatusTag from '@ui/StatusTag/StatusTag';
import { FaCaretDown } from '@react-icons/all-files/fa/FaCaretDown';
import { FaCaretUp } from '@react-icons/all-files/fa/FaCaretUp';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useRouter } from 'nextjs-toploader/app';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { useState, Fragment } from 'react';
import Tags from '@/app/_shared-components/AppLayout/Search/Tags';
import styles from './Bounties.module.scss';
import ChildBountiesRow from './ChildBountiesRow';

function BountyTable({ filteredItems }: { filteredItems: IPostListing[] }) {
	const network = getCurrentNetwork();
	const router = useRouter();
	const t = useTranslations();
	const [expandChildBounties, setExpandChildBounties] = useState<{ parentIndex: number | null; isExpanded: boolean }>({ parentIndex: null, isExpanded: false });

	const handleExpandChildBounties = (parentIndex?: number | null) => {
		if (!ValidatorService.isValidNumber(parentIndex)) return;
		setExpandChildBounties((prev) => ({ ...prev, parentIndex: parentIndex || null, isExpanded: prev.parentIndex === parentIndex ? !prev.isExpanded : true }));
	};

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
					<Fragment key={item?.index}>
						<TableRow
							className={styles.tableBodyRow}
							onClick={() => router.push(`/bounty/${item.index}`)}
						>
							<TableCell className='p-6'>
								<div className='flex items-center gap-2'>
									{item.onChainInfo?.childBountiesCount && item.onChainInfo?.childBountiesCount > 0 ? (
										<div className='relative'>
											<div className='absolute left-0 top-1/2 -translate-y-1/2'>
												<button
													type='button'
													onClick={(e) => {
														e.stopPropagation();
														handleExpandChildBounties(item.index);
													}}
													className='rounded p-1 transition-colors'
													title={`${expandChildBounties.parentIndex === item.index && expandChildBounties.isExpanded ? 'Hide' : 'Show'} child bounties`}
												>
													{expandChildBounties.isExpanded && expandChildBounties.parentIndex === item.index ? (
														<FaCaretUp className='h-4 w-4 text-navbar_border' />
													) : (
														<FaCaretDown className='h-4 w-4' />
													)}
												</button>
											</div>
											<div className='pl-8'>
												<span>{item.index}</span>
											</div>
										</div>
									) : (
										<div className='pl-8'>
											<span>{item.index}</span>
										</div>
									)}
								</div>
							</TableCell>
							<TableCell className={styles.tableCell}>{item.onChainInfo?.curator ? <Address address={item.onChainInfo?.curator} /> : '-'}</TableCell>
							<TableCell className={styles.tableCell}>
								<span className='block max-w-[20ch] truncate'>{item.title}</span>
							</TableCell>
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
							<TableCell className={styles.tableCell}>{item.tags && item.tags.length > 0 ? <Tags tags={item.tags.map((tag) => tag.value)} /> : ''}</TableCell>
						</TableRow>
						{expandChildBounties.isExpanded && expandChildBounties.parentIndex === item.index && <ChildBountiesRow parentIndex={expandChildBounties.parentIndex} />}
					</Fragment>
				))}
			</TableBody>
		</Table>
	);
}

export default BountyTable;
