// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { ETheme, IGenericListingResponse, IPreimage } from '@/_shared/types';
import { PREIMAGES_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import ReactJson from 'react-json-view';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '../../Table';
import { PaginationWithLinks } from '../../PaginationWithLinks';
import { Dialog, DialogContent, DialogTitle } from '../../Dialog/Dialog';
import styles from './ListingTable.module.scss';
import PreimageRow from './PreimageRow';

function ListingTable({ data }: { data: IGenericListingResponse<IPreimage> }) {
	const searchParams = useSearchParams();
	const page = searchParams.get('page') || 1;
	const { userPreferences } = useUserPreferences();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [selectedPreimage, setSelectedPreimage] = useState<IPreimage | null>(null);
	const modalarg = selectedPreimage?.proposedCall.args;
	const t = useTranslations('Preimages');

	const hanldeDialogOpen = (preimage: IPreimage) => {
		setSelectedPreimage(preimage);
		setOpen(true);
	};
	return (
		<div className='mt-5 rounded-lg bg-bg_modal p-6'>
			{data ? (
				<>
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
							{Array.isArray(data?.items) ? (
								data.items.map((preimage: IPreimage) => (
									<PreimageRow
										key={preimage?.id}
										preimage={preimage}
										handleDialogOpen={() => hanldeDialogOpen(preimage)}
									/>
								))
							) : (
								<PreimageRow
									preimage={data as unknown as IPreimage}
									handleDialogOpen={() => hanldeDialogOpen(data as unknown as IPreimage)}
								/>
							)}
						</TableBody>
					</Table>
					{data?.totalCount && data?.totalCount > PREIMAGES_LISTING_LIMIT && (
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
					)}
					<Dialog
						open={open}
						onOpenChange={() => setOpen(false)}
					>
						<DialogContent className={styles.popoverContent}>
							<DialogTitle className={styles.modalContent_title}>{t('arguments')}</DialogTitle>
							{modalarg && (
								<div className={styles.modalContent}>
									<ReactJson
										theme={userPreferences.theme === ETheme.DARK ? 'bright' : 'rjv-default'}
										style={{ color: 'white', background: 'var(--section-dark-overlay)' }}
										src={modalarg}
										iconStyle='circle'
										enableClipboard={false}
										displayDataTypes={false}
									/>
								</div>
							)}
						</DialogContent>
					</Dialog>
				</>
			) : (
				<div className='flex items-center justify-center'>
					<h1 className='text-center text-2xl font-bold'>{t('preimageNotFound')}</h1>
				</div>
			)}
		</div>
	);
}

export default ListingTable;
