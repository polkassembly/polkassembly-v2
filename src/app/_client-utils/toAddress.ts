// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { hexToU8a, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress, ethereumEncode } from '@polkadot/util-crypto';

export function toAddress({ value, allowIndices, bytesLength }: { value?: string | Uint8Array | null; allowIndices?: boolean; bytesLength?: 20 | 32 }): string | undefined {
	if (value) {
		try {
			const u8a = isHex(value) ? hexToU8a(value) : decodeAddress(value);

			if (!allowIndices && u8a.length !== 32 && u8a.length !== 20) {
				throw new Error('AccountIndex values not allowed');
			} else if (bytesLength && u8a.length !== bytesLength) {
				throw new Error('Invalid key length');
			}

			if (u8a.length === 20) {
				return ethereumEncode(u8a);
			}
			return encodeAddress(u8a);
		} catch {
			return undefined;
		}
	}

	return undefined;
}
