// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EPostOrigin, EProposalStatus, EProposalType } from '@/_shared/types';
import ListingPage from '@ui/ListingComponent/ListingPage/ListingPage';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { ClientError } from '@/app/_client-utils/clientError';
import { z } from 'zod';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { Metadata } from 'next';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';

const origin = EPostOrigin.WHITELISTED_CALLER;

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Whitelisted Caller Proposals`,
		description: 'Explore all Whitelisted Caller Proposals on Polkassembly',
		url: `https://${network}.polkassembly.io/whitelisted-caller`,
		imageAlt: 'Polkassembly Whitelisted Caller Proposals',
		network
	});
}

const zodQuerySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	status: z.preprocess((val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined), z.array(z.nativeEnum(EProposalStatus))).optional()
});

async function WhitelistedCallerPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
	const searchParamsValue = await searchParams;
	const { page, status: statuses } = zodQuerySchema.parse(searchParamsValue);

	const { data, error } = await NextApiClientService.fetchListingData({ proposalType: EProposalType.REFERENDUM_V2, page, statuses, origins: [origin] });

	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<div>
			<ListingPage
				proposalType={EProposalType.REFERENDUM_V2}
				origin={origin}
				initialData={data || { items: [], totalCount: 0 }}
				statuses={statuses || []}
				page={page}
			/>
		</div>
	);
}

export default WhitelistedCallerPage;
