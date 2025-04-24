// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { MdInfoOutline } from 'react-icons/md';
import { Progress } from '@ui/Progress/Progress';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useMemo } from 'react';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { dayjs } from '@shared/_utils/dayjsInit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import styles from './SpendPeriod.module.scss';

function SpendPeriod() {
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();

	const t = useTranslations('Overview');

	const { data: burnData, isFetching: burnDataLoading } = useQuery({
		queryKey: ['burnData'],
		queryFn: () => apiService?.getNextBurnData(),
		enabled: !!apiService,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const { data: spendPeriodData, isFetching: spendPeriodLoading } = useQuery({
		queryKey: ['spendPeriodData'],
		queryFn: () => apiService?.getSpendPeriod(),
		enabled: !!apiService,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const duration = useMemo(() => dayjs.duration(spendPeriodData?.value.remainingTime || 0), [spendPeriodData]);
	const days = duration.days();
	const hours = duration.hours();

	const progressPercentage = useMemo(() => spendPeriodData?.percentage || 0, [spendPeriodData]);

	return (
		<div className={cn(styles.container, 'relative bg-bg_modal')}>
			{spendPeriodLoading && <LoadingLayover />}
			<div className='p-3'>
				<p className='flex items-center gap-x-2 text-sm text-wallet_btn_text'>
					{t('spendPeriodRemaining')}{' '}
					<Tooltip>
						<TooltipTrigger asChild>
							<MdInfoOutline className='inline-block text-lg' />
						</TooltipTrigger>
						<TooltipContent className='bg-social_tooltip_background text-btn_primary_text'>{t('spendPeriodRemainingInfo')}</TooltipContent>
					</Tooltip>
				</p>

				{spendPeriodData ? (
					<>
						<p className='text-xs text-wallet_btn_text'>
							{days > 0 && (
								<>
									<span className={styles.spend_period_remaining}>{days}</span> {t('days')}{' '}
								</>
							)}
							{hours > 0 && (
								<>
									<span className={styles.spend_period_remaining_hr}>{hours}</span> {t('hours')}{' '}
								</>
							)}
							/ {spendPeriodData.value.totalSpendPeriodDays} {t('days')}
						</p>
						<div className='mt-2 flex items-center gap-2'>
							<Progress
								value={progressPercentage}
								className='bg-progress_default'
								indicatorClassName='bg-text_pink'
							/>
							<p className='text-xs font-medium text-btn_secondary_text'>{progressPercentage}%</p>
						</div>
					</>
				) : (
					<div className='mt-2'>
						<p className='text-xs text-wallet_btn_text'>{t('unavailable')}</p>
						<p className='text-error_red text-xs'>{t('blockDataUnavailable')}</p>
					</div>
				)}

				<hr className='my-3 border-border_grey' />
				<div className='flex items-center gap-3'>
					{burnDataLoading ? (
						<Skeleton className='h-4 w-full' />
					) : burnData ? (
						<div className='flex flex-col'>
							<p className='text-xs text-wallet_btn_text'>{t('nextBurn')}</p>
							<div className='flex items-center gap-2'>
								<p className={styles.next_burn}>
									{formatBnBalance(burnData, { withThousandDelimitor: false, compactNotation: true, numberAfterComma: 2 }, network)}{' '}
									<span className='text-base text-input_text'>{NETWORKS_DETAILS[`${network}`].tokenSymbol}</span>
								</p>
								{/* {showValueUSD && <p className={styles.next_burn_usd}>~ ${nextBurn.valueUSD}</p>} */}
							</div>
						</div>
					) : (
						<div className='flex flex-col'>
							<p className='text-xs text-wallet_btn_text'>{t('nextBurn')}</p>
							<p className='text-xs text-wallet_btn_text'>{t('unavailable')}</p>
						</div>
					)}
					<div className='rounded-md bg-info_card_bg p-2'>
						<p className='text-xs'>{t('nextBurnInfo')}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SpendPeriod;
