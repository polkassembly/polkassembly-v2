// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ITrackAnalyticsDelegationsList } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

function Delegators({ delegatorsData }: { delegatorsData: ITrackAnalyticsDelegationsList }) {
	const t = useTranslations('TrackAnalytics');
	const [page, setPage] = useState<number>(1);

	const network = getCurrentNetwork();

	const allDelegatorData = Object.values(delegatorsData).flatMap((delegator) => delegator.data || []);

	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t('address')}</TableHead>
						<TableHead>{t('target')}</TableHead>
						<TableHead>{t('capital')}</TableHead>
						<TableHead>{t('votes')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className='text-sm text-text_primary'>
					{allDelegatorData.slice((page - 1) * DEFAULT_LISTING_LIMIT, page * DEFAULT_LISTING_LIMIT).map((delegator, index) => (
						// eslint-disable-next-line react/no-array-index-key
						<TableRow key={`${delegator.from}-${delegator.to}-${index}`}>
							<TableCell className='p-2'>
								<div className='flex items-center truncate'>
									<Address address={delegator.from} />
								</div>
							</TableCell>
							<TableCell className='p-2'>
								<div className='flex items-center truncate'>
									<Address address={delegator.to} />
								</div>
							</TableCell>
							<TableCell className='p-2'>{formatBnBalance(delegator.capital, { compactNotation: true, withUnit: true, numberAfterComma: 1 }, network)}</TableCell>
							<TableCell className='p-2'>{formatBnBalance(delegator.votingPower, { compactNotation: true, withUnit: true, numberAfterComma: 1 }, network)}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<PaginationWithLinks
				page={page}
				pageSize={DEFAULT_LISTING_LIMIT}
				totalCount={allDelegatorData.length}
				onPageChange={(newPage) => setPage(newPage)}
			/>
		</div>
	);
}

export default Delegators;
