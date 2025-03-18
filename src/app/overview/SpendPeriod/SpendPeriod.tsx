// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MdInfoOutline } from 'react-icons/md';
import { Progress } from '@ui/progress';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@ui/LoadingSpinner';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import styles from './SpendPeriod.module.scss';

function SpendPeriod({ tokenPrice }: { tokenPrice: { price: string | undefined } }) {
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const [loading, setLoading] = useState<boolean>(true);
	const [spendPeriod, setSpendPeriod] = useState<{ percentage: number; value: { days: number; hours: number; minutes: number; total: number } } | null>(null);
	const [nextBurn, setNextBurn] = useState<{ value: string; valueUSD: string } | null>(null);
	const [isNextBurnLoading, setIsNextBurnLoading] = useState<boolean>(true);
	const t = useTranslations('Overview');

	useEffect(() => {
		if (!apiService) return;
		(async () => {
			try {
				const burnResult = await apiService.getNextBurnData({
					currentTokenPrice: tokenPrice
				});

				if (burnResult?.value) {
					setNextBurn({
						value: burnResult.value,
						valueUSD: burnResult.valueUSD || ''
					});
				} else {
					setNextBurn(null);
				}
			} catch (error) {
				console.error('Error fetching burn data:', error);
				setNextBurn(null);
			} finally {
				setIsNextBurnLoading(false);
			}
		})();
	}, [apiService, tokenPrice]);

	useEffect(() => {
		if (!apiService) return;
		(async () => {
			try {
				const data = await apiService?.getSpendPeriod();
				setSpendPeriod(data);
			} catch (error) {
				console.error('Error fetching spend period:', error);
				setSpendPeriod(null);
			} finally {
				setLoading(false);
			}
		})();
	}, [apiService]);

	const showDays = spendPeriod?.value?.days !== undefined;
	const showHours = spendPeriod?.value?.hours !== undefined;
	const showMinutes = spendPeriod?.value?.minutes !== undefined;
	const showValueUSD = nextBurn?.valueUSD && nextBurn.valueUSD !== '0' && nextBurn.valueUSD !== '';

	const progressPercentage = spendPeriod?.percentage || 0;
	const hasSpendPeriodData = spendPeriod && (showDays || showHours || showMinutes);

	return (
		<div className={cn(styles.container, 'bg-bg_modal')}>
			{loading ? (
				<div className={styles.loading}>
					<LoadingSpinner />
				</div>
			) : (
				<div className='p-3'>
					<p className='text-sm text-wallet_btn_text'>
						{t('spendPeriodRemaining')} <MdInfoOutline className='inline-block text-lg' />
					</p>

					{hasSpendPeriodData ? (
						<>
							<p className='text-xs text-wallet_btn_text'>
								{showDays && (
									<>
										<span className={styles.spend_period_remaining}>{spendPeriod.value.days}</span> days{' '}
									</>
								)}
								{showHours && (
									<>
										<span className={styles.spend_period_remaining_hr}>{spendPeriod.value.hours}</span> hrs{' '}
									</>
								)}
								{showMinutes && (
									<>
										<span className={styles.spend_period_remaining}>{spendPeriod.value.minutes}</span> mins / {spendPeriod.value.total} days
									</>
								)}
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
						<p className='text-xs text-wallet_btn_text'>{t('unavailable')}</p>
					)}

					<hr className='my-3 border-border_grey' />
					<div className='flex items-center gap-3'>
						{isNextBurnLoading ? (
							<LoadingSpinner />
						) : nextBurn ? (
							<div className='flex flex-col'>
								<p className='text-xs text-wallet_btn_text'>{t('nextBurn')}</p>
								<div className='flex items-center gap-2'>
									<p className={styles.next_burn}>
										{nextBurn.value} <span className='text-base text-input_text'>{NETWORKS_DETAILS[network as ENetwork].tokenSymbol}</span>
									</p>
									{showValueUSD && <p className={styles.next_burn_usd}>~ ${nextBurn.valueUSD}</p>}
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
			)}
		</div>
	);
}

export default SpendPeriod;
