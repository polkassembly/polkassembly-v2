// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getVoteBarColor, getVoteColor, getVoteIcon } from '@/_shared/_utils/dvVoteHelpers';

import { IDVDelegateVotingMatrix, EVoteDecision } from '@/_shared/types';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Skeleton } from '@/app/_shared-components/Skeleton';

interface VoteCompactViewProps {
	votingMatrix: IDVDelegateVotingMatrix[];
	referendumIndices: number[];
	loading?: boolean;
}

function VoteCompactView({ votingMatrix, referendumIndices, loading }: VoteCompactViewProps) {
	const t = useTranslations('DecentralizedVoices');
	const [expandedRows, setExpandedRows] = useState<string[]>(votingMatrix.length > 0 ? [votingMatrix[0].address] : []);

	const toggleRow = (address: string) => {
		setExpandedRows((prev) => (prev.includes(address) ? prev.filter((rowAddr) => rowAddr !== address) : [...prev, address]));
	};

	if (loading) {
		return (
			<div className='grid grid-cols-1 gap-4 pt-2'>
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className='rounded-xl border border-border_grey bg-bg_modal p-4'
					>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<Skeleton className='h-8 w-8 rounded-full' />
								<div className='space-y-2'>
									<Skeleton className='h-4 w-32' />
									<Skeleton className='h-3 w-24' />
								</div>
							</div>
							<Skeleton className='h-5 w-5' />
						</div>
						<div className='mt-4 grid grid-cols-3 gap-4 rounded-lg bg-bg_modal/70 p-4'>
							<div className='space-y-2'>
								<Skeleton className='h-3 w-16' />
								<Skeleton className='h-6 w-12' />
							</div>
							<div className='space-y-2'>
								<Skeleton className='h-3 w-16' />
								<Skeleton className='h-6 w-12' />
							</div>
							<div className='space-y-2'>
								<Skeleton className='h-3 w-16' />
								<Skeleton className='h-6 w-12' />
							</div>
						</div>
						<Skeleton className='mt-4 h-2 w-full rounded-full' />
					</div>
				))}
			</div>
		);
	}

	return (
		<div className='grid grid-cols-1 gap-4 pt-2'>
			{votingMatrix.map((item) => (
				<div
					key={item.address}
					className='rounded-xl border border-border_grey bg-bg_modal px-4 py-2'
				>
					<div
						className='flex cursor-pointer items-center justify-between'
						onClick={() => toggleRow(item.address)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								toggleRow(item.address);
							}
						}}
						role='button'
						tabIndex={0}
					>
						<div className='flex w-full items-center justify-between gap-3'>
							<div className='flex flex-col items-center gap-3 lg:flex-row'>
								<Address address={item.address} />
								<div>
									<p className='text-xs text-text_primary'>
										{item.activeCount} {t('Of')} {item.totalRefs} {t('Referendums')}
									</p>
								</div>
							</div>
							<div className='hidden grid-cols-2 gap-4 rounded-lg bg-bg_modal/70 p-4 lg:grid lg:grid-cols-3'>
								<div>
									<p className='text-xs text-text_primary'>{t('Participation')}</p>
									<p className='text-lg font-bold text-text_primary'>{item.participation.toFixed(1)}%</p>
								</div>
								<div>
									<p className='text-xs text-text_primary'>{t('AyeRate')}</p>
									<p className='text-lg font-bold text-aye_color'>{item.ayeRate.toFixed(1)}%</p>
								</div>
								<div>
									<p className='text-xs text-text_primary'>{t('Total')}</p>
									<p className='text-lg font-bold text-abstain_color'>{item.activeCount}</p>
								</div>
							</div>
						</div>
						<div className='text-text_primary'>{expandedRows.includes(item.address) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
					</div>

					<div className='mt-4 grid grid-cols-2 gap-4 rounded-lg bg-bg_modal/70 p-4 lg:hidden lg:grid-cols-3'>
						<div>
							<p className='text-xs text-text_primary'>{t('Participation')}</p>
							<p className='text-lg font-bold text-text_primary'>{item.participation.toFixed(1)}%</p>
						</div>
						<div>
							<p className='text-xs text-text_primary'>{t('AyeRate')}</p>
							<p className='text-lg font-bold text-aye_color'>{item.ayeRate.toFixed(1)}%</p>
						</div>
						<div>
							<p className='text-xs text-text_primary'>{t('Total')}</p>
							<p className='text-lg font-bold text-abstain_color'>{item.activeCount}</p>
						</div>
					</div>

					{expandedRows.includes(item.address) ? (
						<div className='mb-3'>
							<div className='grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-8'>
								{referendumIndices.map((ref) => {
									const vote = item.votes[ref] || '';
									return (
										<div
											key={ref}
											className={`flex flex-col items-center justify-center rounded p-2 ${getVoteColor(vote)}`}
										>
											<div className='mb-1'>{getVoteIcon(vote)}</div>
											<span className='text-xs font-medium'>#{ref}</span>
											<span className='text-[10px] capitalize opacity-70'>
												{vote !== EVoteDecision.AYE && vote !== EVoteDecision.NAY && vote !== EVoteDecision.ABSTAIN ? t('NoVote') : vote}
											</span>
										</div>
									);
								})}
							</div>
							<div className='mt-3 flex h-2 w-full overflow-hidden rounded-full'>
								{referendumIndices.map((ref) => (
									<div
										key={ref}
										className={`flex-1 ${getVoteBarColor(item.votes[ref] || '')} border-r border-border_grey last:border-0`}
									/>
								))}
							</div>
						</div>
					) : (
						<div className='mt-3 flex h-2 w-full overflow-hidden rounded-full'>
							{referendumIndices.map((ref) => (
								<div
									key={ref}
									className={`flex-1 ${getVoteBarColor(item.votes[ref] || '')} border-r border-border_grey last:border-0`}
								/>
							))}
						</div>
					)}
				</div>
			))}
		</div>
	);
}

export default VoteCompactView;
