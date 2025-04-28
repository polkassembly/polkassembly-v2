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
	hydrationDotAssetId: number;
	hydrationUsdcAssetId: number;
	hydrationUsdtAssetId: number;
	loanAmounts: {
		dot: string;
		usdc: string;
		[key: string]: string;
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
		hydrationAddresses: ['7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV', '7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY'],
		hydrationDotAssetId: 5,
		hydrationUsdcAssetId: 22,
		hydrationUsdtAssetId: 10,
		loanAmounts: {
			dot: '15500000000000000',
			usdc: '1500000000000'
		},
		burnPercentage: {
			numerator: new BN(1),
			denominator: new BN(100)
		}, // 1% of the treasury balance
		spendPeriodInBlocks: new BN(345600)
	},
	[ENetwork.KUSAMA]: undefined, // Add Kusama specific configuration when needed
	[ENetwork.WESTEND]: undefined // Add Westend specific configuration when needed
};
