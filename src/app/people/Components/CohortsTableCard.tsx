// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Activity, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@assets/parachain-logos/kusama-logo.gif';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getDVCohortsByNetwork, formatNumber, formatDateRange, getCohortTenureDays } from '@/_shared/_utils/dvDelegateUtils';
import { ENetwork, ECohortStatus } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

function CohortsTableCard() {
	const t = useTranslations('DecentralizedVoices');
	const router = useRouter();
	const searchParams = useSearchParams();
	const selectedCohortIndex = searchParams.get('cohort');

	const network = getCurrentNetwork();
	const cohorts = getDVCohortsByNetwork(network).slice().reverse();
	const isPolkadot = network === ENetwork.POLKADOT;
	const networkLogo = isPolkadot ? PolkadotLogo : KusamaLogo;
	const { tokenSymbol } = NETWORKS_DETAILS[network];

	const handleCohortClick = (cohortIndex: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('cohort', cohortIndex.toString());
		router.push(`/people?${params.toString()}`);
	};

	return (
		<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6 shadow-md'>
			<div className='mb-6 flex items-center gap-2'>
				<Activity className='text-decision_bar_indicator' />
				<h2 className='text-2xl font-semibold text-navbar_title'>{t('Cohorts')}</h2>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[800px] table-auto'>
					<thead>
						<tr className='border-b border-t border-border_grey bg-bounty_table_bg pt-3 text-left text-xs font-semibold uppercase text-text_primary'>
							<th className='py-4 pl-4'>{t('Index')}</th>
							<th className='py-4'>
								<div className='flex items-center gap-1'>
									{t('Tenure')}
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<HelpCircle
													size={14}
													className='ml-1 text-text_primary'
												/>
											</TooltipTrigger>
											<TooltipContent className='bg-tooltip_background p-2 text-btn_primary_text'>
												<p>{t('DurationOfCohort')}</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</th>
							<th className='py-4'>{t('Delegates')}</th>
							<th className='py-4'>{t('W3FDelegation')}</th>
							<th className='py-4'>{t('Status').toUpperCase()}</th>
						</tr>
					</thead>
					<tbody>
						{cohorts.map((cohort) => {
							const isSelected = selectedCohortIndex === cohort.index.toString();
							const delegationAmount = cohort.delegationPerDelegate;
							return (
								<tr
									key={cohort.index}
									onClick={() => handleCohortClick(cohort.index)}
									className={`cursor-pointer border-b border-border_grey text-sm font-semibold hover:bg-sidebar_footer ${isSelected ? 'bg-sidebar_footer' : ''}`}
								>
									<td className='py-4 pl-4 text-text_primary'>{cohort.index}</td>
									<td className='py-4'>
										<span className='text-text_primary'>{formatDateRange(cohort.startTime, cohort.endTime, cohort.status === ECohortStatus.ONGOING)}</span>
										<span className='ml-2 text-wallet_btn_text'>
											{getCohortTenureDays(cohort)} {t('Days')}
										</span>
									</td>
									<td className='py-4 text-text_primary'>{cohort.delegatesCount + cohort.guardiansCount}</td>
									<td className='py-4'>
										<div className='flex items-center gap-2'>
											<Image
												src={networkLogo}
												alt='network logo'
												className='h-8 w-8 rounded-full'
												width={32}
												height={32}
											/>
											<span className='font-medium text-text_primary'>
												{formatNumber(delegationAmount)} {tokenSymbol}
											</span>
										</div>
									</td>
									<td className='py-4'>
										<span
											className={`rounded-full px-4 py-1 text-xs font-medium text-btn_primary_text ${cohort.status === ECohortStatus.ONGOING ? 'bg-decision_bar_indicator' : 'bg-progress_nay'}`}
										>
											{cohort.status}
										</span>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default CohortsTableCard;
