// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EPostOrigin, EGovType } from '@shared/types';

const VIA_PARITY = 'via Parity';
const VIA_DWELLIR = 'via Dwellir';
const VIA_ONFINALITY = 'via On-finality';
const VIA_IBP_GEODNS1 = 'via IBP-GeoDNS1';
const VIA_IBP_GEODNS2 = 'via IBP-GeoDNS2';
const VIA_RADIUMBLOCK = 'via RadiumBlock';
const VIA_LUCKYFRIDAY = 'via LuckyFriday';
const VIA_PINKNODE = 'via Pinknode';

export const PEOPLE_CHAIN_NETWORK_DETAILS = {
	[ENetwork.POLKADOT]: {
		rpcEndpoints: [
			{
				name: VIA_PARITY,
				url: 'wss://polkadot-people-rpc.polkadot.io'
			},
			{
				name: VIA_LUCKYFRIDAY,
				url: 'wss://rpc-people-polkadot.luckyfriday.io'
			},
			{
				name: VIA_RADIUMBLOCK,
				url: 'wss://people-polkadot.public.curie.radiumblock.co/ws'
			},
			{
				name: VIA_IBP_GEODNS1,
				url: 'wss://sys.ibp.network/people-polkadot'
			},
			{
				name: VIA_IBP_GEODNS2,
				url: 'wss://people-polkadot.dotters.network'
			}
		]
	},
	[ENetwork.KUSAMA]: {
		rpcEndpoints: [
			{
				name: VIA_DWELLIR,
				url: 'wss://people-kusama-rpc.dwellir.com'
			},
			{
				name: VIA_PARITY,
				url: 'wss://kusama-people-rpc.polkadot.io'
			}
		]
	}
} as const;

