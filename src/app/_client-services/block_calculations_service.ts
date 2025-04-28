// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { BN } from '@polkadot/util';
import { dayjs } from '@shared/_utils/dayjsInit';

export class BlockCalculationsService {
	static getBlocksPerDay(network: ENetwork) {
		return (24 * 60 * 60 * 1000) / NETWORKS_DETAILS[`${network}`].blockTime;
	}

	static getBlocksFromTime({ network, time, blockHeight }: { network: ENetwork; time: Date; blockHeight?: BN }) {
		const blocksPerDay = this.getBlocksPerDay(network);
		const diffInBlocks = dayjs(time).diff(dayjs(), 'day') * blocksPerDay;
		return blockHeight ? blockHeight.add(new BN(diffInBlocks || 100)) : undefined;
	}

	// Returns the time in seconds from the block number and formats it into days, hours and minutes for display
	static getTimeFromBlocks({ network, blocks }: { network: ENetwork; blocks: BN | number }) {
		const { blockTime } = NETWORKS_DETAILS[`${network}`];
		const blockTimeInSeconds = blockTime / 1000;

		const blockNumber = Number(blocks);

		const totalSeconds = blockNumber * blockTimeInSeconds;

		const formattedDays = Math.floor(totalSeconds / (3600 * 24));
		const formattedHours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
		const formattedMinutes = totalSeconds < 60 ? 1 : Math.floor((totalSeconds % 3600) / 60);

		return {
			totalSeconds,
			formattedDays,
			formattedHours,
			formattedMinutes
		};
	}
}
