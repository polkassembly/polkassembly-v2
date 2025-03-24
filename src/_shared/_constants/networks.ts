// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from '@polkadot/util';
import { ENetwork, EPostOrigin, EGovType, EAssets } from '@shared/types';

const VIA_PARITY = 'via Parity';
const VIA_DWELLIR = 'via Dwellir';
const VIA_ONFINALITY = 'via On-finality';
const VIA_IBP_GEODNS1 = 'via IBP-GeoDNS1';
const VIA_IBP_GEODNS2 = 'via IBP-GeoDNS2';
const VIA_RADIUMBLOCK = 'via RadiumBlock';
const VIA_LUCKYFRIDAY = 'via LuckyFriday';
const VIA_PINKNODE = 'via Pinknode';

interface ITreasuryAsset {
	name: string;
	tokenDecimal: number;
	symbol: string;
}

interface INetworkTreasuryAssets extends ITreasuryAsset {
	index: string;
}

interface IRpcEndpoint {
	name: string;
	url: string;
}

interface IReciprocal {
	factor: number;
	xOffset: number;
	yOffset: number;
}

interface ILinearDecreasing {
	length: number;
	floor: number;
	ceil: number;
}

interface IMinApproval {
	reciprocal?: IReciprocal;
	linearDecreasing?: ILinearDecreasing;
}

interface IMinSupport {
	reciprocal?: IReciprocal;
	linearDecreasing?: ILinearDecreasing;
}

interface ITrackInfo {
	trackId: number;
	description: string;
	group?: string;
	name: string;
	maxDeciding?: number;
	decisionDeposit: BN;
	preparePeriod: number;
	decisionPeriod: number;
	confirmPeriod: number;
	minEnactmentPeriod: number;
	maxSpend?: BN;
	minApproval: IMinApproval;
	minSupport: IMinSupport;
	fellowshipOrigin?: boolean;
}

interface IPeopleChainDetails {
	rpcEndpoints: IRpcEndpoint[];
	polkassemblyRegistrarIndex?: number;
	identityMinDeposit: BN;
}

interface INetworkDetails {
	key: ENetwork;
	name: string;
	govtype: EGovType;
	blockTime: number;
	ss58Format: number;
	subsquidUrl: string;
	tokenDecimals: number;
	tokenSymbol: string;
	rpcEndpoints: IRpcEndpoint[];
	supportedAssets: Record<string, INetworkTreasuryAssets>;
	foreignAssets: Record<string, INetworkTreasuryAssets>;
	peopleChainDetails: IPeopleChainDetails;
	trackDetails: Partial<Record<EPostOrigin, ITrackInfo>>;
	palletInstance?: string;
	parachain?: string;
}

export const treasuryAssetsData: Record<string, ITreasuryAsset> = {
	[EAssets.DED]: { name: 'dot-is-ded', tokenDecimal: 10, symbol: 'DED' },
	[EAssets.USDT]: { name: 'usdt', tokenDecimal: 6, symbol: 'USDT' },
	[EAssets.USDC]: { name: 'usdc', tokenDecimal: 6, symbol: 'USDC' },
	[EAssets.MYTH]: { name: 'mythos', tokenDecimal: 18, symbol: 'MYTH' }
} as const;

const PEOPLE_CHAIN_NETWORK_DETAILS: Record<ENetwork, IPeopleChainDetails> = {
	[ENetwork.POLKADOT]: {
		polkassemblyRegistrarIndex: 3,
		identityMinDeposit: new BN('2001700000'),
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
		polkassemblyRegistrarIndex: 5,
		identityMinDeposit: new BN('6672333321'),
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
	},
	[ENetwork.WESTEND]: {
		identityMinDeposit: new BN('10008500000'),
		rpcEndpoints: [
			{
				name: VIA_IBP_GEODNS1,
				url: 'wss://sys.ibp.network/people-westend'
			},
			{
				name: VIA_DWELLIR,
				url: 'wss://kusama-rpc.dwellir.com'
			},
			{
				name: VIA_IBP_GEODNS2,
				url: 'wss://people-westend.dotters.network'
			},
			{
				name: VIA_PARITY,
				url: 'wss://westend-people-rpc.polkadot.io'
			}
		]
	}
} as const;

