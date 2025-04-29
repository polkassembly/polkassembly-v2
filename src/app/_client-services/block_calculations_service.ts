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
	static getBlockHeightForDateTime({ network, time, currentBlockHeight }: { network: ENetwork; time: Date; currentBlockHeight: BN }) {
		const blocksPerDay = this.getBlocksPerDay(network);
		const diffInBlocks = dayjs(time).diff(dayjs(), 'day') * blocksPerDay;
		// TODO: calculate using genesis block so that block height is not required
		return currentBlockHeight ? currentBlockHeight.add(new BN(diffInBlocks || 100)) : undefined;
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

	// Returns the date for the given block number
	static getDateFromBlockNumber({ currentBlockNumber, targetBlockNumber, network }: { currentBlockNumber: BN; targetBlockNumber: BN; network: ENetwork }) {
		// Get current date/time
		const now = new Date();

		// Get block time in milliseconds for this network
		const blockTimeMs = NETWORKS_DETAILS[network as ENetwork].blockTime;

		// Calculate block difference
		const blockDiff = targetBlockNumber.sub(currentBlockNumber);

		// Calculate time difference in milliseconds
		const timeDiffMs = blockDiff.muln(blockTimeMs).toNumber();

		// Add time difference to current time to get target date
		return dayjs(now).add(timeDiffMs, 'milliseconds').toDate();
	}
}
