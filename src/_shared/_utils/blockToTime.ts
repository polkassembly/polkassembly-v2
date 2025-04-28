// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { BN } from '@polkadot/util';
import { NETWORKS_DETAILS } from '../_constants/networks';
import { ENetwork } from '../types';

export function blockToDays({ blocks, network }: { blocks: BN | number; network: ENetwork }): number {
	const networkDetails = NETWORKS_DETAILS?.[`${network}`];
	const blocktime = networkDetails?.blockTime ? networkDetails.blockTime / 1000 : 0;

	// Convert BN to number if needed
	const blocksAsNumber = typeof blocks !== 'number' ? Number(blocks) : blocks;

	let time = (blocksAsNumber * blocktime) / (3600 * 24);
	time = time >= 1 ? Math.floor(time) : Math.round((time + Number.EPSILON) * 100) / 100;

	return time;
}