// Track descriptions
const ROOT_ORIGIN_DESCRIPTION = 'Origin for General network-wide improvements';
const WISH_FOR_CHANGE_DESCRIPTION = 'Origin for signaling that the network wishes for some change.';
const WHITELISTED_CALLER_DESCRIPTION = 'Origin commanded by any members of the Polkadot Fellowship (no Dan grade needed)';
const STAKING_ADMIN_DESCRIPTION = 'Origin for cancelling slashes.';
const LEASE_ADMIN_DESCRIPTION = 'Origin able to force slot leases';
const FELLOWSHIP_ADMIN_DESCRIPTION = 'Origin for managing the composition of the fellowship';
const GENERAL_ADMIN_DESCRIPTION = 'Origin for managing the registrar';
const AUCTION_ADMIN_DESCRIPTION = 'Origin for starting auctions.';
const REFERENDUM_CANCELLER_DESCRIPTION = 'Origin able to cancel referenda.';
const REFERENDUM_KILLER_DESCRIPTION = 'Origin able to kill referenda.';
const TREASURER_DESCRIPTION = 'Origin for spending (any amount of) funds until the upper limit of  10,000,000 DOT';

const NETWORK_TOKEN_DECIMALS: Record<ENetwork, number> = {
	[ENetwork.POLKADOT]: 10,
	[ENetwork.KUSAMA]: 12,
	[ENetwork.WESTEND]: 12
} as const;

