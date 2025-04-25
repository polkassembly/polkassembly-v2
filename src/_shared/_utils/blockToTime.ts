// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { BN } from '@polkadot/util';
import { dayjs } from '@shared/_utils/dayjsInit';
import { NETWORKS_DETAILS } from '../_constants/networks';
import { ENetwork } from '../types';

function secondsToDhm(seconds: number): string {
	const duration = dayjs.duration(seconds, 'seconds');
	const days = Math.floor(duration.asDays());
	const hours = duration.hours();
	const minutes = seconds < 60 ? 1 : duration.minutes();

	const dDisplay = days === 0 ? '' : `${days}d `;
	const hDisplay = `${hours}h `;
	const mDisplay = `${minutes}m`;

	return dDisplay + hDisplay + mDisplay;
}

export function blockToTime(blocksInput: BN | number, network: string, blocktimeInput?: number): { time: string; seconds: number } {
	const networkDetails = NETWORKS_DETAILS[network as ENetwork];
	const computedBlocktime = blocktimeInput !== undefined ? blocktimeInput / 1000 : (networkDetails?.blockTime ?? 0) / 1000;

	const blocksNumber = typeof blocksInput !== 'number' ? Number(blocksInput) : blocksInput;
	const seconds = blocksNumber * computedBlocktime;
	const time = secondsToDhm(seconds);

	return { seconds, time };
}
