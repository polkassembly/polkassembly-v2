// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Activity, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import Image from 'next/image';

const cohortsData = [
	{ index: 5, tenure: 'Dec 1 - Dec 29', days: '28 days', delegates: 12, w3fDelegation: '30k DOT', status: 'Ongoing' },
	{ index: 4, tenure: 'Jan 1 - Jan 28', days: '28 days', delegates: 6, w3fDelegation: '50k DOT', status: 'Closed' },
	{ index: 3, tenure: 'Feb 1 - Feb 28', days: '28 days', delegates: 8, w3fDelegation: '75k DOT', status: 'Closed' },
	{ index: 2, tenure: 'Dec 1 - Dec 29', days: '28 days', delegates: 13, w3fDelegation: '400k DOT', status: 'Closed' },
	{ index: 1, tenure: 'Mar 1 - Mar 31', days: '31 days', delegates: 11, w3fDelegation: '500k DOT', status: 'Closed' }
];

function CohortsTableCard() {
	return (
		<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6 shadow-md'>
			<div className='mb-6 flex items-center gap-2'>
				<Activity className='text-decision_bar_indicator' />
				<h2 className='text-2xl font-semibold text-navbar_title'>Cohorts</h2>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[800px] table-auto'>
					<thead>
						<tr className='border-b border-t border-border_grey bg-bounty_table_bg pt-3 text-left text-xs font-semibold uppercase text-text_primary'>
							<th className='py-4 pl-4'>INDEX</th>
							<th className='py-4'>
								<div className='flex items-center gap-1'>
									TENURE
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<HelpCircle
													size={14}
													className='ml-1 text-text_primary'
												/>
											</TooltipTrigger>
											<TooltipContent className='bg-tooltip_background p-2 text-btn_primary_text'>
												<p>Duration of the cohort</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</th>
							<th className='py-4'>DELEGATES</th>
							<th className='py-4'>W3F DELEGATION</th>
							<th className='py-4'>STATUS</th>
						</tr>
					</thead>
					<tbody>
						{cohortsData.map((item) => (
							<tr
								key={item.index}
								className='cursor-pointer border-b border-border_grey text-sm font-semibold hover:border-border_grey/90'
							>
								<td className='py-4 pl-4 text-text_primary'>{item.index}</td>
								<td className='py-4'>
									<span className='text-text_primary'>{item.tenure}</span>
									<span className='ml-2 text-wallet_btn_text'>{item.days}</span>
								</td>
								<td className='py-4 text-text_primary'>{item.delegates}</td>
								<td className='py-4'>
									<div className='flex items-center gap-2'>
										<Image
											src={PolkadotLogo}
											alt='polkadot logo'
											className='h-8 w-8 rounded-full'
											width={32}
											height={32}
										/>
										<span className='font-medium text-text_primary'>{item.w3fDelegation}</span>
									</div>
								</td>
								<td className='py-4'>
									<span
										className={`rounded-full px-4 py-1 text-xs font-medium text-btn_primary_text ${item.status === 'Ongoing' ? 'bg-decision_bar_indicator' : 'bg-progress_nay'}`}
									>
										{item.status}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default CohortsTableCard;
