// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Card, CardContent } from '@ui/card';
import { MdInfoOutline } from 'react-icons/md';
import { Progress } from '@ui/progress';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';

function SpendPeriod({ tokenPrice }: { tokenPrice: { price: string } }) {
	const { apiService } = usePolkadotApiService();
	const network = getCurrentNetwork();
	const [loading, setLoading] = useState<boolean>(true);
	const [spendPeriod, setSpendPeriod] = useState<{ percentage: number; value: { days: number; hours: number; minutes: number; total: number } } | null>(null);
	const [nextBurn, setNextBurn] = useState<{ value: string; valueUSD: string } | null>(null);
	const [isNextBurnLoading, setIsNextBurnLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!apiService) return;
		(async () => {
			if (tokenPrice) {
				const burnResult = await apiService?.getNextBurnData({
					currentTokenPrice: tokenPrice ?? { price: '0' }
				});

				if (burnResult?.value) {
					setNextBurn({
						value: burnResult.value,
						valueUSD: burnResult.valueUSD || ''
					});
				} else {
					setNextBurn(null);
				}
			}
			setIsNextBurnLoading(false);
		})();
	}, [apiService, tokenPrice]);

	useEffect(() => {
		if (!apiService) return;
		(async () => {
			const data = await apiService?.getSpendPeriod();
			setSpendPeriod(data);
			setLoading(false);
		})();
	}, [apiService]);

	return (
		<Card className='border-none bg-bg_modal p-4 shadow-lg'>
			{loading ? (
				<div className='flex h-full items-center justify-center py-10'>
					<LoadingSpinner />
				</div>
			) : (
				<CardContent className='p-3'>
					<p className='text-sm text-wallet_btn_text'>
						Spend Period Remaining <MdInfoOutline className='inline-block text-lg' />
					</p>
					<p className='text-xs text-wallet_btn_text'>
						{spendPeriod?.value.days && spendPeriod?.value.days > 0 && (
							<>
								<span className='text-lg font-medium text-btn_secondary_text'>{spendPeriod?.value.days}</span> days
							</>
						)}
						{spendPeriod?.value.hours && spendPeriod?.value.hours > 0 && (
							<>
								<span className='ml-1 text-lg font-medium text-btn_secondary_text'>{spendPeriod?.value.hours}</span> hrs{' '}
							</>
						)}
						{spendPeriod?.value.minutes && spendPeriod?.value.minutes > 0 && (
							<>
								<span className='text-lg font-medium text-btn_secondary_text'>{spendPeriod?.value.minutes}</span> mins / {spendPeriod?.value.total} days
							</>
						)}
					</p>
					<div className='mt-2 flex items-center gap-2'>
						<Progress
							value={spendPeriod?.percentage}
							className='bg-progress_default'
							indicatorClassName='bg-text_pink'
						/>
						<p className='text-xs font-medium text-btn_secondary_text'>{spendPeriod?.percentage}%</p>
					</div>
					<hr className='my-3 border-border_grey' />
					<div className='flex items-center gap-3'>
						{isNextBurnLoading ? (
							<LoadingSpinner />
						) : (
							<div className='flex flex-col'>
								<p className='text-xs text-wallet_btn_text'>Next Burn</p>
								<div className='flex items-center gap-2'>
									<p className='whitespace-nowrap text-lg font-medium text-btn_secondary_text'>
										{nextBurn?.value} <span className='text-base text-input_text'>{NETWORKS_DETAILS[network as ENetwork].tokenSymbol}</span>
									</p>
									{nextBurn?.valueUSD && nextBurn.valueUSD !== '0' && nextBurn.valueUSD !== '' && (
										<p className='whitespace-nowrap text-xs font-medium text-input_text'>~ ${nextBurn?.valueUSD}</p>
									)}
								</div>
							</div>
						)}
						<div className='rounded-md bg-info_card_bg p-2'>
							<p className='text-xs'>If the Treasury ends a spend period without spending all of its funds, it suffers a burn of a percentage of its funds.</p>
						</div>
					</div>
				</CardContent>
			)}
		</Card>
	);
}

export default SpendPeriod;
