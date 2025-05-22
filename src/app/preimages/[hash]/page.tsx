// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Header from '@ui/Preimages/Header/Header';
import ListingTable from '@/app/_shared-components/Preimages/ListingTable/ListingTable';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';

async function Preimages({ params }: { params: Promise<{ hash: string }> }) {
	const paramsValue = await params;
	const hash = paramsValue.hash || '';
	const { data } = await NextApiClientService.fetchPreimageByHash({ hash });

	return (
		<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
			<Header data={{ totalCount: data ? 1 : 0 }} />
			<ListingTable
				data={data ? [data] : []}
				totalCount={data ? 1 : 0}
			/>
		</div>
	);
}

export default Preimages;
