// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import westendLogo from '@assets/parachain-logos/westend-logo.jpg';
import { ChainProps, EAssets } from '../types';

export const network = {
	ROCOCO: 'rococo'
};

export const tokenSymbol = {
	ROC: 'ROC'
};

export const PostOrigin = {
	AUCTION_ADMIN: 'AuctionAdmin',
	BIG_SPENDER: 'BigSpender',
	BIG_TIPPER: 'BigTipper',
	CANDIDATES: 'Candidates',
	EXPERTS: 'Experts',
	FELLOWS: 'Fellows',
	FELLOWSHIP_ADMIN: 'FellowshipAdmin',
	GENERAL_ADMIN: 'GeneralAdmin',
	GRAND_MASTERS: 'GrandMasters',
	LEASE_ADMIN: 'LeaseAdmin',
	MASTERS: 'Masters',
	MEDIUM_SPENDER: 'MediumSpender',
	MEMBERS: 'Members',
	PROFICIENTS: 'Proficients',
	REFERENDUM_CANCELLER: 'ReferendumCanceller',
	REFERENDUM_KILLER: 'ReferendumKiller',
	ROOT: 'root',
	SENIOR_EXPERTS: 'SeniorExperts',
	SENIOR_FELLOWS: 'SeniorFellows',
	SENIOR_MASTERS: 'SeniorMasters',
	SMALL_SPENDER: 'SmallSpender',
	SMALL_TIPPER: 'SmallTipper',
	STAKING_ADMIN: 'StakingAdmin',
	TREASURER: 'Treasurer',
	WHITELISTED_CALLER: 'WhitelistedCaller',
	WISH_FOR_CHANGE: 'WishForChange',
	FAST_GENERAL_ADMIN: 'FastGeneralAdmin'
};

export const treasuryAssets = {
	DED: { name: 'dot-is-ded', img: '/assets/icons/ded-asset.png', tokenDecimal: 10, symbol: EAssets.DED },
	USDT: {
		name: 'usdt',
		img: '/assets/icons/usdt.svg',
		tokenDecimal: 6,
		symbol: EAssets.USDT
	},
	USDC: {
		name: 'usdc',
		img: '/assets/icons/usdc.svg',
		tokenDecimal: 6,
		symbol: EAssets.USDC
	}
};

export const chainProperties: Record<string, ChainProps> = {
	[network.ROCOCO]: {
		preImageBaseDeposit: '130000000000',
		blockTime: 6000,
		category: 'test',
		chainId: 0,
		logo: westendLogo,
		rpcEndpoint: 'wss://rococo-rpc.polkadot.io',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.ROC,
		subsquidUrl: 'https://squid.subsquid.io/rococo-polkassembly/graphql',
		treasuryProposalBondPercent: null,
		treasuryProposalMinBond: null,
		treasuryProposalMaxBond: null,
		externalLinks: 'https://rococo.api.subscan.io',
		rpcEndpoints: [
			{
				label: 'via Parity',
				key: 'wss://rococo-rpc.polkadot.io'
			}
		],
		supportedAssets: [
			{ ...treasuryAssets.DED, genralIndex: '30' },
			{ ...treasuryAssets.USDT, genralIndex: '1984' },
			{ ...treasuryAssets.USDC, genralIndex: '1337' }
		],
		gTag: null,
		tracks: {
			[PostOrigin.ROOT]: {
				trackId: 0,
				description: 'Origin for General network-wide improvements',
				group: 'Main',
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
			[PostOrigin.BIG_SPENDER]: {
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
			[PostOrigin.MEDIUM_SPENDER]: {
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
			[PostOrigin.SMALL_SPENDER]: {
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
			[PostOrigin.BIG_TIPPER]: {
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
			[PostOrigin.SMALL_TIPPER]: {
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
			[PostOrigin.TREASURER]: {
				trackId: 11,
				description: 'Origin for spending (any amount of) funds until the upper limit of  10,000,000 DOT',
				group: 'Treasury',
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
			[PostOrigin.WHITELISTED_CALLER]: {
				trackId: 1,
				description: 'Origin commanded by any members of the Polkadot Fellowship (no Dan grade needed)',
				group: 'Whitelist',
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
			[PostOrigin.STAKING_ADMIN]: {
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
			[PostOrigin.LEASE_ADMIN]: {
				trackId: 12,
				description: 'Origin able to force slot leases',
				group: 'Governance',
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
			[PostOrigin.FELLOWSHIP_ADMIN]: {
				trackId: 13,
				description: 'Origin for managing the composition of the fellowship',
				group: 'Whitelist',
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
			[PostOrigin.GENERAL_ADMIN]: {
				trackId: 14,
				description: 'Origin for managing the registrar',
				group: 'Governance',
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
			[PostOrigin.AUCTION_ADMIN]: {
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
			[PostOrigin.REFERENDUM_CANCELLER]: {
				trackId: 20,
				description: 'Origin able to cancel referenda.',
				group: 'Governance',
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
			[PostOrigin.REFERENDUM_KILLER]: {
				trackId: 21,
				description: 'Origin able to kill referenda.',
				group: 'Governance',
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
		}
	}
};
