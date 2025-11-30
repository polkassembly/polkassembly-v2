// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useSearchParams } from 'next/navigation';
import { useDVDelegates } from '@/hooks/useDVDelegates';
import { EDVDelegateType } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getCurrentDVCohort } from '@/_shared/_utils/dvDelegateUtils';
import TabCard from './Components/TabCard';
import { Tabs, TabsContent } from '../_shared-components/Tabs';
import DecentralisedVoices from './DecentralisedVoices';

function PeoplePage() {
	const searchParams = useSearchParams();
	const cohortIndexParam = searchParams.get('cohort');

	const network = getCurrentNetwork();
	const currentCohort = getCurrentDVCohort(network);
	const cohortId = cohortIndexParam ? parseInt(cohortIndexParam, 10) : (currentCohort?.index ?? 5);

	const { data: delegatesData } = useDVDelegates({ cohortId });

	const cohort = delegatesData?.cohort || null;

	const delegates = cohort?.delegates?.filter((d) => d.type === EDVDelegateType.DAO).length;
	const guardians = cohort?.delegates?.filter((d) => d.type === EDVDelegateType.GUARDIAN).length;
	const tracks = cohort?.tracks?.length;

	return (
		<div className='min-h-screen bg-page_background'>
			<Tabs defaultValue='dv'>
				<TabCard
					cohortNumber={cohort?.index ?? cohortId}
					delegates={delegates || 0}
					guardians={guardians || 0}
					tracks={tracks || 0}
				/>
				<TabsContent value='dv'>
					<DecentralisedVoices />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default PeoplePage;
