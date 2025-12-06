// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '../types';

const KUSAMA_DAY = 2;
const POLKADOT_DAY = 5;

export const getNetworkFromDate = (publishedAt: string): ENetwork | null => {
	const date = new Date(publishedAt);
	const day = date.getUTCDay();
	return day === KUSAMA_DAY ? ENetwork.KUSAMA : day === POLKADOT_DAY ? ENetwork.POLKADOT : null;
};
