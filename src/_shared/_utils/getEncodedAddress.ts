// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { encodeAddress } from '@polkadot/util-crypto';
import { NETWORKS_DETAILS } from '../_constants/networks';
import { ENetwork } from '../types';

/**
 * Return an address encoded for the current network
 *
 * @param address An address
 *
 */

export function getEncodedAddress(address: string, network: ENetwork): string | null {
	if (!network || !(network in NETWORKS_DETAILS) || !address) {
		return null;
	}

	const ss58Format = NETWORKS_DETAILS[network as ENetwork]?.ss58Format;

	if (ss58Format === undefined) {
		return null;
	}

	if (address.startsWith('0x')) return address;

	try {
		return encodeAddress(address, ss58Format);
	} catch {
		return null;
	}
}
