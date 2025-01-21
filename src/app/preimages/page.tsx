// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { NextApiClientService } from '../_client-services/next_api_client_service';
import ListingTable from '../_shared-components/Preimages/ListingTable';
import { Input } from '../_shared-components/Input';

async function page({ searchParams }: { searchParams: { page: string; hash_contains: string } }) {
	const { data, error } = await NextApiClientService.fetchPreimagesApi(1, searchParams.hash_contains);
	if (error || !data) return <div className='text-center text-text_primary'>{error?.message}</div>;

	return (
		<div className='px-10 py-5'>
			<div>
				<p className='text-2xl font-bold text-text_primary'>{data?.totalCount} Preimages</p>
				<div>
					<Input placeholder='Search by hash' />
				</div>
			</div>
			<ListingTable data={data?.items} />
		</div>
	);
}

export default page;
