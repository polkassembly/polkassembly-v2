// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '../types';

export const getNetworkUrl = (network: ENetwork, path: string) => {
	const validNetworks = [ENetwork.POLKADOT, ENetwork.KUSAMA];
	const networkSlug = validNetworks.includes(network) ? network : ENetwork.POLKADOT;
	return `https://${networkSlug}.polkassembly.io${path}`;
};
