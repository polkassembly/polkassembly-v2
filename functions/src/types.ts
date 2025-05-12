// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export enum ENetwork {
	POLKADOT = 'polkadot',
	KUSAMA = 'kusama'
}

export enum EWebhookEvent {
	CACHE_REFRESH = 'cache_refresh'
}

export enum EHttpHeaderKey {
	SKIP_CACHE = 'x-skip-cache',
	TOOLS_PASSPHRASE = 'x-tools-passphrase',
	NETWORK = 'x-network'
}
