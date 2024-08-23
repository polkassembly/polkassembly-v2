// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { encodeAddress } from '@polkadot/util-crypto';

/**
 * Check if a string is a valid Substrate address
 *
 * @export
 * @param {string} address
 * @return {boolean}
 */
export function isValidSubstrateAddress(address: string): boolean {
	try {
		return Boolean(encodeAddress(address, 42));
	} catch (e) {
		return false;
	}
}
