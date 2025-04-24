// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Suspense } from 'react';
import { IGenericListingResponse, IPostListing } from '@/_shared/types';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import styles from './Overview.module.scss';
import SpendPeriod from './SpendPeriod/SpendPeriod';
import CalendarEvents from './CalendarEvents/CalendarEvents';
import LatestActivity from './LatestActivity/LatestActivity';
import AboutSection from './AboutSection/AboutSection';
import OverviewHeading from './OverviewHeading';

function Overview({
	trackDetails
}: {
	trackDetails: {
		all: IGenericListingResponse<IPostListing> | null;
		discussion: IGenericListingResponse<IPostListing> | null;
		tracks: { trackName: string; data: IGenericListingResponse<IPostListing> | null }[];
	};
}) {
	return (
		<div className={styles.overview_container}>
			<OverviewHeading />

			{/* About Section */}
			<div className='rounded-lg border-none bg-bg_modal p-4 shadow-lg'>
				<AboutSection />
			</div>

			<div className='mt-6 grid gap-4 lg:grid-cols-2'>
				{/* Treasury Stats goes here */}
				<SpendPeriod />
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
					<LatestActivity trackDetails={trackDetails} />
				</Suspense>
			</div>
			<div className='mt-6 flex flex-col gap-4 xl:flex-row'>
				<div className='w-full'>
					<CalendarEvents />
				</div>
			</div>
		</div>
	);
}

export default Overview;
