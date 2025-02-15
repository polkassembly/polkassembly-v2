// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import BatchVoting from './Components/BatchVoting';
import { NextApiClientService } from '../_client-services/next_api_client_service';
import { ClientError } from '../_client-utils/clientError';

async function BatchVotingPage() {
	const { data, error } = await NextApiClientService.fetchActivityFeedApi({ page: 1, limit: 10 });

	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<div className='h-full w-full bg-page_background px-4 py-6 md:px-8 lg:px-12'>
			<BatchVoting proposals={data.items || []} />
		</div>
	);
}

export default BatchVotingPage;
