// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IVaultQrState } from '@/_shared/types';
import type { Signer, SignerResult } from '@polkadot/api/types';
import type { Registry, SignerPayloadJSON } from '@polkadot/types/types';
import { blake2AsU8a } from '@polkadot/util-crypto';

// eslint-disable-next-line import/prefer-default-export
export class VaultQrSigner implements Signer {
	readonly #registry: Registry;

	readonly #setState: (state: IVaultQrState) => void;

	constructor(registry: Registry, setState: (state: IVaultQrState) => void) {
		this.#registry = registry;
		this.#setState = setState;
	}

	public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
		return new Promise((resolve, reject): void => {
			// limit size of the transaction
			const isQrHashed = payload.method.length > 5000;
			const wrapper = this.#registry.createType('ExtrinsicPayload', payload, { version: payload.version });
			const qrPayload = isQrHashed ? blake2AsU8a(wrapper.toU8a(true)) : wrapper.toU8a();

			this.#setState({
				open: true,
				isQrHashed,
				qrAddress: payload.address,
				qrPayload,
				qrReject: reject,
				qrResolve: resolve
			});
		});
	}
}
