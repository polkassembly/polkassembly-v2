// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '@shared/types';

export const blockToDays = (blocks: number, network: ENetwork, blockTime = 6000): number => {
	const timeInMs = blocks * blockTime;
	return Math.ceil(timeInMs / (1000 * 60 * 60 * 24));
};

export const blockToTime = (blocks: number, network: ENetwork, blockTime = 6000) => {
	const timeInMs = blocks * blockTime;
	return { time: timeInMs };
};

export const getDaysTimeObj = (timeInMs: number) => {
	const days = Math.floor(timeInMs / (24 * 60 * 60 * 1000));
	const hours = Math.floor((timeInMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
	const minutes = Math.floor((timeInMs % (60 * 60 * 1000)) / (60 * 1000));
	return { d: days, h: hours, m: minutes };
};
