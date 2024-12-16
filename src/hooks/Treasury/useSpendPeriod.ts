// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useEffect, useState } from 'react';
import { usePolkadotApi } from '@/app/_atoms/polkadotJsApiAtom';
import { ENetwork } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { PolkadotApiService } from '@/app/_client-services/polkadot_api_service';
import BN from 'bn.js';
import blockToDays from '@/lib/utils/blockToDays';
import blockToTime from '@/lib/utils/blockToTime';
import getDaysTimeObj from '@/lib/utils/getDaysTimeObj';

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
const ZERO_BN = new BN(0);
export const useSpendPeriod = () => {
	const api: PolkadotApiService = usePolkadotApi(ENetwork.ROCOCO);
	const blockTime = NETWORKS_DETAILS?.[ENetwork.ROCOCO]?.blockTime;
	const [spendPeriod, setSpendPeriod] = useState<SpendPeriodState>(INITIAL_SPEND_PERIOD_STATE);

	useEffect(() => {
		if (!api) {
			return;
		}

		setSpendPeriod(INITIAL_SPEND_PERIOD_STATE);

		api?.derive?.chain
			.bestNumber((currentBlock) => {
				const spendPeriodConst = api?.consts?.treasury ? api.consts?.treasury?.spendPeriod : ZERO_BN;

				if (spendPeriodConst) {
					const spendPeriodBlocks = spendPeriodConst.toNumber();
					const totalSpendPeriod = blockToDays(spendPeriodBlocks, ENetwork.ROCOCO, blockTime);
					const goneBlocks = currentBlock.toNumber() % spendPeriodBlocks;
					const { time } = blockToTime(spendPeriodBlocks - goneBlocks, ENetwork.ROCOCO, blockTime);
					const { d, h, m } = getDaysTimeObj(time);
					const percentage = ((goneBlocks / spendPeriodBlocks) * 100).toFixed(0);

					setSpendPeriod({
						isLoading: false,
						percentage: parseFloat(percentage),
						value: {
							days: d,
							hours: h,
							minutes: m,
							total: totalSpendPeriod
						}
					});
				}
			})
			.catch(() => {
				setSpendPeriod(INITIAL_SPEND_PERIOD_STATE);
			});
	}, [api, blockTime, ENetwork.ROCOCO]);

	return spendPeriod;
};
