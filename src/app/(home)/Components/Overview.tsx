// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Suspense } from 'react';
import { IGenericListingResponse, IPostListing, ITreasuryStats } from '@/_shared/types';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import TreasuryStats from '@/app/_shared-components/TreasuryStats/TreasuryStats';
import styles from './Overview.module.scss';
import LatestActivity from './LatestActivity/LatestActivity';
import AboutSection from './AboutSection/AboutSection';
import OverviewHeading from './OverviewHeading';

function Overview({ allTracksData, treasuryStatsData }: { allTracksData: IGenericListingResponse<IPostListing>; treasuryStatsData: ITreasuryStats[] }) {
	return (
		<div className={styles.overview_container}>
			<OverviewHeading />

			{/* About Section */}
			<div className='rounded-lg border-none bg-bg_modal p-4 shadow-lg'>
				<AboutSection />
			</div>

			{/* Treasury Stats */}
			<div>
				<TreasuryStats data={treasuryStatsData} />
			</div>

			{/* Latest Activity */}
			<div className='mt-6 rounded-xl bg-bg_modal p-6 shadow-lg'>
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
		</div>
	);
}

export default Overview;
