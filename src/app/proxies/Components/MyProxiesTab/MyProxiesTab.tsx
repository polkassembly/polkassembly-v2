// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { IProxyRequest } from '@/_shared/types';
import SearchBar from '../SearchBar/SearchBar';
import ProxyListingTable from '../ListingTable/ProxyListingTable';

interface Props {
	data: IProxyRequest[];
	totalCount: number;
}

function MyProxiesTab({ data, totalCount }: Props) {
	const { user } = useUser();
	const t = useTranslations('Proxies');

	// Show not authenticated message
	if (!user?.addresses?.length) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='text-center'>
					<p className='text-text_secondary mb-4'>
						{t('please')}{' '}
						<Link
							href='/login'
							className='text-bg_pink'
						>
							{t('logIn')}
						</Link>{' '}
						{t('toViewMyProxies')}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-y-4'>
			<SearchBar searchKey='myProxiesSearch' />
			<ProxyListingTable
				data={data}
				totalCount={totalCount}
			/>
		</div>
	);
}

export default MyProxiesTab;
