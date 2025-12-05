// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_shared-components/Popover/Popover';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getCurrentDVCohort, calculateDVCohortStats, calculateDVInfluence, calculateDVVotingMatrix } from '@/_shared/_utils/dvDelegateUtils';
import { DV_TRACKS } from '@/_shared/_constants/dvCohorts';
import { useState, useMemo } from 'react';
import { ECohortStatus, EDVTrackFilter } from '@/_shared/types';
import { useDVCohortDetails, useDVCohortReferenda, useDVCohortVotes } from '@/hooks/useDVDelegates';
import TimeLineIcon from '@assets/icons/timeline.svg';
import Image from 'next/image';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
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

	const { data: cohort, isLoading: cohortLoading, error: cohortError } = useDVCohortDetails(cohortId);
	const { data: referenda, isLoading: referendaLoading, error: referendaError } = useDVCohortReferenda(cohortId);
	const { data: votes, isLoading: votesLoading, error: votesError } = useDVCohortVotes(cohortId);

	const isLoading = cohortLoading || referendaLoading || votesLoading;
	const error = cohortError || referendaError || votesError;

	const { delegatesWithStats, referendaInfluence, votingMatrix, referendumIndices } = useMemo(() => {
		if (!cohort || !referenda || !votes) {
			return { delegatesWithStats: [], referendaInfluence: [], votingMatrix: [], referendumIndices: [] };
		}

		let filteredReferenda = referenda;
		if (trackFilter === EDVTrackFilter.DV_TRACKS) {
			const dvTracks = DV_TRACKS;
			const networkDetails = NETWORKS_DETAILS[network];
			if (networkDetails) {
				const allowedTrackIds = dvTracks.map((origin) => networkDetails.trackDetails[origin]?.trackId).filter((id) => id !== undefined);
				filteredReferenda = referenda.filter((r) => allowedTrackIds.includes(r.trackNumber));
			} else {
				filteredReferenda = [];
			}
		}

		const stats = calculateDVCohortStats(votes, filteredReferenda, cohort);
		const influence = calculateDVInfluence(votes, cohort, filteredReferenda, network);
		const matrix = calculateDVVotingMatrix(votes, cohort, filteredReferenda);

		return {
			delegatesWithStats: stats.delegatesWithStats,
			referendaInfluence: influence.referendaInfluence,
			votingMatrix: matrix.votingMatrix,
			referendumIndices: matrix.referendumIndices
		};
	}, [cohort, referenda, votes, trackFilter, network]);

	if (error || (!isLoading && !cohort)) {
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
								{t('Cohort')} {cohort ? `#${cohort.index}` : ''}
								{cohort && (
									<span
										className={`rounded-full px-2 py-0.5 text-[10px] text-btn_primary_text sm:text-xs ${cohort.status === ECohortStatus.ONGOING ? 'bg-border_blue' : 'bg-progress_nay'}`}
									>
										{cohort.status}
									</span>
								)}
							</h2>
						</div>
						<Popover>
							<PopoverTrigger asChild>
								<button
									type='button'
									className='flex items-center justify-center gap-2 rounded-md border border-border_grey px-3 py-2 text-sm text-text_primary hover:bg-sidebar_footer sm:w-auto'
								>
									<Filter className='h-3.5 w-3.5 text-wallet_btn_text sm:h-4 sm:w-4' />
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
						cohort={cohort || null}
						loading={isLoading}
						network={network}
					/>
					<DecentralisedVoicesCard
						delegatesWithStats={delegatesWithStats}
						cohort={cohort || null}
						loading={isLoading}
					/>
					<InfluenceCard
						referendaInfluence={referendaInfluence}
						loading={isLoading}
					/>
					<DecentralizedVoicesVotingCard
						votingMatrix={votingMatrix}
						referendumIndices={referendumIndices}
						cohort={cohort || null}
						loading={isLoading}
					/>
				</div>

				<CohortsTableCard />
			</div>
		</div>
	);
}

export default DecentralisedVoices;
