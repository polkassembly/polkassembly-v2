// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { dayjs } from './dayjsInit';

const DATE_FORMAT = "DD MMM 'YY";

function secondsToDhm(inputSeconds: number) {
	const seconds = Number(inputSeconds);
	const d = Math.floor(seconds / (3600 * 24));
	const h = Math.floor((seconds % (3600 * 24)) / 3600);
	const m = seconds < 60 ? 1 : Math.floor((seconds % 3600) / 60);

	const dDisplay = d === 0 ? '' : `${d}d `;
	const hDisplay = `${h}h `;
	const mDisplay = `${m}m`;

	return dDisplay + hDisplay + mDisplay;
}

/**
 * Convert blocks to time duration string
 * @param blocks - Number of blocks (BN or number)
 * @param network - Network to get block time from
 * @param blocktime - Optional custom block time in ms
 * @returns Object with formatted time string and total seconds
 */
export function blockToTime(blocks: BN | number, network: ENetwork, blocktime?: number): { time: string; seconds: number } {
	const networkBlockTime = NETWORKS_DETAILS[network]?.blockTime;
	const finalBlockTime = blocktime ? blocktime / 1000 : (networkBlockTime || 6000) / 1000;

	// bn.js toNumber() was crashing
	const blockCount = typeof blocks !== 'number' ? Number(blocks) : blocks;
	const totalSeconds = blockCount * finalBlockTime;
	const time = secondsToDhm(totalSeconds);

	return { seconds: totalSeconds, time };
}

/**
 * Get current block-based date for a historical block
 * This version fetches current block automatically if not provided
 * @param targetBlock - The target block number
 * @param network - Network to get block time from
 * @param currentBlock - Optional current block number (will fetch if not provided)
 * @returns Formatted date string
 */
export async function getDateFromBlock(targetBlock: BN | number, network: ENetwork, currentBlock?: BN | number): Promise<string> {
	const targetBlockNum = typeof targetBlock === 'number' ? targetBlock : Number(targetBlock);

	let currentBlockNum: number;
	if (currentBlock !== undefined) {
		currentBlockNum = typeof currentBlock === 'number' ? currentBlock : Number(currentBlock);
	} else {
		// Import and use API service to get current block
		const { PolkadotApiService } = await import('@/app/_client-services/polkadot_api_service');
		const apiService = await PolkadotApiService.Init(network);
		currentBlockNum = await apiService.getBlockHeight();
		await apiService.disconnect();
	}

	const blockDiff = targetBlockNum - currentBlockNum;
	const { seconds } = blockToTime(Math.abs(blockDiff), network);

	const now = dayjs();
	const targetDate = blockDiff >= 0 ? now.add(seconds, 'seconds') : now.subtract(seconds, 'seconds');

	return targetDate.format(DATE_FORMAT);
}
