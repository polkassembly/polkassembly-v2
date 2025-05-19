// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { encodeAddress } from '@polkadot/util-crypto';

/**
 * Return an address encoded in the substrate format
 * Returns null if invalid address (e.g. Ethereum address)
 * Return substrate address for AccountId32 etc.
 *
 * @param address An address string
 */
export function getSubstrateAddressFromAccountId(address: string): string | null {
	try {
		if (!address) {
			return null;
		}

		return encodeAddress(address, 42);
	} catch {
		return null;
	}
}
