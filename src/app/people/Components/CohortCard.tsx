// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import delegates from '@assets/delegation/delegates.svg';
import delegatees from '@assets/delegation/delegatees.svg';
import timer from '@assets/icons/timer.svg';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { IDVCohort, ECohortStatus, ENetwork } from '@/_shared/types';
import { formatDate } from '@/_shared/_utils/dvDelegateUtils';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';

interface CohortCardProps {
	cohort: IDVCohort | null;
	loading?: boolean;
	network: ENetwork;
}

function CohortCard({ cohort, loading, network }: CohortCardProps) {
	const t = useTranslations('DecentralizedVoices');
	const startDateTime = cohort?.startIndexer?.blockTime ? formatDate(new Date(cohort.startIndexer.blockTime)) : cohort?.startTime ? formatDate(cohort.startTime) : null;
	const endDateTime = cohort?.endIndexer?.blockTime ? formatDate(new Date(cohort.endIndexer.blockTime)) : cohort?.endTime ? formatDate(cohort.endTime) : null;
	const isOngoing = cohort?.status === ECohortStatus.ONGOING;

	if (loading || !cohort) {
		return (
			<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6'>
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
		);
	}

	return (
		<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6'>
			<div className='flex flex-wrap items-center justify-between gap-6'>
				<div className='flex items-start gap-4'>
					<Image
						src={delegatees}
						alt='Delegatees'
						className='h-10 w-10'
					/>
					<div>
						<p className='text-xs font-medium uppercase text-community_text'>{t('TotalDAOs').toUpperCase()}</p>
						<p className='text-2xl font-semibold text-text_primary'>{cohort.delegatesCount}</p>
						<p className='text-xs text-wallet_btn_text'>
							{cohort.guardiansCount > 0
								? `${formatUSDWithUnits(
										formatBnBalance(String(cohort.delegationPerDelegate || 0), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network)
									)}${t('DelegationsEach')}`
								: 'N/A'}{' '}
						</p>
					</div>
				</div>

				{cohort.guardiansCount > 0 && (
					<div className='flex items-start gap-4'>
						<Image
							src={delegates}
							alt='Delegates'
							className='h-10 w-10'
						/>
						<div>
							<p className='text-xs font-medium uppercase text-community_text'>{t('Guardians').toUpperCase()}</p>
							<p className='text-2xl font-semibold text-text_primary'>{cohort.guardiansCount}</p>
							<p className='text-xs text-wallet_btn_text'>
								{cohort.guardiansCount > 0
									? `${formatUSDWithUnits(
											formatBnBalance(String(cohort.delegationPerGuardian || 0), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network)
										)}${t('DelegationsEach')}`
									: 'N/A'}
							</p>
						</div>
					</div>
				)}

				<div className='flex items-start gap-4'>
					<Image
						src={timer}
						alt='Timer'
						className='h-10 w-10'
					/>
					<div>
						<p className='text-xs font-medium uppercase text-community_text'>{t('StartTime').toUpperCase()}</p>
						<p className='text-lg font-semibold text-text_primary'>
							{startDateTime?.date} <span className='text-wallet_btn_text'>{startDateTime?.time}</span>
						</p>
						<p className='text-xs text-wallet_btn_text'>#{cohort.startIndexer?.blockHeight.toLocaleString() || cohort.startBlock?.toLocaleString() || 'N/A'}</p>
					</div>
				</div>

				{!isOngoing && (endDateTime || cohort.endIndexer) && (
					<div className='flex items-start gap-4'>
						<Image
							src={timer}
							alt='Timer'
							className='h-10 w-10'
						/>
						<div>
							<p className='text-xs font-medium uppercase text-community_text'>{t('EndTime').toUpperCase()}</p>
							<p className='whitespace-nowrap text-lg font-semibold text-text_primary'>
								{endDateTime?.date} <span className='text-wallet_btn_text'>{endDateTime?.time}</span>
							</p>
							<p className='text-xs text-wallet_btn_text'>#{cohort.endIndexer?.blockHeight.toLocaleString() || cohort.endBlock?.toLocaleString() || 'N/A'}</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default CohortCard;
