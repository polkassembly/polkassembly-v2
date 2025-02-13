// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { ClientError } from '@/app/_client-utils/clientError';
import BountiesListingPage from './Components/BountiesListingPage';

async function OnchainBountyPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
	const searchParamsValue = await searchParams;

	// Fix the page parameter parsing
	const pageParam = searchParamsValue.page?.split('?')[0];
	const page = parseInt(pageParam || '1', 10);
	// Extract status from either the status parameter or from the page parameter (in case of malformed URL)
	const { status: paramStatus } = searchParamsValue;
	const [, urlStatus] = searchParamsValue.page?.includes('status=') ? searchParamsValue.page.split('status=') : [];
	const status = paramStatus || urlStatus;

	// Process statuses
	let statuses: string[] = [];
	if (status && status !== 'all') {
		statuses = [status];
	}

	const { data, error } = await NextApiClientService.fetchListingDataApi(EProposalType.BOUNTY, page, statuses, [], []);

	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<div className='grid grid-cols-1 gap-5 p-5 sm:p-10'>
			<BountiesListingPage initialData={data || { items: [], totalCount: 0 }} />
		</div>
	);
}

export default OnchainBountyPage;
