// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { NextApiClientService } from '../_client-services/next_api_client_service';
import { ClientError } from '../_client-utils/clientError';
import Leaderboard from '../_shared-components/Leaderboard';

async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
	const searchParamsValue = await searchParams;
	const page = parseInt(searchParamsValue.page || '1', DEFAULT_LISTING_LIMIT);

	const { data, error } = await NextApiClientService.fetchLeaderboardApi({ page });

	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}
	return (
		<div className='grid grid-cols-1 gap-5 p-5 sm:p-10'>
			<Leaderboard data={data} />
		</div>
	);
}

export default LeaderboardPage;
