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
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

const origin = EPostOrigin.TREASURER;

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title, description } = OPENGRAPH_METADATA;
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	return {
		title: `${title} - Treasurer Proposals`,
		description,
		metadataBase: new URL(`https://${network}.polkassembly.io`),
		icons: [{ url: '/favicon.ico' }],
		openGraph: {
			title: `${title} - Treasurer Proposals`,
			description,
			images: [
				{
					url: image || '',
					width: 600,
					height: 600,
					alt: 'Polkassembly Treasurer Proposals'
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: 'Polkassembly Treasurer Proposals'
				}
			],
			siteName: 'Polkassembly',
			type: 'website',
			url: `https://${network}.polkassembly.io/treasurer`
		},
		twitter: {
			card: 'summary_large_image',
			title: `${title} - Treasurer Proposals`,
			description,
			images: image ? [image] : [smallImage || ''],
			site: '@polkassembly'
		}
	};
}

const zodQuerySchema = z.object({
	page: z.coerce.number().min(1).optional().default(1),
	status: z.preprocess((val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : undefined), z.array(z.nativeEnum(EProposalStatus))).optional()
});

async function TreasurerPage({ searchParams }: { searchParams: Promise<{ page?: string; trackStatus?: string }> }) {
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
				initialData={data || { items: [], totalCount: 0 }}
				origin={origin}
				statuses={statuses || []}
				page={page}
			/>
		</div>
	);
}

export default TreasurerPage;
