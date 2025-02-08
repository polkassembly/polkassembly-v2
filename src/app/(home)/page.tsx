// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Suspense } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import ActivityFeed from '../_shared-components/ActivityFeed';
import { ClientError } from '../_client-utils/clientError';
import { LoadingSpinner } from '../_shared-components/LoadingSpinner';

export default async function Home() {
	const { data, error } = await NextApiClientService.fetchActivityFeedApi({ page: 1, limit: DEFAULT_LISTING_LIMIT });

	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<Suspense fallback={<LoadingSpinner />}>
			<ActivityFeed initialData={data} />
		</Suspense>
	);
}
