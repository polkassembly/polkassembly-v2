// Copyright 2019-2025 @polkassembly/fellowship authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { encodeAddress } from '@polkadot/util-crypto';

/**
 * Return an address encoded in the sbstrate format
 * Returns null if invalid address (e.g. Ethereum address)
 *
 * @param address An address string
 */
export default function getSubstrateAddress(address: string): string | null {
	try {
		return encodeAddress(address, 42);
	} catch (e) {
		return null;
	}
}
