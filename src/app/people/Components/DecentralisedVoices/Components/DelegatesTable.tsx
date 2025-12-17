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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';

interface DelegatesTableProps {
	delegates: IDVDelegateWithStats[];
	loading?: boolean;
}

function DelegatesTable({ delegates, loading }: DelegatesTableProps) {
	const t = useTranslations('DecentralizedVoices');

	const getWinRateColor = (percent: number): string => {
		if (percent < 50) return 'text-toast_error_text';
		if (percent < 80) return 'text-toast_warning_text';
		return 'text-success';
	};

	return (
		<Table className='table-auto'>
			<TableHeader>
				<TableRow className='border-b border-t border-border_grey bg-bounty_table_bg pt-3 text-left text-xs font-semibold uppercase text-text_primary'>
					<TableHead className='whitespace-nowrap py-4 pl-4 font-semibold uppercase'>{t('Name')}</TableHead>
					<TableHead className='whitespace-nowrap py-4 font-semibold uppercase'>{t('VotesCasted')}</TableHead>
					<TableHead className='whitespace-nowrap py-4 font-semibold uppercase'>{t('VoteCount')}</TableHead>
					<TableHead className='whitespace-nowrap py-4 font-semibold'>
						<div className='flex items-center gap-1'>
							<span className='uppercase'>{t('Participation')}</span>
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
					</TableHead>
					<TableHead className='whitespace-nowrap py-4 pr-4 font-semibold'>
						<div className='flex items-center gap-1'>
							<span className='uppercase'>{t('WinRate')}</span>
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
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{loading
					? [1, 2, 3, 4, 5].map((i) => (
							<TableRow
								key={i}
								className='border-b border-border_grey'
							>
								<TableCell className='py-4 pl-4'>
									<Skeleton className='h-6 w-40' />
								</TableCell>
								<TableCell className='py-4'>
									<Skeleton className='h-5 w-12' />
								</TableCell>
								<TableCell className='py-4'>
									<div className='flex gap-4'>
										<Skeleton className='h-5 w-10' />
										<Skeleton className='h-5 w-10' />
										<Skeleton className='h-5 w-10' />
									</div>
								</TableCell>
								<TableCell className='py-4'>
									<Skeleton className='h-5 w-16' />
								</TableCell>
								<TableCell className='py-4 pr-4'>
									<Skeleton className='h-5 w-16' />
								</TableCell>
							</TableRow>
						))
					: delegates.map((delegate) => {
							const totalVotes = delegate.voteStats.ayeCount + delegate.voteStats.nayCount + delegate.voteStats.abstainCount;
							return (
								<TableRow
									key={delegate.address}
									className='border-b border-border_grey text-sm font-semibold text-text_primary hover:border-border_grey/90'
								>
									<TableCell className='py-4 pl-4'>
										<div className='flex items-center gap-2'>
											<Address address={delegate.address} />
										</div>
									</TableCell>
									<TableCell className='py-4 font-medium'>{totalVotes}</TableCell>
									<TableCell className='py-4'>
										<div className='flex items-center gap-4'>
											<div className='flex items-center gap-1 text-social_green'>
												<AiFillLike className='fill-current text-sm' />
												<span className='font-medium text-text_primary'>{delegate.voteStats.ayeCount}</span>
											</div>
											<div className='flex items-center gap-1 text-failure'>
												<AiFillDislike className='fill-current text-sm' />
												<span className='font-medium text-text_primary'>{delegate.voteStats.nayCount}</span>
											</div>
											<div className='flex items-center gap-1 text-dv_abstain_color'>
												<Ban size={14} />
												<span className='font-medium text-text_primary'>{delegate.voteStats.abstainCount}</span>
											</div>
										</div>
									</TableCell>
									<TableCell className='py-4'>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger className='cursor-pointer font-medium text-text_primary'>{delegate.voteStats.participation.toFixed(2)} %</TooltipTrigger>
												<TooltipContent className='bg-tooltip_background text-btn_primary_text'>
													<p>{t('VotedTotal', { total: delegate.voteStats.totalReferenda, voted: totalVotes })}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</TableCell>
									<TableCell className='py-4 pr-4'>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger className={`cursor-pointer font-medium ${getWinRateColor(delegate.voteStats.winRate)}`}>
													{delegate.voteStats.winRate.toFixed(2)} %
												</TooltipTrigger>
												<TooltipContent className='bg-tooltip_background text-btn_primary_text'>
													<p>{t('WonParticipated', { participated: delegate.voteStats.finalVotesCount, won: delegate.voteStats.winCount })}</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</TableCell>
								</TableRow>
							);
						})}
			</TableBody>
		</Table>
	);
}

export default DelegatesTable;
