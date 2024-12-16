// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ChainProps, ENetwork } from '@shared/types';

export const tokenSymbol = {
	ACA: 'ACA',
	ACU: 'ACU',
	ASTR: 'ASTR',
	AMPE: 'AMPE',
	ATA: 'ATA',
	BNC: 'BNC',
	BSX: 'BSX',
	CERE: 'CERE',
	CFG: 'CFG',
	CRU: 'CRU',
	CSM: 'CSM',
	DOL: 'DOL',
	DEV: 'DEV',
	DHX: 'DHX',
	DOT: 'DOT',
	FREN: 'FREN',
	FRQCY: 'FRQCY',
	GLMR: 'GLMR',
	HASH: 'HASH',
	HDX: 'HDX',
	HKO: 'HKO',
	KAR: 'KAR',
	KHA: 'KHA',
	ICZ: 'ICZ',
	KILT: 'KILT',
	KMA: 'KMA',
	KSM: 'KSM',
	KYL: 'KYL',
	LAYR: 'LAYR',
	MOVR: 'MOVR',
	MYRIA: 'MYRIA',
	PARA: 'PARA',
	PCHU: 'PCHU',
	PDEX: 'PDEX',
	PEN: 'PEN',
	SBY: 'SBY',
	SDN: 'SDN',
	TDFY: 'TDFY',
	TUR: 'TUR',
	TOKEN: 'TOKEN',
	TEER: 'TEER',
	PICA: 'PICA',
	ROC: 'ROC',
	POLYX: 'POLYX',
	PLMC: 'PLMC',
	RLMC: 'RLMC',
	MQTY: 'MQTY',
	WND: 'WND',
	XRT: 'XRT',
	UNIT: 'UNIT',
	VARA: 'VARA',
	XX: 'XX',
	ZTG: 'ZTG',
	KPGT: 'KPGT',
	CGT: 'CGT',
	SIGMA: 'SIGMA',
	MYTH: 'MYTH',
	PAS: 'PAS'
};

export const treasuryAssets = {
	DED: { name: 'dot-is-ded', img: '/assets/icons/ded-asset.png', tokenDecimal: 10 },
	USDT: {
		name: 'usdt',
		img: '/assets/icons/usdt.svg',
		tokenDecimal: 6
	},
	USDC: {
		name: 'usdc',
		img: '/assets/icons/usdc.svg',
		tokenDecimal: 6
	}
};

export const NETWORKS_DETAILS: Record<string, ChainProps> = {
	[ENetwork.POLKADOT]: {
		preImageBaseDeposit: '400000000000',
		assetHubRpcEndpoint: 'wss://dot-rpc.stakeworld.io/assethub',
		assetHubTreasuryAddress: '14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk',
		assetHubTreasuryAddress2: '16VcQSRcMFy6ZHVjBvosKmo7FKqTb8ZATChDYo8ibutzLnos',
		assetHubTreasuryAddress3: '13w7NdvSR1Af8xsQTArDtZmVvjE8XhWNdL4yed3iFHrUNCnS',
		assetHubTreasuryAddress4: '13gYFscwJFJFqFMNnttzuTtMrApUEmcUARtgFubbChU9g6mh',
		blockTime: 6000,
		category: 'polkadot',
		chainId: 0,
		parachain: '1000',
		peopleChainParachain: '1004',
		peopleChainRpcEndpoint: 'wss://polkadot-people-rpc.polkadot.io',
		logo: '',
		palletInstance: '50',
		rpcEndpoint: 'wss://polkadot.api.onfinality.io/public-ws',
		ss58Format: 0,
		subsquidUrl: 'https://squid.subsquid.io/polkadot-polkassembly/graphql',
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.DOT,
		treasuryAddress: '5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z',
		treasuryProposalBondPercent: '5.00%',
		treasuryProposalMinBond: '100',
		treasuryProposalMaxBond: '500',
		externalLinks: 'https://polkadot.api.subscan.io',
		assethubExternalLinks: 'https://assethub-polkadot.api.subscan.io',
		gTag: 'G-JMMMFDX405',
		rpcEndpoints: [
			{
				name: 'via Parity (recommended)',
				url: 'wss://rpc.polkadot.io'
			},
			{
				name: 'via On-finality',
				url: 'wss://polkadot.api.onfinality.io/public-ws'
			},
			{
				name: 'via Dwellir',
				url: 'wss://polkadot-rpc.dwellir.com'
			},
			{
				name: 'via Pinknode',
				url: 'wss://public-rpc.pinknode.io/polkadot'
			},
			{
				name: 'via IBP-GeoDNS1',
				url: 'wss://rpc.ibp.network/polkadot'
			},
			{
				name: 'via IBP-GeoDNS2',
				url: 'wss://rpc.dotters.network/polkadot'
			},
			{
				name: 'via RadiumBlock',
				url: 'wss://polkadot.public.curie.radiumblock.co/ws'
			},
			{
				name: 'via LuckyFriday',
				url: 'wss://rpc-polkadot.luckyfriday.io'
			}
		],
		supportedAssets: [
			{ ...treasuryAssets.DED, genralIndex: '30' },
			{ ...treasuryAssets.USDT, genralIndex: '1984' },
			{ ...treasuryAssets.USDC, genralIndex: '1337' }
		],
		hydrationEndpoints: ['wss://hydradx-rpc.dwellir.com', 'wss://rpc.hydradx.cloud', 'wss://rpc.helikon.io/hydradx', 'wss://hydradx.paras.ibp.network'],
		hydrationTreasuryAddress: '7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV',
		hydrationTreasuryAddress2: '7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY',
		hydrationAssets: [
			{
				label: 'DOT',
				assetId: 5
			},
			{
				label: 'USDT',
				assetId: 10
			},
			{
				label: 'USDC',
				assetId: 22
			}
		]
	},
	[ENetwork.ROCOCO]: {
		name: 'Rococo',
		blockTime: 6000,
		ss58Format: 42,
		subsquidUrl: 'https://squid.subsquid.io/rococo-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.ROC,
		externalLinks: 'https://rococo.subscan.io/',
		rpcEndpoints: [
			{
				name: 'via Parity',
				url: 'wss://rococo-rpc.polkadot.io'
			}
		],
		chainId: 1
	}
};
