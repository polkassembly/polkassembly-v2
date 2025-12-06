// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import { ETreasurySpendsTabs } from '@/_shared/types';
import { Tabs, TabsContent } from '@ui/Tabs';
import { TreasurySpendsHeader } from './components/Header/Header';
import InfoNudge from './components/InfoNudge/InfoNudge';
import SpendsList from './components/SpendsList/SpendsList';
import SpendsStats from './components/Stats/SpendsStats';
import CoretimeStats from './components/Stats/CoretimeStats';
import CoretimeMigration from './components/Stats/CoretimeMigration';
import CoretimeProcurementMethods from './components/Stats/CoretimeProcurementMethods';

export async function generateMetadata(): Promise<Metadata> {
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Governance Level Analytics`,
		description: 'Explore the Polkassembly Governance Analytics',
		network,
		url: `https://${network}.polkassembly.io/gov-analytics`,
		imageAlt: 'Polkassembly Governance Analytics'
	});
}

async function TreasuryAnalyticsPage() {
	return (
		<div className='w-full'>
			<Tabs defaultValue={ETreasurySpendsTabs.SPENDS}>
				<TreasurySpendsHeader />
				<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 py-5 lg:px-10'>
					<TabsContent value={ETreasurySpendsTabs.SPENDS}>
						<div className='flex flex-col gap-6'>
							<SpendsStats />
							<SpendsList />
						</div>
					</TabsContent>
					<TabsContent value={ETreasurySpendsTabs.CORETIME}>
						<div className='flex flex-col gap-6'>
							<CoretimeStats />

							<div className='flex gap-6'>
								<CoretimeMigration />
								<CoretimeProcurementMethods />
							</div>

							<InfoNudge />
						</div>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}

export default TreasuryAnalyticsPage;
