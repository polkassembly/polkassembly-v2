// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Activity, Filter, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDVDelegates, useDVInfluence, useDVVotingMatrix } from '@/hooks/useDVDelegates';
import { EDVTrackFilter } from '@/_shared/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import TabCard from './Components/TabCard';
import CohortCard from './Components/CohortCard';
import InfluenceCard from './Components/InfluenceCard';
import DecentralisedVoicesCard from './Components/DecentralisedVoicesCard';
import DecentralizedVoicesVotingCard from './Components/DecentralizedVoicesVotingCard';
import CohortsTableCard from './Components/CohortsTableCard';

function PeoplePage() {
	const searchParams = useSearchParams();
	const cohortIndexParam = searchParams.get('cohort');
	const cohortId = cohortIndexParam ? parseInt(cohortIndexParam, 10) : 5;

	const [trackFilter, setTrackFilter] = useState<EDVTrackFilter>(EDVTrackFilter.DV_TRACKS);

	const { data: delegatesData, isLoading: delegatesLoading, error: delegatesError } = useDVDelegates({ cohortId, trackFilter });
	const { data: influenceData, isLoading: influenceLoading, error: influenceError } = useDVInfluence({ cohortId, trackFilter });
	const { data: votingMatrixData, isLoading: votingMatrixLoading, error: votingMatrixError } = useDVVotingMatrix({ cohortId, trackFilter });

	const cohort = delegatesData?.cohort || null;
	const delegatesWithStats = delegatesData?.delegatesWithStats || [];
	const referendaInfluence = influenceData?.referenda || [];
	const votingMatrix = votingMatrixData?.delegates || [];
	const referendumIndices = votingMatrixData?.referendumIndices || [];

	const error = delegatesError || influenceError || votingMatrixError;

	if (error || (!delegatesLoading && !cohort)) {
		return (
			<div className='min-h-screen bg-page_background'>
				<TabCard />
				<div className='flex h-96 items-center justify-center'>
					<p className='text-text_secondary'>{(typeof error === 'string' ? error : error?.message) || 'No active DV cohort found for this network'}</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-page_background'>
			<TabCard />
			<div className='mb-4 w-full p-4 md:mb-8 md:px-20'>
				<div className='mb-4 w-full overflow-hidden rounded-2xl border border-border_grey bg-bg_modal p-6 shadow-md md:mb-8'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Activity className='text-border_blue' />
							<h2 className='flex items-center gap-2 text-2xl font-semibold text-navbar_title'>
								Cohort #{delegatesLoading ? '...' : (cohort?.index ?? '...')}{' '}
								<span className={`rounded-full px-2 py-0.5 text-xs text-btn_primary_text ${cohort?.status === 'Ongoing' ? 'bg-border_blue' : 'bg-text_secondary'}`}>
									{cohort?.status ?? 'Loading'}
								</span>
							</h2>
						</div>
						<Popover>
							<PopoverTrigger asChild>
								<button
									type='button'
									className='flex items-center gap-2 rounded-md border border-border_grey px-3 py-2 text-sm text-text_primary hover:bg-sidebar_footer'
								>
									<Filter className='h-4 w-4 text-wallet_btn_text' />
									<ChevronDown className='h-4 w-4 text-wallet_btn_text' />
								</button>
							</PopoverTrigger>
							<PopoverContent className='w-56 border-border_grey p-2'>
								<div className='space-y-1'>
									<button
										type='button'
										onClick={() => setTrackFilter(EDVTrackFilter.DV_TRACKS)}
										className={`flex w-full items-center rounded px-3 py-2 text-sm ${trackFilter === EDVTrackFilter.DV_TRACKS ? 'bg-text_pink/10 text-text_pink' : 'text-text_primary hover:bg-sidebar_footer'}`}
									>
										Only DV tracks referenda
									</button>
									<button
										type='button'
										onClick={() => setTrackFilter(EDVTrackFilter.ALL)}
										className={`flex w-full items-center rounded px-3 py-2 text-sm ${trackFilter === EDVTrackFilter.ALL ? 'bg-text_pink/10 text-text_pink' : 'text-text_primary hover:bg-sidebar_footer'}`}
									>
										All referenda
									</button>
								</div>
							</PopoverContent>
						</Popover>
					</div>
					<CohortCard
						cohort={cohort}
						loading={delegatesLoading}
					/>
					<DecentralisedVoicesCard
						delegatesWithStats={delegatesWithStats}
						cohort={cohort}
						loading={delegatesLoading}
					/>
					<InfluenceCard
						referendaInfluence={referendaInfluence}
						loading={influenceLoading}
					/>
					<DecentralizedVoicesVotingCard
						votingMatrix={votingMatrix}
						referendumIndices={referendumIndices}
						cohort={cohort}
						loading={votingMatrixLoading}
					/>
				</div>

				<CohortsTableCard />
			</div>
		</div>
	);
}

export default PeoplePage;
