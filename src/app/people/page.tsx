// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

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
			<div className='mb-4 w-full p-4 md:mb-8 md:p-8 md:px-20'>
				<CohortCard />
				<DecentralisedVoicesCard />
				<InfluenceCard />
				<DecentralizedVoicesVotingCard />
				<CohortsTableCard />
			</div>
		</div>
	);
}

export default PeoplePage;
