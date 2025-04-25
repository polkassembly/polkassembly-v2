// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Header from '@ui/Preimages/Header/Header';
import { IGenericListingResponse, IPreimage } from '@/_shared/types';
import ListingTable from '@/app/_shared-components/Preimages/ListingTable/ListingTable';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { NextApiClientService } from '../_client-services/next_api_client_service';
import { ClientError } from '../_client-utils/clientError';

async function Preimages({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
	const searchParamsValue = await searchParams;
	const page = parseInt(searchParamsValue.page || '1', 10);

	const { data, error } = await NextApiClientService.fetchPreimages({ page: Number(page) });
	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 p-5 sm:px-10'>
			<Header data={data as IGenericListingResponse<IPreimage>} />
			<ListingTable data={data as IGenericListingResponse<IPreimage>} />
		</div>
	);
}

export default Preimages;
