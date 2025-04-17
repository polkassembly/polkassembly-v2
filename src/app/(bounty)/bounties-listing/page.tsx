// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EBountyStatus, EProposalStatus, EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { ClientError } from '@/app/_client-utils/clientError';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import BountiesListingPage from './Components/BountiesListingPage';

const convertStatusToStatusesArray = (status: string): EProposalStatus[] => {
	switch (status) {
		case EProposalStatus.Active:
			return [EProposalStatus.Active, EProposalStatus.Extended];
		case EProposalStatus.Closed:
			return [EProposalStatus.Closed];
		case EProposalStatus.Cancelled:
			return [EProposalStatus.Cancelled];
		case EProposalStatus.Rejected:
			return [EProposalStatus.Rejected];
		case EProposalStatus.Awarded:
			return [EProposalStatus.Awarded, EProposalStatus.Claimed];
		default:
			return [];
	}
};

async function OnchainBountyPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
	const searchParamsValue = await searchParams;
	const pageParam = searchParamsValue.page?.split('?')[0];
	const page = parseInt(pageParam || '1', DEFAULT_LISTING_LIMIT);
	const { status: paramStatus } = searchParamsValue;
	const [urlStatus] = searchParamsValue.page?.includes('status=') ? searchParamsValue.page.split('status=') : [];
	const status = paramStatus || urlStatus ? JSON.parse(decodeURIComponent(paramStatus || urlStatus)) : EBountyStatus.ALL;
	console.log(status, 'status', { paramStatus }, { urlStatus });

	let statuses: string[] = [];

	statuses = convertStatusToStatusesArray(status);

	const { data, error } = await NextApiClientService.fetchListingData({ proposalType: EProposalType.BOUNTY, page, statuses });

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
