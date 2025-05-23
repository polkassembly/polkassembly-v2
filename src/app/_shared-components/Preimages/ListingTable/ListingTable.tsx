// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { ETheme, IPreimage } from '@/_shared/types';
import { PREIMAGES_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Table, TableHead, TableBody, TableRow, TableHeader } from '../../Table';
import { PaginationWithLinks } from '../../PaginationWithLinks';
import { Dialog, DialogContent, DialogTitle } from '../../Dialog/Dialog';
import styles from './ListingTable.module.scss';
import PreimageRow from './PreimageRow';

// Dynamically import ReactJson to prevent SSR issues
const ReactJson = dynamic(() => import('react-json-view'), {
	ssr: false,
	loading: () => <div className='flex items-center justify-center p-4'>Loading...</div>
});

function ListingTable({ data, totalCount }: { data: IPreimage[]; totalCount: number }) {
	const searchParams = useSearchParams();
	const page = searchParams?.get('page') || 1;
	const { userPreferences } = useUserPreferences();
	const [open, setOpen] = useState(false);
	const [selectedPreimage, setSelectedPreimage] = useState<IPreimage | null>(null);
	const modalarg = selectedPreimage?.proposedCall.args;
	const t = useTranslations('Preimages');

	const [preimages, setPreimages] = useState<IPreimage[]>(data);

	const hanldeDialogOpen = (preimage: IPreimage) => {
		setSelectedPreimage(preimage);
		setOpen(true);
	};

	const onUnnotePreimage = (preimage: IPreimage) => {
		setPreimages((prev) => {
			const index = prev.findIndex((p) => p.hash === preimage.hash && p.proposer === preimage.proposer);
			if (index !== -1) {
				const newPreimages = [...prev];
				newPreimages[`${index}`] = { ...newPreimages[`${index}`], status: 'Cleared' };
				return newPreimages;
			}
			return prev;
		});
	};

	return (
		<div className='mt-5 w-full rounded-lg bg-bg_modal p-6'>
			{data && data.length > 0 ? (
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
							{Array.isArray(preimages) ? (
								preimages.map((preimage: IPreimage) => (
									<PreimageRow
										key={preimage?.id}
										preimage={preimage}
										handleDialogOpen={() => hanldeDialogOpen(preimage)}
										onUnnotePreimage={() => onUnnotePreimage(preimage)}
									/>
								))
							) : (
								<PreimageRow
									preimage={data as unknown as IPreimage}
									handleDialogOpen={() => hanldeDialogOpen(data as unknown as IPreimage)}
									onUnnotePreimage={() => onUnnotePreimage(data as unknown as IPreimage)}
								/>
							)}
						</TableBody>
					</Table>
					{totalCount && totalCount > PREIMAGES_LISTING_LIMIT && (
						<div className='mt-5 flex w-full justify-end'>
							<PaginationWithLinks
								page={Number(page)}
								pageSize={PREIMAGES_LISTING_LIMIT}
								totalCount={totalCount}
								pageSearchParam='page'
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
