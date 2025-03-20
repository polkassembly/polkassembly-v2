// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '@shared/types';
import { NETWORKS_DETAILS } from '@shared/_constants/networks';

interface BlockToDaysParams {
	blocks: number;
	network: ENetwork;
}

interface BlockToTimeParams {
	blocks: number;
	network: ENetwork;
}

export const blockToDays = ({ blocks, network }: BlockToDaysParams): number => {
	const { blockTime } = NETWORKS_DETAILS[network];
	const timeInMs = blocks * blockTime;
	return Math.ceil(timeInMs / (1000 * 60 * 60 * 24));
};

export const blockToTime = ({ blocks, network }: BlockToTimeParams) => {
	const { blockTime } = NETWORKS_DETAILS[network];
	const timeInMs = blocks * blockTime;
	return { time: timeInMs };
};

export const convertMillisecondsToDaysHoursMinutes = (timeInMs: number) => {
	const days = Math.floor(timeInMs / (24 * 60 * 60 * 1000));
	const hours = Math.floor((timeInMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
	const minutes = Math.floor((timeInMs % (60 * 60 * 1000)) / (60 * 1000));
	return { d: days, h: hours, m: minutes };
};
