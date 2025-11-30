// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Header from '@/app/judgements/Components/Header/Header';
import { Tabs, TabsContent } from '@ui/Tabs';
import { EJudgementDashboardTabs } from '@/_shared/types';
import { useIsRegistrar } from '@/hooks/useIsRegistrar';
import RegistrarsSummary from './Components/TabSummary/RegistrarsSummary';
import DashboardSummary from './Components/TabSummary/DashboardSummary';
import JudgementListingTable from './Components/ListingTable/JudgementListingTable';
import RegistrarsListingTable from './Components/ListingTable/RegistrarsListingTable';
import OverviewStats from './Components/Overview/OverviewStats';
import IdentitiesListingTable from './Components/Overview/IdentitiesListingTable';
import MyIdentitiesDashboard from './Components/MyDashboard/MyIdentitiesDashboard';
import RegistrarRequestsView from './Components/RegistrarRequests/RegistrarRequestsView';

function Judgements() {
	const { data: isRegistrar } = useIsRegistrar();

	return (
		<div>
			<Tabs
				defaultValue={isRegistrar ? EJudgementDashboardTabs.REQUESTS : EJudgementDashboardTabs.OVERVIEW}
				className='w-full'
			>
				<Header />
				<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
					<TabsContent value={EJudgementDashboardTabs.REQUESTS}>
						<RegistrarRequestsView />
					</TabsContent>
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
