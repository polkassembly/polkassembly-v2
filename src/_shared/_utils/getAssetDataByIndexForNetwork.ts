// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '../_constants/networks';
import { ENetwork } from '../types';

// TODO: fetch this from pjs api if possible
export function getAssetDataByIndexForNetwork({ network, generalIndex }: { network: ENetwork; generalIndex: string }) {
	const networkDetails = NETWORKS_DETAILS[network as ENetwork];

	if (!networkDetails) {
		throw new Error(`Network ${network} not found`);
	}

	const asset = Object.values(networkDetails.supportedAssets).find((a) => a.index === generalIndex);

	if (!asset) {
		throw new Error(`Asset with general index ${generalIndex} not found for network ${network}`);
	}

	return asset;
}
