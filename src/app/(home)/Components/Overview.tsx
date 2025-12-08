// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { IGenericListingResponse, IPostListing, ITreasuryStats } from '@/_shared/types';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import SpendPeriodStats from '@/app/_shared-components/TreasuryStats/SpendPeriodStats';
import { ArrowRight } from 'lucide-react';
import OverviewTreasuryStats from './OverviewTreasuryStats';
import styles from './Overview.module.scss';
import LatestActivity from './LatestActivity/LatestActivity';

import OverviewHeading from './OverviewHeading';
import AppGrid from './AppGrid/AppGrid';
import JobsAndBounties from './JobsAndBounties/JobsAndBounties';

function Overview({ allTracksData, treasuryStatsData }: { allTracksData: IGenericListingResponse<IPostListing>; treasuryStatsData: ITreasuryStats[] }) {
	const t = useTranslations();
	return (
		<div className={styles.overview_container}>
			<OverviewHeading />
			<div className='mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-8 lg:px-16'>
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
				<AppGrid />

				<div className='flex items-center justify-between rounded-xl border border-treasury_stats_border bg-klara_stats_bg p-6'>
					<div className='flex flex-col gap-1'>
						<h3 className='text-xl font-bold text-text_primary'>{t('Overview.treasuryReportTitle')}</h3>
						<p className='text-sm font-medium text-wallet_btn_text'>{t('Overview.treasuryReportDescription')}</p>
					</div>
					<button
						type='button'
						className='flex h-10 w-10 items-center justify-center rounded-full bg-arrow_bg_color text-bg_modal'
					>
						<ArrowRight className='h-5 w-5' />
					</button>
				</div>
				<div className='mt-2 flex flex-col gap-6 lg:flex-row'>
					<div className='w-full rounded-xl border border-border_grey bg-bg_modal p-6 shadow-sm lg:w-1/2'>
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

					<JobsAndBounties />
				</div>
			</div>
		</div>
	);
}

export default Overview;
