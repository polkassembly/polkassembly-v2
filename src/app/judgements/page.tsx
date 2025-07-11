// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Header from '@/app/judgements/Components/Header/Header';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { Tabs, TabsContent } from '@ui/Tabs';
import { EJudgementDashboardTabs } from '@/_shared/types';
import { NextApiClientService } from '../_client-services/next_api_client_service';
import { ClientError } from '../_client-utils/clientError';
import RegistrarsSummary from './Components/TabSummary/RegistrarsSummary';
import DashboardSummary from './Components/TabSummary/DashboardSummary';
import JudgementListingTable from './Components/ListingTable/JudgementListingTable';
import RegistrarsListingTable from './Components/ListingTable/RegistrarsListingTable';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Judgements`,
		description: 'Explore Polkassembly Judgements',
		network,
		url: `https://${network}.polkassembly.io/judgements`,
		imageAlt: 'Polkassembly Judgements'
	});
}

async function Judgements({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
	const searchParamsValue = await searchParams;
	const page = parseInt(searchParamsValue.page || '1', 10);

	// Fetch judgement data
	const [judgementRequestsResponse, registrarsResponse] = await Promise.all([
		NextApiClientService.fetchJudgementRequests({ page: Number(page), limit: 10 }),
		NextApiClientService.fetchRegistrars()
	]);

	if (judgementRequestsResponse.error || !judgementRequestsResponse.data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, judgementRequestsResponse.error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	if (registrarsResponse.error || !registrarsResponse.data) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, registrarsResponse.error?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<div className='w-full'>
			<Tabs defaultValue={EJudgementDashboardTabs.DASHBOARD}>
				<Header data={{ totalCount: judgementRequestsResponse.data.totalCount }} />
				<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
					<TabsContent value={EJudgementDashboardTabs.DASHBOARD}>
						<div className='flex flex-col gap-y-4'>
							<DashboardSummary />
							<JudgementListingTable
								data={judgementRequestsResponse.data.items}
								totalCount={judgementRequestsResponse.data.totalCount}
							/>
						</div>
					</TabsContent>
					<TabsContent value={EJudgementDashboardTabs.REGISTRARS}>
						<div className='flex flex-col gap-y-4'>
							<RegistrarsSummary />
							<RegistrarsListingTable data={registrarsResponse.data.items} />
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}

export default Judgements;
