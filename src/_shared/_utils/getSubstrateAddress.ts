// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { encodeAddress } from '@polkadot/util-crypto';

/**
 * Return an address encoded in the substrate format
 * Returns null if invalid address (e.g. Ethereum address)
 *
 * @param address An address string
 */
export function getSubstrateAddress(address: string): string | null {
	try {
		if (!address || address.startsWith('0x')) {
			return null;
		}

		return encodeAddress(address, 42);
	} catch {
		return null;
	}
}
