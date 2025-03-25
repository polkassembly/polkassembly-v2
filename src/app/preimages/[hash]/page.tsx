// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Header from '@ui/Preimages/Header/Header';
import { IGenericListingResponse, IPreimage } from '@/_shared/types';
import ListingTable from '@/app/_shared-components/Preimages/ListingTable/ListingTable';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';

async function Preimages({ params }: { params: Promise<{ hash: string }> }) {
	const paramsValue = await params;
	const hash = paramsValue.hash || '';
	const hashData = await NextApiClientService.fetchPreimageByHash({ hash });

	return (
		<div className='grid grid-cols-1 gap-5 p-5 sm:px-10'>
			<Header data={hashData?.data as unknown as IGenericListingResponse<IPreimage>} />
			<ListingTable data={hashData?.data as unknown as IGenericListingResponse<IPreimage>} />
		</div>
	);
}

export default Preimages;
