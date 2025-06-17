// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Header from '@ui/Preimages/Header/Header';
import ListingTable from '@/app/_shared-components/Preimages/ListingTable/ListingTable';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { ClientError } from '../_client-utils/clientError';
import { NextApiClientService } from '../_client-services/next_api_client_service';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Preimages`,
		description: 'Explore Polkassembly Preimages',
		network,
		url: `https://${network}.polkassembly.io/preimages`,
		imageAlt: 'Polkassembly Preimages'
	});
}

async function Preimages({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
	const searchParamsValue = await searchParams;
	const page = parseInt(searchParamsValue.page || '1', 10);

	const { data, error } = await NextApiClientService.fetchPreimages({ page: Number(page) });
	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
			<Header data={{ totalCount: data.totalCount }} />
			<ListingTable
				data={data.items}
				totalCount={data.totalCount}
			/>
		</div>
	);
}

export default Preimages;
