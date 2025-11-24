// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Activity, Filter } from 'lucide-react';
import TabCard from './Components/TabCard';
import CohortCard from './Components/CohortCard';
import InfluenceCard from './Components/InfluenceCard';
import DecentralisedVoicesCard from './Components/DecentralisedVoicesCard';
import DecentralizedVoicesVotingCard from './Components/DecentralizedVoicesVotingCard';
import CohortsTableCard from './Components/CohortsTableCard';

function PeoplePage() {
	return (
		<div className='min-h-screen bg-page_background'>
			<TabCard />
			<div className='mb-4 w-full p-4 md:mb-8 md:px-20'>
				<div className='mb-4 w-full rounded-2xl border border-border_grey bg-bg_modal p-6 shadow-md md:mb-8'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Activity className='text-border_blue' />
							<h2 className='flex items-center gap-2 text-2xl font-semibold text-navbar_title'>
								Cohort #5 <span className='rounded-full bg-border_blue px-2 py-0.5 text-xs text-btn_primary_text'>Ongoing</span>
							</h2>
						</div>
						<Filter className='h-4 w-4 text-wallet_btn_text' />
					</div>
					<CohortCard />
					<DecentralisedVoicesCard />
					<InfluenceCard />
					<DecentralizedVoicesVotingCard />
				</div>

				<CohortsTableCard />
			</div>
		</div>
	);
}

export default PeoplePage;
