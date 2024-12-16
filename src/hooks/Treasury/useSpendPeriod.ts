// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useEffect, useState } from 'react';
import { PolkadotApiService } from '@/app/_client-services/polkadot_api_service';
import { ENetwork } from '@/_shared/types';
import blockToDays from '@/lib/utils/blockToDays';
import blockToTime from '@/lib/utils/blockToTime';
import getDaysTimeObj from '@/lib/utils/getDaysTimeObj';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { usePolkadotApi } from '@/app/_atoms/polkadotJsApiAtom';

interface SpendPeriodState {
	isLoading: boolean;
	percentage: number;
	value: {
		days: number;
		hours: number;
		minutes: number;
		total: number;
	};
}

const INITIAL_SPEND_PERIOD_STATE: SpendPeriodState = {
	isLoading: true,
	percentage: 0,
	value: {
		days: 0,
		hours: 0,
		minutes: 0,
		total: 0
	}
};

export const useSpendPeriod = (network: ENetwork) => {
	const [spendPeriod, setSpendPeriod] = useState<SpendPeriodState>(INITIAL_SPEND_PERIOD_STATE);

	const apiService: PolkadotApiService | null = usePolkadotApi(network);

	useEffect(() => {
		if (!apiService) return;

		const fetchSpendPeriod = async () => {
			try {
				const blockTime = NETWORKS_DETAILS[network]?.blockTime;
				if (!blockTime) {
					throw new Error('Block time not defined for this network');
				}

				const [currentBlock, { spendPeriodBlocks }] = await Promise.all([apiService.getBlockHeight(), apiService.getSpendPeriodConst()]);

				const totalSpendPeriod = blockToDays(spendPeriodBlocks, network, blockTime);
				const goneBlocks = currentBlock % spendPeriodBlocks;

				const { time } = blockToTime(spendPeriodBlocks - goneBlocks, network, blockTime);
				const { d, h, m } = getDaysTimeObj(time);

				const percentage = (goneBlocks / spendPeriodBlocks) * 100;

				setSpendPeriod({
					isLoading: false,
					percentage,
					value: {
						days: d,
						hours: h,
						minutes: m,
						total: totalSpendPeriod
					}
				});
			} catch (error) {
				console.error('Error fetching spend period:', error);
				setSpendPeriod(INITIAL_SPEND_PERIOD_STATE);
			}
		};

		fetchSpendPeriod();
	}, [apiService, network]);

	return spendPeriod;
};