export const NETWORKS_DETAILS = {
	[ENetwork.POLKADOT]: {
		key: ENetwork.POLKADOT,
		name: 'Polkadot',
		govtype: EGovType.OPENGOV,
		blockTime: 6000,
		ss58Format: 0,
		subsquidUrl: 'https://squid.subsquid.io/polkadot-polkassembly/graphql',
		tokenDecimals: 10,
		tokenSymbol: 'DOT',
		rpcEndpoints: [
			{
				name: `${VIA_PARITY} (recommended)`,
				url: 'wss://rpc.polkadot.io'
			},
			{
				name: VIA_ONFINALITY,
				url: 'wss://polkadot.api.onfinality.io/public-ws'
			},
			{
				name: VIA_DWELLIR,
				url: 'wss://polkadot-rpc.dwellir.com'
			},
			{
				name: VIA_PINKNODE,
				url: 'wss://public-rpc.pinknode.io/polkadot'
			},
			{
				name: VIA_IBP_GEODNS1,
				url: 'wss://rpc.ibp.network/polkadot'
			},
			{
				name: VIA_IBP_GEODNS2,
				url: 'wss://rpc.dotters.network/polkadot'
			},
			{
				name: VIA_RADIUMBLOCK,
				url: 'wss://polkadot.public.curie.radiumblock.co/ws'
			},
			{
				name: VIA_LUCKYFRIDAY,
				url: 'wss://rpc-polkadot.luckyfriday.io'
			}
		],
		peopleChainEndpoints: PEOPLE_CHAIN_NETWORK_DETAILS[ENetwork.POLKADOT].rpcEndpoints,
		tracks: {
			[EPostOrigin.ROOT]: {
				trackId: 0,
				description: 'Origin for General network-wide improvements',
				group: 'Origin',
				name: 'root',
				maxDeciding: 1,
				decisionDeposit: 1000000000000000,
				preparePeriod: 1200,
				decisionPeriod: 403200,
				confirmPeriod: 14400,
				minEnactmentPeriod: 14400,
				minApproval: {
					reciprocal: {
						factor: 222222224,
						xOffset: 333333335,
						yOffset: 333333332
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.WISH_FOR_CHANGE]: {
				trackId: 2,
				description: 'Origin for signaling that the network wishes for some change.',
				group: 'Origin',
				name: 'wish_for_change',
				decisionDeposit: 200000000000000,
				preparePeriod: 1200,
				decisionPeriod: 403200,
				confirmPeriod: 14400,
				minEnactmentPeriod: 100,
				minApproval: {
					reciprocal: {
						factor: 222222224,
						xOffset: 333333335,
						yOffset: 333333332
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.BIG_SPENDER]: {
				trackId: 34,
				description: 'Origin able to spend up to 1,000,000 DOT from the treasury at once',
				group: 'Treasury',
				name: 'big_spender',
				maxSpend: 1000000,
				maxDeciding: 50,
				decisionDeposit: 4000000000000,
				preparePeriod: 2400,
				decisionPeriod: 403200,
				confirmPeriod: 28800,
				minEnactmentPeriod: 14400,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 28326977,
						xOffset: 53763445,
						yOffset: -26881723
					}
				}
			},
			[EPostOrigin.MEDIUM_SPENDER]: {
				trackId: 33,
				description: 'Origin able to spend up to 100,000 DOT from the treasury at once',
				group: 'Treasury',
				name: 'medium_spender',
				maxSpend: 100000,
				maxDeciding: 50,
				decisionDeposit: 2000000000000,
				preparePeriod: 2400,
				decisionPeriod: 403200,
				confirmPeriod: 14400,
				minEnactmentPeriod: 14400,
				minApproval: {
					linearDecreasing: {
						length: 821428571,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 14377233,
						xOffset: 27972031,
						yOffset: -13986016
					}
				}
			},
			[EPostOrigin.SMALL_SPENDER]: {
				trackId: 32,
				description: 'Origin able to spend up to 10,000 DOT from the treasury at once',
				group: 'Treasury',
				name: 'small_spender',
				maxSpend: 10000,
				maxDeciding: 50,
				decisionDeposit: 1000000000000,
				preparePeriod: 2400,
				decisionPeriod: 403200,
				confirmPeriod: 7200,
				minEnactmentPeriod: 14400,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			},
			[EPostOrigin.BIG_TIPPER]: {
				trackId: 31,
				description: 'Origin able to spend up to 1000 DOT from the treasury at once',
				group: 'Treasury',
				name: 'big_tipper',
				maxSpend: 1000,
				maxDeciding: 100,
				decisionDeposit: 100000000000,
				preparePeriod: 100,
				decisionPeriod: 100800,
				confirmPeriod: 600,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 357142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 4149097,
						xOffset: 8230453,
						yOffset: -4115227
					}
				}
			},
			[EPostOrigin.SMALL_TIPPER]: {
				trackId: 30,
				description: 'Origin able to spend up to 250 DOT from the treasury at once',
				group: 'Treasury',
				name: 'small_tipper',
				maxSpend: 250,
				maxDeciding: 200,
				decisionDeposit: 10000000000,
				preparePeriod: 10,
				decisionPeriod: 100800,
				confirmPeriod: 100,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 357142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 1620729,
						xOffset: 3231018,
						yOffset: -1615509
					}
				}
			},
			[EPostOrigin.TREASURER]: {
				trackId: 11,
				description: 'Origin for spending (any amount of) funds until the upper limit of  10,000,000 DOT',
				group: 'Origin',
				name: 'treasurer',
				maxSpend: 10000000,
				maxDeciding: 10,
				decisionDeposit: 10000000000000,
				preparePeriod: 1200,
				decisionPeriod: 403200,
				confirmPeriod: 1800,
				minEnactmentPeriod: 14400,
				minApproval: {
					reciprocal: {
						factor: 222222224,
						xOffset: 333333335,
						yOffset: 333333332
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.WHITELISTED_CALLER]: {
				trackId: 1,
				description: 'Origin commanded by any members of the Polkadot Fellowship (no Dan grade needed)',
				group: 'Origin',
				name: 'whitelisted_caller',
				maxDeciding: 100,
				decisionDeposit: 100000000000000,
				preparePeriod: 300,
				decisionPeriod: 403200,
				confirmPeriod: 100,
				minEnactmentPeriod: 100,
				minApproval: {
					reciprocal: {
						factor: 270899180,
						xOffset: 389830523,
						yOffset: 305084738
					}
				},
				minSupport: {
					reciprocal: {
						factor: 8650766,
						xOffset: 18867926,
						yOffset: 41509433
					}
				}
			},
			[EPostOrigin.STAKING_ADMIN]: {
				trackId: 10,
				description: 'Origin for cancelling slashes.',
				group: 'Main',
				name: 'staking_admin',
				maxDeciding: 10,
				decisionDeposit: 50000000000000,
				preparePeriod: 1200,
				decisionPeriod: 403200,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			},
			[EPostOrigin.LEASE_ADMIN]: {
				trackId: 12,
				description: 'Origin able to force slot leases',
				group: 'Main',
				name: 'lease_admin',
				maxDeciding: 10,
				decisionDeposit: 50000000000000,
				preparePeriod: 1200,
				decisionPeriod: 403200,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			},
			[EPostOrigin.FELLOWSHIP_ADMIN]: {
				trackId: 13,
				description: 'Origin for managing the composition of the fellowship',
				group: 'Origin',
				name: 'fellowship_admin',
				maxDeciding: 10,
				decisionDeposit: 50000000000000,
				preparePeriod: 1200,
				decisionPeriod: 403200,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			},
			[EPostOrigin.GENERAL_ADMIN]: {
				trackId: 14,
				description: 'Origin for managing the registrar',
				group: 'Main',
				name: 'general_admin',
				maxDeciding: 10,
				decisionDeposit: 50000000000000,
				preparePeriod: 1200,
				decisionPeriod: 403200,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					reciprocal: {
						factor: 222222224,
						xOffset: 333333335,
						yOffset: 333333332
					}
				},
				minSupport: {
					reciprocal: {
						factor: 49586777,
						xOffset: 90909091,
						yOffset: -45454546
					}
				}
			},
			[EPostOrigin.AUCTION_ADMIN]: {
				trackId: 15,
				description: 'Origin for starting auctions.',
				group: 'Main',
				name: 'auction_admin',
				maxDeciding: 10,
				decisionDeposit: 50000000000000,
				preparePeriod: 1200,
				decisionPeriod: 403200,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					reciprocal: {
						factor: 222222224,
						xOffset: 333333335,
						yOffset: 333333332
					}
				},
				minSupport: {
					reciprocal: {
						factor: 49586777,
						xOffset: 90909091,
						yOffset: -45454546
					}
				}
			},
			[EPostOrigin.REFERENDUM_CANCELLER]: {
				trackId: 20,
				description: 'Origin able to cancel referenda.',
				group: 'Origin',
				name: 'referendum_canceller',
				maxDeciding: 1000,
				decisionDeposit: 100000000000000,
				preparePeriod: 1200,
				decisionPeriod: 100800,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			},
			[EPostOrigin.REFERENDUM_KILLER]: {
				trackId: 21,
				description: 'Origin able to kill referenda.',
				group: 'Origin',
				name: 'referendum_killer',
				maxDeciding: 1000,
				decisionDeposit: 500000000000000,
				preparePeriod: 1200,
				decisionPeriod: 403200,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			}
		},
		identityRegistrarIndex: 3
	},
	[ENetwork.KUSAMA]: {
		disabled: false,
		key: ENetwork.KUSAMA,
		govtype: EGovType.OPENGOV,
		name: 'Kusama',
		blockTime: 6000,
		ss58Format: 2,
		subsquidUrl: 'https://squid.subsquid.io/kusama-polkassembly/graphql',
		tokenDecimals: 12,
		tokenSymbol: 'KSM',
		blockExplorerUrl: 'https://kusama.subscan.io/',
		rpcEndpoints: [
			{
				name: VIA_ONFINALITY,
				url: 'wss://kusama.api.onfinality.io/public-ws'
			},
			{
				name: VIA_DWELLIR,
				url: 'wss://kusama-rpc.dwellir.com'
			},
			{
				name: VIA_PARITY,
				url: 'wss://kusama-rpc.polkadot.io'
			},
			{
				name: VIA_IBP_GEODNS1,
				url: 'wss://rpc.ibp.network/kusama'
			},
			{
				name: VIA_IBP_GEODNS2,
				url: 'wss://rpc.dotters.network/kusama'
			},
			{
				name: VIA_RADIUMBLOCK,
				url: 'wss://kusama.public.curie.radiumblock.co/ws'
			},
			{
				name: VIA_LUCKYFRIDAY,
				url: 'wss://rpc-kusama.luckyfriday.io'
			}
		],
		peopleChainEndpoints: PEOPLE_CHAIN_NETWORK_DETAILS[ENetwork.KUSAMA].rpcEndpoints,
		tracks: {
			[EPostOrigin.ROOT]: {
				trackId: 0,
				description: 'Origin for General network-wide improvements',
				group: 'Main',
				name: 'root',
				maxDeciding: 1,
				decisionDeposit: 3333333333300000,
				preparePeriod: 1200,
				decisionPeriod: 201600,
				confirmPeriod: 14400,
				minEnactmentPeriod: 14400,
				minApproval: {
					reciprocal: {
						factor: 222222224,
						xOffset: 333333335,
						yOffset: 333333332
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.WISH_FOR_CHANGE]: {
				trackId: 2,
				description: 'Origin for signaling that the network wishes for some change.',
				group: 'Main',
				name: 'wish_for_change',
				maxDeciding: 10,
				decisionDeposit: 666666666660000,
				preparePeriod: 1200,
				decisionPeriod: 201600,
				confirmPeriod: 14400,
				minEnactmentPeriod: 100,
				minApproval: {
					reciprocal: {
						factor: 222222224,
						xOffset: 333333335,
						yOffset: 333333332
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.BIG_SPENDER]: {
				trackId: 34,
				description: 'Origin able to spend up to 33,333 KSM from the treasury at once.',
				group: 'Treasury',
				name: 'big_spender',
				maxSpend: 33333,
				maxDeciding: 50,
				decisionDeposit: 13333333333200,
				preparePeriod: 2400,
				decisionPeriod: 201600,
				confirmPeriod: 28800,
				minEnactmentPeriod: 14400,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 28326977,
						xOffset: 53763445,
						yOffset: -26881723
					}
				}
			},
			[EPostOrigin.MEDIUM_SPENDER]: {
				trackId: 33,
				description: 'Origin able to spend up to 3,333 KSM from the treasury at once.',
				group: 'Treasury',
				name: 'medium_spender',
				maxSpend: 3333,
				maxDeciding: 50,
				decisionDeposit: 6666666666600,
				preparePeriod: 2400,
				decisionPeriod: 201600,
				confirmPeriod: 14400,
				minEnactmentPeriod: 14400,
				minApproval: {
					linearDecreasing: {
						length: 821428571,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 14377233,
						xOffset: 27972031,
						yOffset: -13986016
					}
				}
			},
			[EPostOrigin.SMALL_SPENDER]: {
				trackId: 32,
				description: 'Origin able to spend up to 333 KSM from the treasury at once.',
				group: 'Treasury',
				name: 'small_spender',
				maxSpend: 333,
				maxDeciding: 50,
				decisionDeposit: 3333333333300,
				preparePeriod: 2400,
				decisionPeriod: 201600,
				confirmPeriod: 7200,
				minEnactmentPeriod: 14400,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			},
			[EPostOrigin.BIG_TIPPER]: {
				trackId: 31,
				description: 'Origin able to spend up to 5 KSM from the treasury at once.',
				group: 'Treasury',
				name: 'big_tipper',
				maxSpend: 5,
				maxDeciding: 100,
				decisionDeposit: 333333333330,
				preparePeriod: 100,
				decisionPeriod: 100800,
				confirmPeriod: 600,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 357142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 4149097,
						xOffset: 8230453,
						yOffset: -4115227
					}
				}
			},
			[EPostOrigin.SMALL_TIPPER]: {
				trackId: 30,
				description: 'Origin able to spend up to 1 KSM from the treasury at once.',
				group: 'Treasury',
				name: 'small_tipper',
				maxSpend: 1,
				maxDeciding: 200,
				decisionDeposit: 33333333333,
				preparePeriod: 10,
				decisionPeriod: 100800,
				confirmPeriod: 100,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 357142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 1620729,
						xOffset: 3231018,
						yOffset: -1615509
					}
				}
			},
			[EPostOrigin.TREASURER]: {
				trackId: 11,
				description: 'Origin for spending (any amount of) funds.',
				group: 'Treasury',
				name: 'treasurer',
				maxSpend: 333333,
				maxDeciding: 10,
				decisionDeposit: 33333333333000,
				preparePeriod: 1200,
				decisionPeriod: 201600,
				confirmPeriod: 1800,
				minEnactmentPeriod: 14400,
				minApproval: {
					reciprocal: {
						factor: 222222224,
						xOffset: 333333335,
						yOffset: 333333332
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.WHITELISTED_CALLER]: {
				trackId: 1,
				description: 'Origin able to dispatch a whitelisted call.',
				group: 'Whitelist',
				name: 'whitelisted_caller',
				maxDeciding: 100,
				decisionDeposit: 333333333330000,
				preparePeriod: 300,
				decisionPeriod: 201600,
				confirmPeriod: 100,
				minEnactmentPeriod: 100,
				minApproval: {
					reciprocal: {
						factor: 270899180,
						xOffset: 389830523,
						yOffset: 305084738
					}
				},
				minSupport: {
					reciprocal: {
						factor: 8650766,
						xOffset: 18867926,
						yOffset: 41509433
					}
				}
			},
			[EPostOrigin.STAKING_ADMIN]: {
				trackId: 10,
				description: 'Origin for cancelling slashes.',
				group: 'Main',
				name: 'staking_admin',
				maxDeciding: 10,
				decisionDeposit: 166666666665000,
				preparePeriod: 1200,
				decisionPeriod: 201600,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			},
			[EPostOrigin.LEASE_ADMIN]: {
				trackId: 12,
				description: 'Origin able to force slot leases.',
				group: 'Governance',
				name: 'lease_admin',
				maxDeciding: 10,
				decisionDeposit: 166666666665000,
				preparePeriod: 1200,
				decisionPeriod: 201600,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			},
			[EPostOrigin.FELLOWSHIP_ADMIN]: {
				trackId: 13,
				description: 'Origin for managing the composition of the fellowship.',
				group: 'Whitelist',
				name: 'fellowship_admin',
				maxDeciding: 10,
				decisionDeposit: 166666666665000,
				preparePeriod: 1200,
				decisionPeriod: 201600,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			},
			[EPostOrigin.GENERAL_ADMIN]: {
				trackId: 14,
				description: 'Origin for managing the registrar.',
				group: 'Governance',
				name: 'general_admin',
				maxDeciding: 10,
				decisionDeposit: 166666666665000,
				preparePeriod: 1200,
				decisionPeriod: 201600,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					reciprocal: {
						factor: 222222224,
						xOffset: 333333335,
						yOffset: 333333332
					}
				},
				minSupport: {
					reciprocal: {
						factor: 49586777,
						xOffset: 90909091,
						yOffset: -45454546
					}
				}
			},
			[EPostOrigin.AUCTION_ADMIN]: {
				trackId: 15,
				description: 'Origin for starting auctions.',
				group: 'Main',
				name: 'auction_admin',
				maxDeciding: 10,
				decisionDeposit: 166666666665000,
				preparePeriod: 1200,
				decisionPeriod: 201600,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					reciprocal: {
						factor: 222222224,
						xOffset: 333333335,
						yOffset: 333333332
					}
				},
				minSupport: {
					reciprocal: {
						factor: 49586777,
						xOffset: 90909091,
						yOffset: -45454546
					}
				}
			},
			[EPostOrigin.REFERENDUM_CANCELLER]: {
				trackId: 20,
				description: 'Origin able to cancel referenda.',
				group: 'Governance',
				name: 'referendum_canceller',
				maxDeciding: 1000,
				decisionDeposit: 333333333330000,
				preparePeriod: 1200,
				decisionPeriod: 100800,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			},
			[EPostOrigin.REFERENDUM_KILLER]: {
				trackId: 21,
				description: 'Origin able to kill referenda.',
				group: 'Governance',
				name: 'referendum_killer',
				maxDeciding: 1000,
				decisionDeposit: 1666666666650000,
				preparePeriod: 1200,
				decisionPeriod: 201600,
				confirmPeriod: 1800,
				minEnactmentPeriod: 100,
				minApproval: {
					linearDecreasing: {
						length: 607142857,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					reciprocal: {
						factor: 7892829,
						xOffset: 15544040,
						yOffset: -7772020
					}
				}
			},
			[EPostOrigin.CANDIDATES]: {
				fellowshipOrigin: true,
				description: 'Origin commanded by any members of the Polkadot Fellowship (no Dan grade needed)',
				trackId: 0,
				name: 'candidates',
				maxDeciding: 10,
				decisionDeposit: 3333333333300,
				preparePeriod: 300,
				decisionPeriod: 100800,
				confirmPeriod: 300,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.MEMBERS]: {
				fellowshipOrigin: true,
				trackId: 1,
				description: 'Origin commanded by rank 1 of the Polkadot Fellowship and with a success of 1',
				name: 'members',
				maxDeciding: 10,
				decisionDeposit: 333333333330,
				preparePeriod: 300,
				decisionPeriod: 100800,
				confirmPeriod: 300,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.PROFICIENTS]: {
				fellowshipOrigin: true,
				trackId: 2,
				description: 'Origin commanded by rank 2 of the Polkadot Fellowship and with a success of 2',
				name: 'proficients',
				maxDeciding: 10,
				decisionDeposit: 333333333330,
				preparePeriod: 300,
				decisionPeriod: 100800,
				confirmPeriod: 300,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.FELLOWS]: {
				fellowshipOrigin: true,
				trackId: 3,
				description: 'Origin commanded by Polkadot Fellows (3rd Dan fellows or greater)',
				name: 'fellows',
				maxDeciding: 10,
				decisionDeposit: 333333333330,
				preparePeriod: 300,
				decisionPeriod: 100800,
				confirmPeriod: 300,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.SENIOR_FELLOWS]: {
				fellowshipOrigin: true,
				trackId: 4,
				description: 'Origin commanded by rank 4 of the Polkadot Fellowship and with a success of 4',
				name: 'senior fellows',
				maxDeciding: 10,
				decisionDeposit: 333333333330,
				preparePeriod: 300,
				decisionPeriod: 100800,
				confirmPeriod: 300,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.EXPERTS]: {
				fellowshipOrigin: true,
				trackId: 5,
				description: 'Origin commanded by Polkadot Experts (5th Dan fellows or greater)',
				name: 'experts',
				maxDeciding: 10,
				decisionDeposit: 33333333333,
				preparePeriod: 300,
				decisionPeriod: 100800,
				confirmPeriod: 300,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.SENIOR_EXPERTS]: {
				fellowshipOrigin: true,
				trackId: 6,
				description: 'Origin commanded by rank 6 of the Polkadot Fellowship and with a success of 6',
				name: 'senior experts',
				maxDeciding: 10,
				decisionDeposit: 33333333333,
				preparePeriod: 300,
				decisionPeriod: 100800,
				confirmPeriod: 300,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.MASTERS]: {
				fellowshipOrigin: true,
				trackId: 7,
				description: 'Origin commanded by Polkadot Masters (7th Dan fellows of greater)',
				name: 'masters',
				maxDeciding: 10,
				decisionDeposit: 33333333333,
				preparePeriod: 300,
				decisionPeriod: 100800,
				confirmPeriod: 300,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.SENIOR_MASTERS]: {
				fellowshipOrigin: true,
				trackId: 8,
				description: 'Origin commanded by rank 8 of the Polkadot Fellowship and with a success of 8',
				name: 'senior masters',
				maxDeciding: 10,
				decisionDeposit: 33333333333,
				preparePeriod: 300,
				decisionPeriod: 100800,
				confirmPeriod: 300,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			},
			[EPostOrigin.GRAND_MASTERS]: {
				fellowshipOrigin: true,
				trackId: 9,
				description: 'Origin commanded by rank 9 of the Polkadot Fellowship and with a success of 9',
				name: 'grand masters',
				maxDeciding: 10,
				decisionDeposit: 33333333333,
				preparePeriod: 300,
				decisionPeriod: 100800,
				confirmPeriod: 300,
				minEnactmentPeriod: 10,
				minApproval: {
					linearDecreasing: {
						length: 1000000000,
						floor: 500000000,
						ceil: 1000000000
					}
				},
				minSupport: {
					linearDecreasing: {
						length: 1000000000,
						floor: 0,
						ceil: 500000000
					}
				}
			}
		},
		identityRegistrarIndex: 5
	}
} as const;
