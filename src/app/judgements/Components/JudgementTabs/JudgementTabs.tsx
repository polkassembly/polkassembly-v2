// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Tabs, TabsContent } from '@ui/Tabs';
import { useIsRegistrar } from '@/hooks/useIsRegistrar';
import { EJudgementDashboardTabs } from '@shared/types';
import { useEffect, useState } from 'react';
import LoaderGif from '@/app/_shared-components/LoaderGif/LoaderGif';
import Header from '../Header/Header';
import RegistrarRequestsView from '../RegistrarRequests/RegistrarRequestsView';
import OverviewTab from '../Overview/OverviewTab';
import JudgementsTab from '../ListingTable/JudgementsTab';
import RegistrarsTab from '../ListingTable/RegistrarsTab';
import MyIdentitiesDashboard from '../MyDashboard/MyIdentitiesDashboard';

function JudgementTabs() {
	const { data: isRegistrar, isLoading } = useIsRegistrar();
	const [activeTab, setActiveTab] = useState<EJudgementDashboardTabs>(EJudgementDashboardTabs.OVERVIEW);

	useEffect(() => {
		if (!isLoading && isRegistrar) {
			setActiveTab(EJudgementDashboardTabs.REQUESTS);
		}
	}, [isLoading, isRegistrar]);

	if (isLoading) {
		return <LoaderGif />;
	}
	return (
		<Tabs
			value={activeTab}
			className='w-full'
			onValueChange={(value) => setActiveTab(value as EJudgementDashboardTabs)}
		>
			<Header />
			<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-16'>
				<TabsContent value={EJudgementDashboardTabs.REQUESTS}>
					<RegistrarRequestsView />
				</TabsContent>
				<TabsContent value={EJudgementDashboardTabs.OVERVIEW}>
					<OverviewTab />
				</TabsContent>
				<TabsContent value={EJudgementDashboardTabs.JUDGEMENTS}>
					<JudgementsTab />
				</TabsContent>
				<TabsContent value={EJudgementDashboardTabs.REGISTRARS}>
					<RegistrarsTab />
				</TabsContent>
				<TabsContent value={EJudgementDashboardTabs.MY_DASHBOARD}>
					<MyIdentitiesDashboard />
				</TabsContent>
			</div>
		</Tabs>
	);
}

export default JudgementTabs;
