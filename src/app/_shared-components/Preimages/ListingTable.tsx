// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { IGenericListingResponse, IPreimage } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { PREIMAGES_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../Table';
import Address from '../Profile/Address/Address';
import { PaginationWithLinks } from '../PaginationWithLinks';

function ListingTable({ data }: { data: IGenericListingResponse<IPreimage> }) {
	const network = getCurrentNetwork();
	const searchParams = useSearchParams();
	const page = searchParams.get('page') || 1;
	const router = useRouter();
	return (
		<div className='mt-5 rounded-lg bg-bg_modal p-6'>
			<Table>
				<TableRow className='overflow-hidden rounded-t-lg bg-page_background'>
					<TableHead className='px-6 py-5 first:rounded-tl-lg last:rounded-tr-lg'>Hash</TableHead>
					<TableHead className='px-6 py-5'>Author</TableHead>
					<TableHead className='px-6 py-5'>Deposit</TableHead>
					<TableHead className='px-6 py-5'>Arguments</TableHead>
					<TableHead className='px-6 py-5'>Size</TableHead>
					<TableHead className='px-6 py-5 last:rounded-tr-lg'>Status</TableHead>
				</TableRow>
				<TableBody>
					{data?.items?.map((preimage: IPreimage) => (
						<TableRow
							key={preimage?.id}
							className='text-start'
						>
							<TableCell className='px-6 py-5'>{preimage?.hash ? `${preimage.hash.slice(0, 5)}...${preimage.hash.slice(-5)}` : '-'}</TableCell>
							<TableCell className='px-6 py-5'>
								<Address address={preimage?.proposer || ''} />
							</TableCell>
							<TableCell className='px-6 py-5'>
								{preimage?.deposit ? formatBnBalance(preimage.deposit, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network) : '-'}
							</TableCell>
							<TableCell className='px-6 py-5'>{preimage?.section && preimage?.method ? `${preimage.section}.${preimage.method}` : '-'}</TableCell>
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
		</div>
	);
}

export default ListingTable;
