// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from './types';

export const TREASURY_STATS_NETWORKS = [ENetwork.POLKADOT, ENetwork.KUSAMA];
export const CACHE_REFRESH_NETWORKS = [ENetwork.POLKADOT, ENetwork.KUSAMA];

export const ERROR_MESSAGES = {
	TOOLS_PASSPHRASE_NOT_DEFINED: 'TOOLS_PASSPHRASE is not defined in environment variables',
	INVALID_TOOLS_PASSPHRASE: 'Invalid tools password, please check the tools password in environment variables',
	TOOLS_PASSPHRASE_REQUIRED: 'Tools password is required'
};

export const ALGOLIA_MAX_RECORD_SIZE = 100000; // 100KB limit in bytes
