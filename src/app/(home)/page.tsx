// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Suspense } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EActivityFeedTab } from '@/_shared/types';
import { CookieService } from '@/_shared/_services/cookie_service';
import ActivityFeed from './Components/ActivityFeed';
import { ClientError } from '../_client-utils/clientError';
import { LoadingSpinner } from '../_shared-components/LoadingSpinner';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ activeTab?: string }> }) {
	const searchParamsValue = await searchParams;
	const { activeTab } = searchParamsValue;
	const user = await CookieService.getUserFromCookie();
	const userId = user?.id;

	const { data, error } = await NextApiClientService.fetchActivityFeed({ page: 1, limit: DEFAULT_LISTING_LIMIT, userId });

	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	if (userId && activeTab === EActivityFeedTab.SUBSCRIBED) {
		const { data: subscribedData, error: subscribedError } = await NextApiClientService.getSubscribedActivityFeed({ page: 1, limit: DEFAULT_LISTING_LIMIT, userId });
		if (subscribedError || !subscribedData) {
			throw new ClientError(ERROR_CODES.CLIENT_ERROR, subscribedError?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
		}
		return (
			<Suspense fallback={<LoadingSpinner />}>
				<ActivityFeed
					initialData={subscribedData}
					activeTab={activeTab}
				/>
			</Suspense>
		);
	}

	return (
		<Suspense fallback={<LoadingSpinner />}>
			<ActivityFeed
				initialData={data}
				activeTab={activeTab as EActivityFeedTab}
			/>
		</Suspense>
	);
}
