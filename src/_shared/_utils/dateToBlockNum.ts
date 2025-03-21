// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { dayjs } from '@shared/_utils/dayjsInit';
import { NETWORKS_DETAILS } from '../_constants/networks';
import { ENetwork } from '../types';

interface Args {
	network: ENetwork;
	currentBlockNumber: number;
	date: Date;
}

const dateToBlockNum = ({ network, currentBlockNumber, date }: Args) => {
	if (!currentBlockNumber || !date || !network) return null;
	const { blockTime } = NETWORKS_DETAILS[network];
	const blockTimeSeconds: number = blockTime / 1000;

	if (isNaN(blockTimeSeconds)) return null;

	const selectedTime: Date = dayjs(date).toDate();
	const now = dayjs();
	const midnight: Date = dayjs(selectedTime).startOf('day').toDate();

	const diff: number = now.diff(midnight, 'seconds');
	const block = currentBlockNumber - Math.floor(diff / blockTimeSeconds);

	return block || null;
};

export { dateToBlockNum };
