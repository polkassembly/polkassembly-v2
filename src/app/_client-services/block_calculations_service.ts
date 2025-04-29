// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { BN } from '@polkadot/util';
import { dayjs } from '@shared/_utils/dayjsInit';

export class BlockCalculationsService {
	// Returns the number of blocks per day for the given network
	static getBlocksPerDay(network: ENetwork) {
		return (24 * 60 * 60 * 1000) / NETWORKS_DETAILS[`${network}`].blockTime;
	}

	// Returns the block height for the given date
	static getBlockHeightForDateTime({ network, time, blockHeight }: { network: ENetwork; time: Date; blockHeight: BN }) {
		const blocksPerDay = this.getBlocksPerDay(network);
		const diffInBlocks = dayjs(time).diff(dayjs(), 'day') * blocksPerDay;
		return blockHeight ? blockHeight.add(new BN(diffInBlocks || 100)) : undefined;
	}

	// Returns the time in seconds required for the number of blocks passed. example: 100 blocks = 100 * 6 seconds = 600 seconds
	static getTimeForBlocks({ network, blocks }: { network: ENetwork; blocks: BN | number }) {
		const { blockTime } = NETWORKS_DETAILS[`${network}`];
		const blockTimeInSeconds = blockTime / 1000;

		const blockNumber = Number(blocks);

		const totalSeconds = blockNumber * blockTimeInSeconds;

		return {
			totalSeconds
		};
	}

	// TODO: Add a function to get the date for the given block number
}
