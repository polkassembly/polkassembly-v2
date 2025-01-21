// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostOrigin, EProposalType } from '@/_shared/types';
import ListingPage from '@ui/ListingComponent/ListingPage/ListingPage';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { ClientError } from '@/app/_client-utils/clientError';

async function GeneralAdminPage({ searchParams }: { searchParams: Promise<{ page?: string; trackStatus?: string }> }) {
	const page = parseInt((await searchParams).page || '1', 10);
	const statuses = (await searchParams).trackStatus === 'all' ? [] : (await searchParams).trackStatus?.split(',') || [];

	const { data, error } = await NextApiClientService.fetchListingDataApi(EProposalType.REFERENDUM_V2, page, statuses, [EPostOrigin.GENERAL_ADMIN], []);

	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<div>
			<ListingPage
				title='General Admin'
				description='These are the general admin tracks referenda'
				proposalType={EProposalType.REFERENDUM_V2}
				initialData={data || { items: [], totalCount: 0 }}
			/>
		</div>
	);
}

export default GeneralAdminPage;
