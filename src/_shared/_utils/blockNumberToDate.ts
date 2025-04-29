// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from '@polkadot/util';
import { ENetwork } from '../types';
import { NETWORKS_DETAILS } from '../_constants/networks';
import { dayjs } from './dayjsInit';

export function blockNumberToDate({ currentBlockNumber, targetBlockNumber, network }: { currentBlockNumber: BN; targetBlockNumber: BN; network: ENetwork }) {
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
