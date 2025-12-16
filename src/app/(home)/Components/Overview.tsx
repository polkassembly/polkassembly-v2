// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { Suspense } from 'react';
import { IGenericListingResponse, IPostListing, ITreasuryStats } from '@/_shared/types';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import SpendPeriodStats from '@/app/_shared-components/TreasuryStats/SpendPeriodStats';
import OverviewTreasuryStats from './OverviewTreasuryStats';
import styles from './Overview.module.scss';
import TreasuryReportBanner from './TreasuryReportBanner';
import LatestActivity from './LatestActivity/LatestActivity';

import OverviewHeading from './OverviewHeading';
import AppGrid from './AppGrid/AppGrid';
import JobsAndBounties from './JobsAndBounties/JobsAndBounties';

function Overview({ allTracksData, treasuryStatsData }: { allTracksData: IGenericListingResponse<IPostListing>; treasuryStatsData: ITreasuryStats[] }) {
	return (
		<div className={styles.overview_container}>
			<OverviewHeading />
			<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-8 lg:px-16'>
				{treasuryStatsData?.length > 0 && (
					<div className='flex flex-col gap-6 lg:flex-row'>
						<div className='w-full rounded-xl border border-border_grey bg-bg_modal p-4 shadow-sm lg:w-1/2'>
							<OverviewTreasuryStats data={treasuryStatsData} />
						</div>
						<div className='w-full rounded-xl border border-border_grey bg-bg_modal p-4 shadow-sm lg:w-1/2'>
							<SpendPeriodStats
								nextSpendAt={treasuryStatsData?.[0]?.relayChain?.nextSpendAt}
								nextBurn={treasuryStatsData?.[0]?.relayChain?.nextBurn}
							/>
						</div>
					</div>
				)}
				<AppGrid />

				<TreasuryReportBanner />
				<div className='mt-2 grid grid-cols-1 gap-6 lg:grid-cols-3'>
					<div className='w-full lg:col-span-2'>
						<Suspense
							fallback={
								<div className='relative flex min-h-40 w-full items-center justify-center'>
									<LoadingLayover />
								</div>
							}
						>
							<LatestActivity allTracksData={allTracksData} />
						</Suspense>
					</div>

					<div className='w-full lg:relative lg:col-span-1'>
						<div className='w-full lg:absolute lg:inset-0 lg:h-full'>
							<JobsAndBounties />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Overview;
