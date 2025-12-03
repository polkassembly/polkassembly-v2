// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Tabs, TabsContent } from '@ui/Tabs';
import { useIsRegistrar } from '@/hooks/useIsRegistrar';
import { EJudgementDashboardTabs } from '@shared/types';
import Header from '../Header/Header';
import RegistrarRequestsView from '../RegistrarRequests/RegistrarRequestsView';
import OverviewStats from '../Overview/OverviewStats';
import IdentitiesListingTable from '../Overview/IdentitiesListingTable';
import DashboardSummary from '../TabSummary/DashboardSummary';
import JudgementListingTable from '../ListingTable/JudgementListingTable';
import RegistrarsSummary from '../TabSummary/RegistrarsSummary';
import RegistrarsListingTable from '../ListingTable/RegistrarsListingTable';
import MyIdentitiesDashboard from '../MyDashboard/MyIdentitiesDashboard';

function JudgementTabs() {
	const { data: isRegistrar } = useIsRegistrar();
	return (
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
	);
}

export default JudgementTabs;
