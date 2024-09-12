// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '@shared/types';

export const networks = {
	[ENetwork.ROCOCO]: {
		disabled: false,
		key: ENetwork.ROCOCO,
		name: 'Rococo',
		blockTime: 6000,
		ss58Format: 42,
		subsquidUrl: '',
		tokenDecimals: 12,
		tokenSymbol: 'ROC',
		blockExplorerUrl: 'https://rococo.subscan.io/',
		rpcEndpoints: [
			{
				name: 'via Parity',
				url: 'wss://rococo-rpc.polkadot.io'
			}
		],
		chainId: 'polkadot:6408de7737c59c238890533af25896a2'
	}
};
