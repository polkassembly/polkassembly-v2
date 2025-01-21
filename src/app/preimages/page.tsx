// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Header from '@ui/Preimages/Header';
import ListingTable from '@ui/Preimages/ListingTable';
import { NextApiClientService } from '../_client-services/next_api_client_service';

async function page({ searchParams }: { searchParams: { page: string; hash_contains: string } }) {
	const params = await searchParams;
	const pageParam = params?.page;
	const hashContains = params?.hash_contains;

	const { data, error } = await NextApiClientService.fetchPreimagesApi(Number(pageParam ?? 1), hashContains ?? '');

	if (error || !data) return <div className='text-center text-text_primary'>{error?.message}</div>;

	return (
		<div className='px-10 py-5'>
			<Header data={data} />
			<ListingTable data={data} />
		</div>
	);
}

export default page;
