// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Filter, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getCurrentDVCohort } from '@/_shared/_utils/dvDelegateUtils';
import { useState } from 'react';
import { ECohortStatus, EDVTrackFilter } from '@/_shared/types';
import { useDVDelegates, useDVInfluence, useDVVotingMatrix } from '@/hooks/useDVDelegates';
import TimeLineIcon from '@assets/icons/timeline.svg';
import Image from 'next/image';
import CohortsTableCard from '../Components/CohortsTableCard';
import DecentralizedVoicesVotingCard from '../Components/DecentralizedVoicesVotingCard';
import DecentralisedVoicesCard from '../Components/DecentralisedVoicesCard';
import InfluenceCard from '../Components/InfluenceCard';
import CohortCard from '../Components/CohortCard';

function DecentralisedVoices() {
	const t = useTranslations('DecentralizedVoices');
	const searchParams = useSearchParams();
	const cohortIndexParam = searchParams.get('cohort');

	const network = getCurrentNetwork();
	const currentCohort = getCurrentDVCohort(network);
	const cohortId = cohortIndexParam ? parseInt(cohortIndexParam, 10) : (currentCohort?.index ?? 5);

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
				<div className='flex h-96 items-center justify-center'>
					<p className='text-text_secondary'>{(typeof error === 'string' ? error : error?.message) || 'No active DV cohort found for this network'}</p>
				</div>
			</div>
		);
	}
	return (
		<div>
			<div className='mx-auto max-w-7xl px-4 py-5 lg:px-16'>
				<div className='w-full overflow-hidden rounded-2xl border border-border_grey bg-bg_modal p-4 shadow-md sm:p-5 md:mb-8 md:p-6 lg:p-8'>
					<div className='flex items-center justify-between gap-3'>
						<div className='flex items-center gap-2'>
							<Image
								src={TimeLineIcon}
								alt='Delegation Green Icon'
								width={24}
								height={24}
								className='h-6 w-6'
							/>{' '}
							<h2 className='flex flex-wrap items-center gap-2 text-xl font-semibold text-navbar_title sm:text-2xl'>
								{t('Cohort')} #{delegatesLoading ? '...' : (cohort?.index ?? '...')}{' '}
								<span
									className={`rounded-full px-2 py-0.5 text-[10px] text-btn_primary_text sm:text-xs ${cohort?.status === ECohortStatus.ONGOING ? 'bg-border_blue' : 'bg-progress_nay'}`}
								>
									{cohort?.status ?? 'Loading'}
								</span>
							</h2>
						</div>
						<Popover>
							<PopoverTrigger asChild>
								<button
									type='button'
									className='flex items-center justify-center gap-2 rounded-md border border-border_grey px-3 py-2 text-sm text-text_primary hover:bg-sidebar_footer sm:w-auto'
								>
									<Filter className='h-3.5 w-3.5 text-wallet_btn_text sm:h-4 sm:w-4' />
									<ChevronDown className='h-3.5 w-3.5 text-wallet_btn_text sm:h-4 sm:w-4' />
								</button>
							</PopoverTrigger>
							<PopoverContent className='w-56 border-border_grey p-2'>
								<div className='space-y-1'>
									<button
										type='button'
										onClick={() => setTrackFilter(EDVTrackFilter.DV_TRACKS)}
										className={`flex w-full items-center rounded px-3 py-2 text-sm ${trackFilter === EDVTrackFilter.DV_TRACKS ? 'bg-text_pink/10 text-text_pink' : 'text-text_primary hover:bg-sidebar_footer'}`}
									>
										{t('OnlyDVTracksReferenda')}
									</button>
									<button
										type='button'
										onClick={() => setTrackFilter(EDVTrackFilter.ALL)}
										className={`flex w-full items-center rounded px-3 py-2 text-sm ${trackFilter === EDVTrackFilter.ALL ? 'bg-text_pink/10 text-text_pink' : 'text-text_primary hover:bg-sidebar_footer'}`}
									>
										{t('AllReferenda')}
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

export default DecentralisedVoices;
