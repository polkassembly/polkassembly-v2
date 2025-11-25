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
import { Skeleton } from '@/app/_shared-components/Skeleton';
import TabCard from './Components/TabCard';
import CohortCard from './Components/CohortCard';
import InfluenceCard from './Components/InfluenceCard';
import DecentralisedVoicesCard from './Components/DecentralisedVoicesCard';
import DecentralizedVoicesVotingCard from './Components/DecentralizedVoicesVotingCard';
import CohortsTableCard from './Components/CohortsTableCard';

function PeoplePage() {
	const searchParams = useSearchParams();
	const cohortIndexParam = searchParams.get('cohort');
	const cohortId = cohortIndexParam ? parseInt(cohortIndexParam, 10) : undefined;

	const [trackFilter, setTrackFilter] = useState<EDVTrackFilter>(EDVTrackFilter.DV_TRACKS);

	const { data: delegatesData, loading: delegatesLoading, error: delegatesError } = useDVDelegates(cohortId, trackFilter);
	const { data: influenceData, loading: influenceLoading, error: influenceError } = useDVInfluence(cohortId, undefined, trackFilter);
	const { data: votingMatrixData, loading: votingMatrixLoading, error: votingMatrixError } = useDVVotingMatrix(cohortId, trackFilter);

	const cohort = delegatesData?.cohort || null;
	const delegatesWithStats = delegatesData?.delegatesWithStats || [];
	const referendaInfluence = influenceData?.referenda || [];
	const votingMatrix = votingMatrixData?.delegates || [];
	const referendumIndices = votingMatrixData?.referendumIndices || [];

	const loading = delegatesLoading || influenceLoading || votingMatrixLoading;
	const error = delegatesError || influenceError || votingMatrixError;

	if (loading) {
		return (
			<div className='min-h-screen bg-page_background'>
				<TabCard />
				<div className='mb-4 w-full p-4 md:mb-8 md:px-20'>
					<div className='mb-4 w-full rounded-2xl border border-border_grey bg-bg_modal p-6 shadow-md md:mb-8'>
						{/* Header skeleton */}
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Skeleton className='h-6 w-6 rounded' />
								<Skeleton className='h-8 w-48' />
								<Skeleton className='h-6 w-20 rounded-full' />
							</div>
							<Skeleton className='h-10 w-32 rounded-md' />
						</div>

						{/* CohortCard skeleton */}
						<div className='my-4 rounded-3xl border border-border_grey p-6'>
							<div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className='flex items-start gap-4'
									>
										<Skeleton className='h-10 w-10 rounded-full' />
										<div className='space-y-2'>
											<Skeleton className='h-3 w-20' />
											<Skeleton className='h-7 w-16' />
											<Skeleton className='h-3 w-24' />
										</div>
									</div>
								))}
							</div>
						</div>

						{/* DecentralisedVoicesCard skeleton */}
						<div className='my-4 rounded-3xl border border-border_grey p-6'>
							<div className='mb-6 flex items-center gap-2'>
								<Skeleton className='h-6 w-6' />
								<Skeleton className='h-7 w-56' />
							</div>
							<div className='space-y-3'>
								{[1, 2, 3, 4, 5].map((i) => (
									<Skeleton
										key={i}
										className='h-14 w-full rounded-lg'
									/>
								))}
							</div>
						</div>

						{/* InfluenceCard skeleton */}
						<div className='my-4 rounded-3xl border border-border_grey p-6'>
							<div className='mb-6 flex items-center gap-2'>
								<Skeleton className='h-6 w-6' />
								<Skeleton className='h-7 w-48' />
							</div>
							<div className='space-y-3'>
								{[1, 2, 3, 4, 5].map((i) => (
									<Skeleton
										key={i}
										className='h-14 w-full rounded-lg'
									/>
								))}
							</div>
						</div>
					</div>

					{/* CohortsTableCard skeleton */}
					<div className='rounded-3xl border border-border_grey bg-bg_modal p-6 shadow-md'>
						<div className='mb-6 flex items-center gap-2'>
							<Skeleton className='h-6 w-6' />
							<Skeleton className='h-7 w-32' />
						</div>
						<div className='space-y-3'>
							{[1, 2, 3].map((i) => (
								<Skeleton
									key={i}
									className='h-16 w-full rounded-lg'
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !cohort) {
		return (
			<div className='min-h-screen bg-page_background'>
				<TabCard />
				<div className='flex h-96 items-center justify-center'>
					<p className='text-text_secondary'>{error || 'No active DV cohort found for this network'}</p>
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
								Cohort #{cohort.index}{' '}
								<span className={`rounded-full px-2 py-0.5 text-xs text-btn_primary_text ${cohort.status === 'Ongoing' ? 'bg-border_blue' : 'bg-text_secondary'}`}>
									{cohort.status}
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
									<span>Count by</span>
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
					<CohortCard cohort={cohort} />
					<DecentralisedVoicesCard
						delegatesWithStats={delegatesWithStats}
						cohort={cohort}
					/>
					<InfluenceCard referendaInfluence={referendaInfluence} />
					<DecentralizedVoicesVotingCard
						votingMatrix={votingMatrix}
						referendumIndices={referendumIndices}
						cohort={cohort}
					/>
				</div>

				<CohortsTableCard />
			</div>
		</div>
	);
}

export default PeoplePage;
