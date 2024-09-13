// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { u8aToHex } from '@polkadot/util';
import { cryptoWaitReady, decodeAddress } from '@polkadot/util-crypto';

export async function getSubstrateAddressPublicKey(address: string): Promise<string> {
	await cryptoWaitReady();
	const publicKey = decodeAddress(address);

	return u8aToHex(publicKey);
}
