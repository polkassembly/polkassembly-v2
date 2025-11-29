// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Header from '@/app/judgements/Components/Header/Header';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { Tabs, TabsContent } from '@ui/Tabs';
import { EJudgementDashboardTabs } from '@/_shared/types';
import RegistrarsSummary from './Components/TabSummary/RegistrarsSummary';
import DashboardSummary from './Components/TabSummary/DashboardSummary';
import JudgementListingTable from './Components/ListingTable/JudgementListingTable';
import RegistrarsListingTable from './Components/ListingTable/RegistrarsListingTable';
import OverviewStats from './Components/Overview/OverviewStats';
import IdentitiesListingTable from './Components/Overview/IdentitiesListingTable';
import MyIdentitiesDashboard from './Components/MyDashboard/MyIdentitiesDashboard';

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

async function Judgements() {
	return (
		<div>
			<Tabs
				defaultValue={EJudgementDashboardTabs.OVERVIEW}
				className='w-full'
			>
				<Header />
				<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
					<TabsContent value={EJudgementDashboardTabs.OVERVIEW}>
						<div className='flex flex-col gap-y-4'>
							<OverviewStats />
							<IdentitiesListingTable />
						</div>
					</TabsContent>
					<TabsContent value={EJudgementDashboardTabs.JUDGEMENTS}>
						<div className='flex flex-col gap-y-4'>
							<DashboardSummary />
							<JudgementListingTable />
						</div>
					</TabsContent>
					<TabsContent value={EJudgementDashboardTabs.REGISTRARS}>
						<div className='flex flex-col gap-y-4'>
							<RegistrarsSummary />
							<RegistrarsListingTable />
						</div>
					</TabsContent>
					<TabsContent value={EJudgementDashboardTabs.MY_DASHBOARD}>
						<div className='flex flex-col gap-y-4'>
							<MyIdentitiesDashboard />
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}

export default Judgements;