const NETWORK_TRACK_DETAILS: Record<ENetwork, Partial<Record<EPostOrigin, ITrackInfo>>> = {
	[ENetwork.POLKADOT]: {
		[EPostOrigin.ROOT]: {
			trackId: 0,
			description: ROOT_ORIGIN_DESCRIPTION,
			group: 'Origin',
			name: 'root',
			maxDeciding: 1,
			decisionDeposit: new BN('100000000000000'),
			preparePeriod: 80,
			decisionPeriod: 200,
			confirmPeriod: 120,
			minEnactmentPeriod: 50,
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
			description: WISH_FOR_CHANGE_DESCRIPTION,
			group: 'Origin',
			name: 'wish_for_change',
			decisionDeposit: new BN('200000000000000'),
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
			maxSpend: new BN('1000000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.POLKADOT]))),
			maxDeciding: 50,
			decisionDeposit: new BN('4000000000000'),
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
			maxSpend: new BN('100000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.POLKADOT]))),
			maxDeciding: 50,
			decisionDeposit: new BN('2000000000000'),
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
			maxSpend: new BN('10000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.POLKADOT]))),
			maxDeciding: 50,
			decisionDeposit: new BN('1000000000000'),
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
			maxSpend: new BN('1000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.POLKADOT]))),
			maxDeciding: 100,
			decisionDeposit: new BN('100000000000'),
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
			maxDeciding: 200,
			decisionDeposit: new BN('30000000000'),
			preparePeriod: 10,
			decisionPeriod: 140,
			confirmPeriod: 40,
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
			description: TREASURER_DESCRIPTION,
			group: 'Origin',
			name: 'treasurer',
			maxSpend: new BN('10000000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.POLKADOT]))),
			maxDeciding: 10,
			decisionDeposit: new BN('10000000000000'),
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
			description: WHITELISTED_CALLER_DESCRIPTION,
			group: 'Origin',
			name: 'whitelisted_caller',
			maxDeciding: 100,
			decisionDeposit: new BN('10000000000000000'),
			preparePeriod: 60,
			decisionPeriod: 200,
			confirmPeriod: 40,
			minEnactmentPeriod: 30,
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
			description: STAKING_ADMIN_DESCRIPTION,
			group: 'Main',
			name: 'staking_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('50000000000000'),
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
			description: LEASE_ADMIN_DESCRIPTION,
			group: 'Main',
			name: 'lease_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('50000000000000'),
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
			description: FELLOWSHIP_ADMIN_DESCRIPTION,
			group: 'Origin',
			name: 'fellowship_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('50000000000000'),
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
			description: GENERAL_ADMIN_DESCRIPTION,
			group: 'Main',
			name: 'general_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('50000000000000'),
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
			description: AUCTION_ADMIN_DESCRIPTION,
			group: 'Main',
			name: 'auction_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('50000000000000'),
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
			description: REFERENDUM_CANCELLER_DESCRIPTION,
			group: 'Origin',
			name: 'referendum_canceller',
			maxDeciding: 1000,
			decisionDeposit: new BN('100000000000000'),
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
			description: REFERENDUM_KILLER_DESCRIPTION,
			group: 'Origin',
			name: 'referendum_killer',
			maxDeciding: 1000,
			decisionDeposit: new BN('500000000000000'),
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
	[ENetwork.KUSAMA]: {
		[EPostOrigin.ROOT]: {
			trackId: 0,
			description: ROOT_ORIGIN_DESCRIPTION,
			group: 'Main',
			name: 'root',
			maxDeciding: 1,
			decisionDeposit: new BN('3333333333300000'),
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
			description: WISH_FOR_CHANGE_DESCRIPTION,
			group: 'Main',
			name: 'wish_for_change',
			maxDeciding: 10,
			decisionDeposit: new BN('666666666660000'),
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
			maxSpend: new BN('33333').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.KUSAMA]))),
			maxDeciding: 50,
			decisionDeposit: new BN('13333333333200'),
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
			maxSpend: new BN('3333').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.KUSAMA]))),
			maxDeciding: 50,
			decisionDeposit: new BN('6666666666600'),
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
			maxSpend: new BN('333').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.KUSAMA]))),
			maxDeciding: 50,
			decisionDeposit: new BN('3333333333300'),
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
			maxSpend: new BN('5').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.KUSAMA]))),
			maxDeciding: 100,
			decisionDeposit: new BN('333333333330'),
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
			maxDeciding: 200,
			decisionDeposit: new BN('33333333333'),
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
			description: TREASURER_DESCRIPTION,
			group: 'Treasury',
			name: 'treasurer',
			maxSpend: new BN('333333').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.KUSAMA]))),
			maxDeciding: 10,
			decisionDeposit: new BN('33333333333000'),
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
			description: WHITELISTED_CALLER_DESCRIPTION,
			group: 'Whitelist',
			name: 'whitelisted_caller',
			maxDeciding: 100,
			decisionDeposit: new BN('333333333330000'),
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
			description: STAKING_ADMIN_DESCRIPTION,
			group: 'Main',
			name: 'staking_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('166666666665000'),
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
			description: LEASE_ADMIN_DESCRIPTION,
			group: 'Governance',
			name: 'lease_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('166666666665000'),
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
			description: FELLOWSHIP_ADMIN_DESCRIPTION,
			group: 'Whitelist',
			name: 'fellowship_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('166666666665000'),
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
			description: GENERAL_ADMIN_DESCRIPTION,
			group: 'Governance',
			name: 'general_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('166666666665000'),
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
			description: AUCTION_ADMIN_DESCRIPTION,
			group: 'Main',
			name: 'auction_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('166666666665000'),
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
			description: REFERENDUM_CANCELLER_DESCRIPTION,
			group: 'Governance',
			name: 'referendum_canceller',
			maxDeciding: 1000,
			decisionDeposit: new BN('333333333330000'),
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
			description: REFERENDUM_KILLER_DESCRIPTION,
			group: 'Governance',
			name: 'referendum_killer',
			maxDeciding: 1000,
			decisionDeposit: new BN('1666666666650000'),
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
			decisionDeposit: new BN('3333333333300'),
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
			decisionDeposit: new BN('333333333330'),
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
			decisionDeposit: new BN('333333333330'),
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
			decisionDeposit: new BN('333333333330'),
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
			decisionDeposit: new BN('333333333330'),
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
			decisionDeposit: new BN('33333333333'),
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
			decisionDeposit: new BN('33333333333'),
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
			decisionDeposit: new BN('33333333333'),
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
			decisionDeposit: new BN('33333333333'),
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
			decisionDeposit: new BN('33333333333'),
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
	[ENetwork.WESTEND]: {
		[EPostOrigin.ROOT]: {
			trackId: 0,
			description: ROOT_ORIGIN_DESCRIPTION,
			group: 'Origin',
			name: 'root',
			maxDeciding: 1,
			decisionDeposit: new BN('100000000000000'),
			preparePeriod: 80,
			decisionPeriod: 200,
			confirmPeriod: 120,
			minEnactmentPeriod: 50,
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
			description: 'Origin able to spend up to 1,000,000 WND from the treasury at once',
			group: 'Treasury',
			name: 'big_spender',
			maxSpend: new BN('1000000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND]))),
			maxDeciding: 50,
			decisionDeposit: new BN('4000000000000'),
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
			description: 'Origin able to spend up to 100,000 WND from the treasury at once',
			group: 'Treasury',
			name: 'medium_spender',
			maxSpend: new BN('100000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND]))),
			maxDeciding: 50,
			decisionDeposit: new BN('2000000000000'),
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
			description: 'Origin able to spend up to 10,000 WND from the treasury at once',
			group: 'Treasury',
			name: 'small_spender',
			maxSpend: new BN('10000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND]))),
			maxDeciding: 50,
			decisionDeposit: new BN('1000000000000'),
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
			description: 'Origin able to spend up to 1000 WND from the treasury at once',
			group: 'Treasury',
			name: 'big_tipper',
			maxSpend: new BN('1000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND]))),
			maxDeciding: 100,
			decisionDeposit: new BN('100000000000'),
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
			description: 'Origin able to spend up to 250 WND from the treasury at once',
			group: 'Treasury',
			name: 'small_tipper',
			maxDeciding: 200,
			decisionDeposit: new BN('30000000000'),
			preparePeriod: 10,
			decisionPeriod: 140,
			confirmPeriod: 40,
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
			description: TREASURER_DESCRIPTION,
			group: 'Origin',
			name: 'treasurer',
			maxSpend: new BN('10000000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND]))),
			maxDeciding: 10,
			decisionDeposit: new BN('10000000000000'),
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
			description: WHITELISTED_CALLER_DESCRIPTION,
			group: 'Origin',
			name: 'whitelisted_caller',
			maxDeciding: 100,
			decisionDeposit: new BN('10000000000000000'),
			preparePeriod: 60,
			decisionPeriod: 200,
			confirmPeriod: 40,
			minEnactmentPeriod: 30,
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
			description: STAKING_ADMIN_DESCRIPTION,
			group: 'Main',
			name: 'staking_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('50000000000000'),
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
			description: LEASE_ADMIN_DESCRIPTION,
			group: 'Main',
			name: 'lease_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('50000000000000'),
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
			description: FELLOWSHIP_ADMIN_DESCRIPTION,
			group: 'Origin',
			name: 'fellowship_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('50000000000000'),
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
			description: GENERAL_ADMIN_DESCRIPTION,
			group: 'Main',
			name: 'general_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('50000000000000'),
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
			description: AUCTION_ADMIN_DESCRIPTION,
			group: 'Main',
			name: 'auction_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('50000000000000'),
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
			description: REFERENDUM_CANCELLER_DESCRIPTION,
			group: 'Governance',
			name: 'referendum_canceller',
			maxDeciding: 1000,
			decisionDeposit: new BN('333333333330000'),
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
			description: REFERENDUM_KILLER_DESCRIPTION,
			group: 'Governance',
			name: 'referendum_killer',
			maxDeciding: 1000,
			decisionDeposit: new BN('1666666666650000'),
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
		}
	}
} as const;

export const NETWORKS_DETAILS: Record<ENetwork, INetworkDetails> = {
	[ENetwork.POLKADOT]: {
		key: ENetwork.POLKADOT,
		name: 'Polkadot',
		govtype: EGovType.OPENGOV,
		parachain: '1000',
		palletInstance: '50',
		blockTime: 6000,
		ss58Format: 0,
		subsquidUrl: 'https://squid.subsquid.io/polkadot-polkassembly/graphql',
		tokenDecimals: NETWORK_TOKEN_DECIMALS[ENetwork.POLKADOT],
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
		supportedAssets: {
			'1984': {
				...treasuryAssetsData[EAssets.USDT],
				index: '1984',
				tokenDecimal: 6
			},
			'1337': {
				...treasuryAssetsData[EAssets.USDC],
				index: '1337',
				tokenDecimal: 6
			},
			'30': {
				...treasuryAssetsData[EAssets.DED],
				index: '30'
			}
		},
		foreignAssets: {
			[EAssets.MYTH]: {
				...treasuryAssetsData[EAssets.MYTH],
				index: '30',
				tokenDecimal: 18
			}
		},
		peopleChainDetails: PEOPLE_CHAIN_NETWORK_DETAILS[ENetwork.POLKADOT],
		trackDetails: NETWORK_TRACK_DETAILS[ENetwork.POLKADOT]
	},
	[ENetwork.KUSAMA]: {
		key: ENetwork.KUSAMA,
		govtype: EGovType.OPENGOV,
		parachain: '1000',
		palletInstance: '50',
		name: 'Kusama',
		blockTime: 6000,
		ss58Format: 2,
		subsquidUrl: 'https://squid.subsquid.io/kusama-polkassembly/graphql',
		tokenDecimals: NETWORK_TOKEN_DECIMALS[ENetwork.KUSAMA],
		supportedAssets: {
			'1984': {
				...treasuryAssetsData[EAssets.USDT],
				index: '1984'
			}
		},
		foreignAssets: {},
		tokenSymbol: 'KSM',
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
		peopleChainDetails: PEOPLE_CHAIN_NETWORK_DETAILS[ENetwork.KUSAMA],
		trackDetails: NETWORK_TRACK_DETAILS[ENetwork.KUSAMA]
	},
	[ENetwork.WESTEND]: {
		key: ENetwork.WESTEND,
		name: 'Westend',
		govtype: EGovType.OPENGOV,
		blockTime: 6000,
		ss58Format: 42,
		subsquidUrl: 'https://polkassembly.squids.live/westend-polkassembly/graphql',
		tokenDecimals: NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND],
		tokenSymbol: 'WND',
		rpcEndpoints: [
			{
				name: 'via Dwellir',
				url: 'wss://westend-rpc.dwellir.com'
			},
			{
				name: 'via Dwellir Tunisia',
				url: 'wss://westend-rpc-tn.dwellir.com'
			},
			{
				name: 'via IBP-GeoDNS1',
				url: 'wss://rpc.ibp.network/westend'
			},
			{
				name: 'via IBP-GeoDNS2',
				url: 'wss://rpc.dotters.network/westend'
			},
			{
				name: 'via LuckyFriday',
				url: 'wss://rpc-westend.luckyfriday.io'
			},
			{
				name: 'via OnFinality',
				url: 'wss://westend.api.onfinality.io/public-ws'
			},
			{
				name: 'via Parity',
				url: 'wss://westend-rpc.polkadot.io'
			},
			{
				name: 'via RadiumBlock',
				url: 'wss://westend.public.curie.radiumblock.co/ws'
			},
			{
				name: 'via Stakeworld',
				url: 'wss://wnd-rpc.stakeworld.io'
			}
		],
		supportedAssets: {},
		foreignAssets: {},
		peopleChainDetails: PEOPLE_CHAIN_NETWORK_DETAILS[ENetwork.WESTEND],
		trackDetails: NETWORK_TRACK_DETAILS[ENetwork.WESTEND]
	}
} as const;
