// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from '@polkadot/util';
import { ENetwork } from '../types';

interface NetworkTreasuryConfig {
	relayChainRpc: string;
	treasuryAccount: string;
	assetHubRpc: string;
	assetHubTreasuryAddress: string;
	assetHubFellowshipAddress: string;
	assetHubFellowshipUsdtAddress: string;
	assetHubMythAddress: string;
	assetHubAmbassadorAddress: string;
	usdtIndex: string;
	usdcIndex: string;
	mythosParachainId: string;
	hydrationRpc: string;
	hydrationAddresses: string[];
	hydrationChainTokenAssetId: number;
	fellowshipAddress: {
		treasury: string;
		salary: string;
	};
	hydrationUsdcAssetId: number;
	hydrationUsdtAssetId: number;
	ambassadorAddress: string;
	loanAmounts: {
		centrifuge: {
			usdc: string;
			link?: string;
		};
		bifrost: {
			chainToken: string;
			link?: string;
		};
		pendulum: {
			chainToken: string;
			link?: string;
		};
		hydration: {
			chainToken?: string;
			link?: string;
		};
	};
	burnPercentage: {
		numerator: BN;
		denominator: BN;
	};
	spendPeriodInBlocks: BN;
}

export const TREASURY_NETWORK_CONFIG: Record<ENetwork, NetworkTreasuryConfig | undefined> = {
	[ENetwork.POLKADOT]: {
		relayChainRpc: 'wss://rpc.ibp.network/polkadot',
		treasuryAccount: '13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB',
		assetHubRpc: 'wss://dot-rpc.stakeworld.io/assethub',
		assetHubTreasuryAddress: '14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk',
		assetHubFellowshipAddress: '16VcQSRcMFy6ZHVjBvosKmo7FKqTb8ZATChDYo8ibutzLnos',
		assetHubFellowshipUsdtAddress: '13w7NdvSR1Af8xsQTArDtZmVvjE8XhWNdL4yed3iFHrUNCnS',
		assetHubMythAddress: '13gYFscwJFJFqFMNnttzuTtMrApUEmcUARtgFubbChU9g6mh',
		assetHubAmbassadorAddress: '13wa8ddUNUhXnGeTrjYH8hYXF2jNdCJvgcADJakNvtNdGozX',
		usdtIndex: '1984',
		usdcIndex: '1337',
		mythosParachainId: '3369',
		hydrationRpc: 'wss://hydradx-rpc.dwellir.com',
		hydrationAddresses: [
			'7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV',
			'7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY',
			'7KATdGaecnKi4zDAMWQxpB2s59N2RE1JgLuugCjTsRZHgP24'
		],
		hydrationChainTokenAssetId: 5,
		fellowshipAddress: {
			treasury: '16VcQSRcMFy6ZHVjBvosKmo7FKqTb8ZATChDYo8ibutzLnos',
			salary: '13w7NdvSR1Af8xsQTArDtZmVvjE8XhWNdL4yed3iFHrUNCnS'
		},
		hydrationUsdcAssetId: 22,
		hydrationUsdtAssetId: 10,
		ambassadorAddress: '13wa8ddUNUhXnGeTrjYH8hYXF2jNdCJvgcADJakNvtNdGozX',
		loanAmounts: {
			bifrost: {
				chainToken: '5000000000000000',
				link: 'https://polkadot.polkassembly.io/referenda/432'
			},
			pendulum: {
				chainToken: '500000000000000',
				link: 'https://polkadot.polkassembly.io/referenda/748'
			},
			hydration: {
				chainToken: '10000000000000000',
				link: 'https://polkadot.polkassembly.io/referenda/560'
			},
			centrifuge: {
				usdc: '1500000000000',
				link: 'https://polkadot.polkassembly.io/referenda/1122'
			}
		},
		burnPercentage: {
			numerator: new BN(1),
			denominator: new BN(100)
		}, // 1% of the treasury balance
		spendPeriodInBlocks: new BN(345600)
	},
	[ENetwork.KUSAMA]: {
		relayChainRpc: 'wss://kusama-rpc.dwellir.com',
		assetHubRpc: 'wss://asset-hub-kusama.dotters.network',
		treasuryAccount: '0x6d6f646c70792f74727372790000000000000000000000000000000000000000000000000000000000000000',
		assetHubTreasuryAddress: 'HWZmQq6zMMk7TxixHfseFT2ewicT6UofPa68VCn3gkXrdJF',
		ambassadorAddress: '',
		fellowshipAddress: {
			treasury: '',
			salary: ''
		},
		loanAmounts: {
			bifrost: {
				chainToken: ''
			},
			pendulum: {
				chainToken: ''
			},
			hydration: {
				chainToken: '33333000000000000',
				link: 'https://kusama.polkassembly.io/referenda/490'
			},
			centrifuge: {
				usdc: ''
			}
		},
		burnPercentage: {
			numerator: new BN(0),
			denominator: new BN(1)
		}, // 0% of the treasury balance
		spendPeriodInBlocks: new BN(86400),
		hydrationRpc: '',
		hydrationAddresses: [],
		hydrationChainTokenAssetId: 0,
		hydrationUsdcAssetId: 0,
		hydrationUsdtAssetId: 0,
		assetHubFellowshipAddress: '',
		assetHubFellowshipUsdtAddress: '',
		assetHubMythAddress: '',
		assetHubAmbassadorAddress: '',
		usdtIndex: '',
		usdcIndex: '',
		mythosParachainId: ''
	}, // Add Kusama specific configuration when needed
	[ENetwork.WESTEND]: undefined, // Add Westend specific configuration when needed
	[ENetwork.PASEO]: undefined // Add Paseo specific configuration when needed
};
