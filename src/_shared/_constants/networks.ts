// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork } from '@shared/types';

export const NETWORKS_DETAILS = {
	[ENetwork.ROCOCO]: {
		disabled: false,
		key: ENetwork.ROCOCO,
		name: 'Rococo',
		blockTime: 6000,
		ss58Format: 42,
		subsquidUrl: 'https://squid.subsquid.io/rococo-polkassembly/graphql',
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
	},
	[ENetwork.POLKADOT]: {
		disabled: false,
		key: ENetwork.POLKADOT,
		name: 'Polkadot',
		blockTime: 6000,
		ss58Format: 0,
		subsquidUrl: 'https://squid.subsquid.io/polkadot-polkassembly/graphql',
		tokenDecimals: 10,
		tokenSymbol: 'DOT',
		blockExplorerUrl: 'https://polkadot.api.subscan.io',
		rpcEndpoints: [
			{
				name: 'via Parity',
				url: 'wss://rpc.polkadot.io'
			}
		],
		chainId: 'polkadot:91b171bb158e2d3848fa23a9f1c25182'
	}
};
