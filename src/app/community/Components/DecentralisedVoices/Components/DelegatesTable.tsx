// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { Ban } from 'lucide-react';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import { BsFillQuestionCircleFill } from '@react-icons/all-files/bs/BsFillQuestionCircleFill';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { IDVDelegateWithStats } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';

interface DelegatesTableProps {
	delegates: IDVDelegateWithStats[];
	loading?: boolean;
}

function DelegatesTable({ delegates, loading }: DelegatesTableProps) {
	const t = useTranslations('DecentralizedVoices');

	return (
		<div className='overflow-x-auto'>
			<table className='w-full min-w-[800px] table-auto'>
				<thead>
					<tr className='border-b border-t border-border_grey bg-bounty_table_bg pt-3 text-left text-xs font-semibold uppercase text-text_primary'>
						<th className='py-4 pl-4'>{t('Name').toUpperCase()}</th>
						<th className='py-4'>{t('VotesCasted').toUpperCase()}</th>
						<th className='py-4'>{t('VoteCount').toUpperCase()}</th>
						<th className='py-4'>
							<div className='flex items-center gap-1'>
								{t('Participation').toUpperCase()}
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<BsFillQuestionCircleFill className='ml-1 text-base text-btn_secondary_border' />
										</TooltipTrigger>
										<TooltipContent className='bg-tooltip_background p-2 text-btn_primary_text'>
											<p>{t('ParticipationTooltip')}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</th>
						<th className='py-4'>
							<div className='flex items-center gap-1'>
								{t('WinRate').toUpperCase()}
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<BsFillQuestionCircleFill className='ml-1 text-base text-btn_secondary_border' />
										</TooltipTrigger>
										<TooltipContent className='bg-tooltip_background p-2 text-btn_primary_text'>
											<p>{t('WinRateTooltip')}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</th>
					</tr>
				</thead>
				<tbody>
					{loading
						? [1, 2, 3, 4, 5].map((i) => (
								<tr
									key={i}
									className='border-b border-border_grey'
								>
									<td className='py-4 pl-4'>
										<Skeleton className='h-6 w-40' />
									</td>
									<td className='py-4'>
										<Skeleton className='h-5 w-12' />
									</td>
									<td className='py-4'>
										<div className='flex gap-4'>
											<Skeleton className='h-5 w-10' />
											<Skeleton className='h-5 w-10' />
											<Skeleton className='h-5 w-10' />
										</div>
									</td>
									<td className='py-4'>
										<Skeleton className='h-5 w-16' />
									</td>
									<td className='py-4'>
										<Skeleton className='h-5 w-16' />
									</td>
								</tr>
							))
						: delegates.map((delegate) => {
								const totalVotes = delegate.voteStats.ayeCount + delegate.voteStats.nayCount + delegate.voteStats.abstainCount;
								return (
									<tr
										key={delegate.address}
										className='cursor-pointer border-b border-border_grey text-sm font-semibold text-text_primary hover:border-border_grey/90'
									>
										<td className='py-4 pl-4'>
											<div className='flex items-center gap-2'>
												<Address address={delegate.address} />
											</div>
										</td>
										<td className='py-4 font-medium'>{totalVotes}</td>
										<td className='py-4'>
											<div className='flex items-center gap-4'>
												<div className='flex items-center gap-1 text-success'>
													<AiFillLike className='fill-current text-sm' />
													<span className='font-medium text-text_primary'>{delegate.voteStats.ayeCount}</span>
												</div>
												<div className='flex items-center gap-1 text-toast_error_text'>
													<AiFillDislike className='fill-current text-sm' />
													<span className='font-medium text-text_primary'>{delegate.voteStats.nayCount}</span>
												</div>
												<div className='flex items-center gap-1 text-bg_blue'>
													<Ban size={14} />
													<span className='font-medium text-text_primary'>{delegate.voteStats.abstainCount}</span>
												</div>
											</div>
										</td>
										<td className='py-4'>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger className='cursor-pointer font-medium text-text_primary'>{delegate.voteStats.participation.toFixed(2)} %</TooltipTrigger>
													<TooltipContent className='bg-tooltip_background text-btn_primary_text'>
														<p>{t('VotesCastTotalEligibleReferenda')}</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</td>
										<td className='py-4'>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger className='cursor-pointer font-medium text-success'>{delegate.voteStats.winRate.toFixed(2)} %</TooltipTrigger>
													<TooltipContent className='bg-tooltip_background text-btn_primary_text'>
														<p>{t('WinningVotesTotalNonAbstainVotes')}</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</td>
									</tr>
								);
							})}
				</tbody>
			</table>
		</div>
	);
}

export default DelegatesTable;
