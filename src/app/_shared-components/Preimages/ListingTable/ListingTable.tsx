// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { ETheme, IGenericListingResponse, IPreimage } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { MdContentCopy, MdListAlt } from 'react-icons/md';
import { PREIMAGES_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Image from 'next/image';
import SubscanIcon from '@assets/icons/profile-subscan.svg';
import ReactJson from 'react-json-view';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../../Table';
import Address from '../../Profile/Address/Address';
import { PaginationWithLinks } from '../../PaginationWithLinks';
import { Dialog, DialogContent, DialogTitle } from '../../Dialog/Dialog';
import styles from './ListingTable.module.scss';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';

function ListingTable({ data }: { data: IGenericListingResponse<IPreimage> }) {
	const network = getCurrentNetwork();
	const searchParams = useSearchParams();
	const page = searchParams.get('page') || 1;
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const modalarg = data?.items?.[0]?.proposedCall.args;
	const t = useTranslations('Preimages');

	const hanldeDialogOpen = () => {
		setOpen(true);
	};
	return (
		<div className='mt-5 rounded-lg bg-bg_modal p-6'>
			<Table>
				<TableHeader>
					<TableRow className={styles.tableRow}>
						<TableHead className={styles.tableCell_1}>{t('hash')}</TableHead>
						<TableHead className={styles.tableCell_2}>{t('author')}</TableHead>
						<TableHead className={styles.tableCell}>{t('deposit')}</TableHead>
						<TableHead className={styles.tableCell}>{t('arguments')}</TableHead>
						<TableHead className={styles.tableCell}>{t('size')}</TableHead>
						<TableHead className={styles.tableCell_last}>{t('status')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data?.items?.map((preimage: IPreimage) => (
						<TableRow
							key={preimage?.id}
							className='text-start'
						>
							<TableCell className={styles.table_content_cell}>
								{preimage?.hash ? `${preimage.hash.slice(0, 5)}...${preimage.hash.slice(-5)}` : '-'}
								<Tooltip>
									<TooltipTrigger>
										<MdContentCopy
											onClick={() => {
												navigator.clipboard.writeText(preimage.hash);
											}}
											className={styles.table_content_cell_1}
										/>
									</TooltipTrigger>
									<TooltipContent className={styles.tooltipContent}>{t('copy')}</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger>
										<Image
											src={SubscanIcon}
											alt='copy'
											width={18}
											className='cursor-pointer'
											onClick={() => window.open(`https://${network}.subscan.io/block/${preimage?.createdAtBlock}`, '_blank')}
											height={18}
										/>
									</TooltipTrigger>
									<TooltipContent className={styles.tooltipContent}>{t('subscan')}</TooltipContent>
								</Tooltip>
							</TableCell>
							<TableCell className='px-6 py-5'>
								<Address
									truncateCharLen={5}
									address={preimage?.proposer || ''}
								/>
							</TableCell>
							<TableCell className='px-6 py-5'>
								{preimage?.deposit
									? formatBnBalance(
											preimage.deposit,
											{
												withUnit: true,
												numberAfterComma: 2,
												compactNotation: true
											},
											network
										)
									: '-'}
							</TableCell>
							<TableCell className={styles.table_content_cell_2}>
								<span className={styles.table_content_cell_2_content}>{preimage?.section && preimage?.method ? `${preimage.section}.${preimage.method.slice(0, 5)}...` : '-'}</span>
								<MdListAlt
									onClick={hanldeDialogOpen}
									className={styles.mdlisticon}
								/>
							</TableCell>
							<TableCell className='px-6 py-5'>{preimage?.length || '-'}</TableCell>
							<TableCell className='px-6 py-5'>{preimage?.status || '-'}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className='mt-5 flex w-full justify-end'>
				<PaginationWithLinks
					page={Number(page)}
					pageSize={PREIMAGES_LISTING_LIMIT}
					totalCount={data?.totalCount || 0}
					onClick={(pageNumber) => {
						router.push(`/preimages?page=${pageNumber}`);
					}}
				/>
			</div>

			<Dialog
				open={open}
				onOpenChange={() => setOpen(false)}
			>
				<DialogContent className={styles.popoverContent}>
					<DialogTitle className={styles.modalContent_title}>{t('arguments')}</DialogTitle>
					{modalarg && (
						<div className={styles.modalContent}>
							<ReactJson
								theme={theme === ETheme.DARK ? 'bright' : 'rjv-default'}
								style={{ color: 'white', background: 'var(--section-dark-overlay)' }}
								src={modalarg}
								iconStyle='circle'
								enableClipboard={false}
								displayDataTypes={false}
							/>
						</div>
					)}
					<div>
						<button
							type='button'
							onClick={() => setOpen(false)}
							className={styles.closeButton}
						>
							{t('close')}
						</button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default ListingTable;
