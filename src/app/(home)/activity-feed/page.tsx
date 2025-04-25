// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Suspense } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { EActivityFeedTab } from '@/_shared/types';
import { CookieService } from '@/_shared/_services/cookie_service';
import { z } from 'zod';
import { ClientError } from '@/app/_client-utils/clientError';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import { redirectFromServer } from '@/app/_client-utils/redirectFromServer';
import ActivityFeed from './Components/ActivityFeed';

const zodParamsSchema = z.object({
	tab: z.nativeEnum(EActivityFeedTab).optional().default(EActivityFeedTab.EXPLORE)
});

export default async function ActivityFeedPage({ searchParams }: { searchParams: Promise<{ activeTab?: string }> }) {
	const { tab } = zodParamsSchema.parse(await searchParams);

	const user = await CookieService.getUserFromCookie();

	if (!user?.id && tab === EActivityFeedTab.SUBSCRIBED) {
		return redirectFromServer(`/login?nextUrl=/?tab=${tab}`);
	}

	const { data, error } =
		tab === EActivityFeedTab.SUBSCRIBED && user?.id
			? await NextApiClientService.getSubscribedActivityFeed({ page: 1, limit: DEFAULT_LISTING_LIMIT, userId: user?.id })
			: await NextApiClientService.fetchActivityFeed({ page: 1, limit: DEFAULT_LISTING_LIMIT, userId: user?.id });

	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<Suspense fallback={<LoadingSpinner />}>
			<ActivityFeed
				initialData={data}
				activeTab={tab}
			/>
		</Suspense>
	);
}
