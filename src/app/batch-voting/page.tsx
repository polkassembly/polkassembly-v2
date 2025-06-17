// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { ClientError } from '../_client-utils/clientError';
import { NextApiClientService } from '../_client-services/next_api_client_service';
import BatchVoting from './Components/BatchVoting';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Batch Voting`,
		description: 'Explore all Batch Voting Proposals on Polkassembly',
		url: `https://${network}.polkassembly.io/batch-voting`,
		imageAlt: 'Polkassembly Batch Voting',
		network
	});
}

async function BatchVotingPage() {
	const { data: activityFeedData, error: activityFeedError } = await NextApiClientService.fetchActivityFeed({ page: 1, limit: 10 });

	if (activityFeedError || !activityFeedData) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, activityFeedError?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<div className='mx-auto h-full w-full max-w-7xl px-4 py-6 md:px-8 lg:px-16'>
			<BatchVoting proposals={activityFeedData.items || []} />
		</div>
	);
}

export default BatchVotingPage;
