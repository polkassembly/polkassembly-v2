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
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import ActivityFeed from './Components/ActivityFeed';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Activity Feed`,
		description: 'Explore the latest activity on Polkassembly',
		url: `https://${network}.polkassembly.io/activity-feed`,
		imageAlt: 'Polkassembly Activity Feed',
		network
	});
}

const zodParamsSchema = z.object({
	tab: z.nativeEnum(EActivityFeedTab).optional().default(EActivityFeedTab.EXPLORE)
});

export default async function ActivityFeedPage({ searchParams }: { searchParams: Promise<{ activeTab?: string }> }) {
	const { tab } = zodParamsSchema.parse(await searchParams);

	const user = await CookieService.getUserFromCookie();

	const { data, error } =
		tab === EActivityFeedTab.SUBSCRIBED && user?.id
			? await NextApiClientService.getSubscribedActivityFeed({ page: 1, limit: DEFAULT_LISTING_LIMIT, userId: user?.id })
			: await NextApiClientService.fetchActivityFeed({ page: 1, limit: DEFAULT_LISTING_LIMIT, userId: user?.id });

	const { data: treasuryStatsData, error: treasuryStatsError } = await NextApiClientService.getTreasuryStats({
		from: dayjs().subtract(1, 'hour').toDate(),
		to: dayjs().toDate()
	});

	if (error || !data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<Suspense fallback={<LoadingSpinner />}>
			<ActivityFeed
				initialData={data}
				activeTab={tab}
				treasuryStatsData={treasuryStatsError ? [] : treasuryStatsData || []}
			/>
		</Suspense>
	);
}
