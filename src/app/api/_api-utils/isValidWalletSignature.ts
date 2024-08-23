// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { cryptoWaitReady, signatureVerify } from '@polkadot/util-crypto';
import { SIGN_MESSAGE } from '@shared/_constants/signMessage';
import { isValidSubstrateAddress } from '@shared/_utils/isValidSubstrateAddress';
import { recoverPersonalSignature } from 'eth-sig-util';

export async function isValidWalletSignature(address: string, signature: string) {
	// ETH
	if (address.startsWith('0x')) {
		const recovered = recoverPersonalSignature({
			data: SIGN_MESSAGE,
			sig: signature
		});

		return `${recovered}`.toLowerCase() === `${address}`.toLowerCase();
	}

	// Substrate
	if (isValidSubstrateAddress(address)) {
		await cryptoWaitReady();
		return signatureVerify(SIGN_MESSAGE, signature, address).isValid;
	}

	return false;
}
