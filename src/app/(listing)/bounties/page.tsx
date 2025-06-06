// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EBountyStatus, EProposalStatus, EProposalType } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { ClientError } from '@/app/_client-utils/clientError';
import { z } from 'zod';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import BountiesListingPage from './Components/BountiesListingPage';

const zodQuerySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	status: z.nativeEnum(EBountyStatus).optional().default(EBountyStatus.ALL)
});

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Bounties`,
		description: 'Explore all Bounties on Polkassembly',
		url: `https://${network}.polkassembly.io/bounties`,
		imageAlt: 'Polkassembly Bounties',
		network
	});
}

const convertStatusToStatusesArray = (status: EBountyStatus): EProposalStatus[] => {
	switch (status) {
		case EBountyStatus.ACTIVE:
			return [EProposalStatus.Active, EProposalStatus.Extended];
		case EBountyStatus.CLAIMED:
			return [EProposalStatus.Claimed];
		case EBountyStatus.CANCELLED:
			return [EProposalStatus.Cancelled];
		case EBountyStatus.REJECTED:
			return [EProposalStatus.Rejected];
		case EBountyStatus.PROPOSED:
			return [EProposalStatus.Proposed];
		default:
			return [];
	}
};

async function OnchainBountyPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
	const searchParamsValue = await searchParams;
	const { page, status } = zodQuerySchema.parse(searchParamsValue);

	let statuses: EProposalStatus[] = [];

	statuses = convertStatusToStatusesArray(status);

	const { data, error } = await NextApiClientService.fetchListingData({ proposalType: EProposalType.BOUNTY, page, statuses });

	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<div>
			<BountiesListingPage
				initialData={data || { items: [], totalCount: 0 }}
				status={status as EBountyStatus}
				page={page}
			/>
		</div>
	);
}

export default OnchainBountyPage;
