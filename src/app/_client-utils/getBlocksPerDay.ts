// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ENetwork } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

export const getBlocksPerDay = (network: ENetwork) => {
	return (24 * 60 * 60 * 1000) / NETWORKS_DETAILS[`${network}`].blockTime;
};
