// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from '@polkadot/util';
import { ENetwork, EPostOrigin, EGovType, EAssets } from '@shared/types';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';
import { FaTelegramPlane } from '@react-icons/all-files/fa/FaTelegramPlane';
import { FaYoutube } from '@react-icons/all-files/fa/FaYoutube';
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord';
import { SiGithub } from '@react-icons/all-files/si/SiGithub';
import { TiHome } from '@react-icons/all-files/ti/TiHome';
import { GrReddit } from '@react-icons/all-files/gr/GrReddit';
import { BiCube } from '@react-icons/all-files/bi/BiCube';
import { IconType } from '@react-icons/all-files/lib';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@assets/parachain-logos/kusama-logo.gif';
import WestendLogo from '@assets/parachain-logos/westend-logo.jpg';
import PaseoLogo from '@assets/parachain-logos/paseo-logo.png';
import { StaticImageData } from 'next/image';
import USDCIcon from '@/_assets/icons/usdc.svg';
import USDTIcon from '@/_assets/icons/usdt.svg';
import MYTHIcon from '@/_assets/icons/myth.svg';
import DEDIcon from '@/_assets/icons/ded.png';

interface ISocialLink {
	id: string;
	icon: IconType;
	href: string;
	label: string;
}

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
	icon: StaticImageData;
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

interface IAssethubDetails {
	rpcEndpoints: IRpcEndpoint[];
}

interface INetworkDetails {
	key: ENetwork;
	logo: StaticImageData;
	preimageBaseDeposit?: BN;
	submissionDeposit?: BN;
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
	assethubDetails?: IAssethubDetails;
	trackDetails: Partial<Record<EPostOrigin, ITrackInfo>>;
	socialLinks?: ISocialLink[];
	palletInstance?: string;
	assetHubParaId?: string;
	convictionVotingPeriodInBlocks: BN;
	openGraphImage?: {
		large: string;
		small: string;
	};
}

enum ENetworkSocial {
	HOME = 'home',
	TWITTER = 'twitter',
	DISCORD = 'discord',
	GITHUB = 'github',
	YOUTUBE = 'youtube',
	REDDIT = 'reddit',
	TELEGRAM = 'telegram',
	SUBSCAN = 'subscan'
}

export const treasuryAssetsData: Record<string, ITreasuryAsset> = {
	[EAssets.DED]: { name: 'dot-is-ded', tokenDecimal: 10, symbol: 'DED', icon: DEDIcon },
	[EAssets.USDT]: { name: 'usdt', tokenDecimal: 6, symbol: 'USDT', icon: USDTIcon },
	[EAssets.USDC]: { name: 'usdc', tokenDecimal: 6, symbol: 'USDC', icon: USDCIcon },
	[EAssets.MYTH]: { name: 'mythos', tokenDecimal: 18, symbol: 'MYTH', icon: MYTHIcon }
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
				name: VIA_LUCKYFRIDAY,
				url: 'wss://rpc-people-kusama.luckyfriday.io'
			},
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
				name: VIA_DWELLIR,
				url: 'wss://people-westend-rpc.n.dwellir.com'
			},
			{
				name: VIA_IBP_GEODNS1,
				url: 'wss://sys.ibp.network/people-westend'
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
	},
	[ENetwork.PASEO]: {
		identityMinDeposit: new BN('1000000000000'),
		rpcEndpoints: [
			{
				name: 'via IBP 1',
				url: 'wss://sys.ibp.network/people-paseo'
			},
			{
				name: 'via IBP 2',
				url: 'wss://people-paseo.dotters.network'
			},
			{
				name: 'via Armfoc',
				url: 'wss://people-paseo.rpc.amforc.com'
			}
		]
	}
} as const;

const ASSETHUB_DETAILS: Partial<Record<ENetwork, IAssethubDetails>> = {
	[ENetwork.POLKADOT]: {
		rpcEndpoints: [
			{
				name: VIA_PARITY,
				url: 'wss://polkadot-asset-hub-rpc.polkadot.io'
			},
			{
				name: VIA_DWELLIR,
				url: 'wss://asset-hub-polkadot-rpc.dwellir.com'
			},
			{
				name: VIA_ONFINALITY,
				url: 'wss://statemint.api.onfinality.io/public-ws'
			},
			{
				name: VIA_IBP_GEODNS1,
				url: 'wss://sys.ibp.network/asset-hub-polkadot'
			},
			{
				name: VIA_IBP_GEODNS2,
				url: 'wss://asset-hub-polkadot.dotters.network'
			},
			{
				name: VIA_LUCKYFRIDAY,
				url: 'wss://rpc-asset-hub-polkadot.luckyfriday.io'
			}
		]
	},
	[ENetwork.KUSAMA]: {
		rpcEndpoints: [
			{
				name: VIA_IBP_GEODNS1,
				url: 'wss://sys.ibp.network/asset-hub-kusama'
			},
			{
				name: VIA_PARITY,
				url: 'wss://kusama-asset-hub-rpc.polkadot.io'
			},
			{
				name: VIA_IBP_GEODNS2,
				url: 'wss://asset-hub-kusama.dotters.network'
			},
			{
				name: VIA_DWELLIR,
				url: 'wss://asset-hub-kusama-rpc.dwellir.com'
			},
			{
				name: VIA_LUCKYFRIDAY,
				url: 'wss://rpc-asset-hub-kusama.luckyfriday.io'
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
	[ENetwork.WESTEND]: 12,
	[ENetwork.PASEO]: 10
} as const;

// TODO: update for other networks than polkadot
const NETWORK_TRACK_DETAILS: Record<ENetwork, Partial<Record<EPostOrigin, ITrackInfo>>> = {
	[ENetwork.POLKADOT]: {
		[EPostOrigin.ROOT]: {
			trackId: 0,
			description: ROOT_ORIGIN_DESCRIPTION,
			group: 'Origin',
			name: 'root',
			maxDeciding: 1,
			decisionDeposit: new BN('1000000000000000'),
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
			description: WISH_FOR_CHANGE_DESCRIPTION,
			group: 'Origin',
			name: 'wish_for_change',
			maxDeciding: 10,
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
			confirmPeriod: 100800,
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
			confirmPeriod: 57600,
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
			confirmPeriod: 28800,
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
			maxSpend: new BN('250').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.POLKADOT]))),
			group: 'Treasury',
			name: 'small_tipper',
			maxDeciding: 200,
			decisionDeposit: new BN('10000000000'),
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
			maxSpend: new BN('10000000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.POLKADOT]))),
			maxDeciding: 10,
			decisionDeposit: new BN('10000000000000'),
			preparePeriod: 1200,
			decisionPeriod: 403200,
			confirmPeriod: 100800,
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
			decisionDeposit: new BN('100000000000000'),
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
			group: 'Origin',
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
			group: 'Origin',
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
		[EPostOrigin.WHITELISTED_CALLER]: {
			trackId: 1,
			description: WHITELISTED_CALLER_DESCRIPTION,
			group: 'Origin',
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
			confirmPeriod: 28800,
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
		[EPostOrigin.LEASE_ADMIN]: {
			trackId: 12,
			description: LEASE_ADMIN_DESCRIPTION,
			group: 'Main',
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
			group: 'Origin',
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
			group: 'Main',
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
			group: 'Origin',
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
			group: 'Origin',
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
		[EPostOrigin.SMALL_TIPPER]: {
			trackId: 30,
			description: 'Origin able to spend up to 1 KSM from the treasury at once.',
			group: 'Treasury',
			name: 'small_tipper',
			maxSpend: new BN('1').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.KUSAMA]))),
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
		}
	},
	[ENetwork.WESTEND]: {
		[EPostOrigin.ROOT]: {
			trackId: 0,
			description: ROOT_ORIGIN_DESCRIPTION,
			group: 'Origin',
			name: 'root',
			maxDeciding: 1,
			decisionDeposit: new BN('100000000000000000'),
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
			decisionDeposit: new BN('5000000000000000'),
			preparePeriod: 80,
			decisionPeriod: 200,
			confirmPeriod: 80,
			minEnactmentPeriod: 30,
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
		[EPostOrigin.TREASURER]: {
			trackId: 11,
			description: TREASURER_DESCRIPTION,
			group: 'Origin',
			name: 'treasurer',
			maxDeciding: 10,
			decisionDeposit: new BN('1000000000000000'),
			preparePeriod: 80,
			decisionPeriod: 200,
			confirmPeriod: 80,
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
		[EPostOrigin.LEASE_ADMIN]: {
			trackId: 12,
			description: LEASE_ADMIN_DESCRIPTION,
			group: 'Main',
			name: 'lease_admin',
			maxDeciding: 10,
			decisionDeposit: new BN('5000000000000000'),
			preparePeriod: 80,
			decisionPeriod: 200,
			confirmPeriod: 80,
			minEnactmentPeriod: 30,
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
			decisionDeposit: new BN('5000000000000000'),
			preparePeriod: 80,
			decisionPeriod: 200,
			confirmPeriod: 80,
			minEnactmentPeriod: 30,
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
			decisionDeposit: new BN('5000000000000000'),
			preparePeriod: 80,
			decisionPeriod: 200,
			confirmPeriod: 80,
			minEnactmentPeriod: 30,
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
			decisionDeposit: new BN('5000000000000000'),
			preparePeriod: 80,
			decisionPeriod: 200,
			confirmPeriod: 80,
			minEnactmentPeriod: 30,
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
			decisionDeposit: new BN('10000000000000000'),
			preparePeriod: 80,
			decisionPeriod: 140,
			confirmPeriod: 80,
			minEnactmentPeriod: 30,
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
			decisionDeposit: new BN('50000000000000000'),
			preparePeriod: 80,
			decisionPeriod: 200,
			confirmPeriod: 80,
			minEnactmentPeriod: 30,
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
		[EPostOrigin.SMALL_TIPPER]: {
			trackId: 30,
			description: 'Origin able to spend up to 250 WND from the treasury at once',
			group: 'Treasury',
			name: 'small_tipper',
			maxSpend: new BN('250').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND]))),
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
		[EPostOrigin.BIG_TIPPER]: {
			trackId: 31,
			description: 'Origin able to spend up to 1000 WND from the treasury at once',
			group: 'Treasury',
			name: 'big_tipper',
			maxSpend: new BN('1000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND]))),
			maxDeciding: 100,
			decisionDeposit: new BN('300000000000'),
			preparePeriod: 40,
			decisionPeriod: 140,
			confirmPeriod: 120,
			minEnactmentPeriod: 30,
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
		[EPostOrigin.SMALL_SPENDER]: {
			trackId: 32,
			description: 'Origin able to spend up to 10,000 WND from the treasury at once',
			group: 'Treasury',
			name: 'small_spender',
			maxSpend: new BN('10000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND]))),
			maxDeciding: 50,
			decisionDeposit: new BN('3000000000000'),
			preparePeriod: 100,
			decisionPeriod: 200,
			confirmPeriod: 100,
			minEnactmentPeriod: 50,
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
		[EPostOrigin.MEDIUM_SPENDER]: {
			trackId: 33,
			description: 'Origin able to spend up to 100,000 WND from the treasury at once',
			group: 'Treasury',
			name: 'medium_spender',
			maxSpend: new BN('100000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND]))),
			maxDeciding: 50,
			decisionDeposit: new BN('6000000000000'),
			preparePeriod: 100,
			decisionPeriod: 200,
			confirmPeriod: 120,
			minEnactmentPeriod: 50,
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
		[EPostOrigin.BIG_SPENDER]: {
			trackId: 34,
			description: 'Origin able to spend up to 1,000,000 WND from the treasury at once',
			group: 'Treasury',
			name: 'big_spender',
			maxSpend: new BN('1000000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND]))),
			maxDeciding: 50,
			decisionDeposit: new BN('12000000000000'),
			preparePeriod: 100,
			decisionPeriod: 200,
			confirmPeriod: 140,
			minEnactmentPeriod: 50,
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
		}
	},
	[ENetwork.PASEO]: {
		[EPostOrigin.ROOT]: {
			trackId: 0,
			description: ROOT_ORIGIN_DESCRIPTION,
			group: 'Origin',
			name: 'root',
			maxDeciding: 1,
			decisionDeposit: new BN('1000000000000000'),
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
			description: WISH_FOR_CHANGE_DESCRIPTION,
			group: 'Origin',
			name: 'wish_for_change',
			maxDeciding: 10,
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
			confirmPeriod: 100800,
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
			confirmPeriod: 57600,
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
			confirmPeriod: 28800,
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
			maxSpend: new BN('250').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.POLKADOT]))),
			group: 'Treasury',
			name: 'small_tipper',
			maxDeciding: 200,
			decisionDeposit: new BN('10000000000'),
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
			group: 'Origin',
			name: 'treasurer',
			maxSpend: new BN('10000000').mul(new BN(10).pow(new BN(NETWORK_TOKEN_DECIMALS[ENetwork.POLKADOT]))),
			maxDeciding: 10,
			decisionDeposit: new BN('10000000000000'),
			preparePeriod: 1200,
			decisionPeriod: 403200,
			confirmPeriod: 100800,
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
			decisionDeposit: new BN('100000000000000'),
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
	}
} as const;

const SocialIcons = {
	Discord: FaDiscord,
	Github: SiGithub,
	Home: TiHome,
	Reddit: GrReddit,
	Telegram: FaTelegramPlane,
	Twitter: FaTwitter,
	Youtube: FaYoutube,
	Subscan: BiCube
} as const;

const networkSocialLinks: Record<ENetwork, ISocialLink[]> = {
	[ENetwork.POLKADOT]: [
		{
			id: ENetworkSocial.HOME,
			icon: SocialIcons.Home,
			href: 'https://polkadot.network/',
			label: 'Polkadot Homepage'
		},
		{
			id: ENetworkSocial.TWITTER,
			icon: SocialIcons.Twitter,
			href: 'https://twitter.com/polkadot',
			label: 'Twitter'
		},
		{
			id: ENetworkSocial.DISCORD,
			icon: SocialIcons.Discord,
			href: 'https://discord.gg/polkadot',
			label: 'Discord'
		},
		{
			id: ENetworkSocial.GITHUB,
			icon: SocialIcons.Github,
			href: 'https://github.com/polkadot-js',
			label: 'GitHub'
		},
		{
			id: ENetworkSocial.YOUTUBE,
			icon: SocialIcons.Youtube,
			href: 'https://www.youtube.com/channel/UCB7PbjuZLEba_znc7mEGNgw',
			label: 'YouTube'
		},
		{
			id: ENetworkSocial.REDDIT,
			icon: SocialIcons.Reddit,
			href: 'https://www.reddit.com/r/polkadot',
			label: 'Reddit'
		},
		{
			id: ENetworkSocial.TELEGRAM,
			icon: SocialIcons.Telegram,
			href: 'https://t.me/PolkadotOfficial',
			label: 'Telegram'
		},
		{
			id: ENetworkSocial.SUBSCAN,
			icon: SocialIcons.Subscan,
			href: 'https://polkadot.subscan.io/',
			label: 'Subscan'
		}
	],
	[ENetwork.KUSAMA]: [
		{
			id: ENetworkSocial.HOME,
			icon: SocialIcons.Home,
			href: 'https://kusama.network/',
			label: 'Kusama Homepage'
		},
		{
			id: ENetworkSocial.TWITTER,
			icon: SocialIcons.Twitter,
			href: 'https://twitter.com/kusamanetwork',
			label: 'Twitter'
		},
		{
			id: ENetworkSocial.DISCORD,
			icon: SocialIcons.Discord,
			href: 'https://discord.com/invite/kusama',
			label: 'Discord'
		},
		{
			id: ENetworkSocial.GITHUB,
			icon: SocialIcons.Github,
			href: 'https://github.com/paritytech/polkadot',
			label: 'GitHub'
		},
		{
			id: ENetworkSocial.YOUTUBE,
			icon: SocialIcons.Youtube,
			href: 'https://www.youtube.com/channel/UCq4MRrQhdoIR0b44GxcCPxw',
			label: 'YouTube'
		},
		{
			id: ENetworkSocial.REDDIT,
			icon: SocialIcons.Reddit,
			href: 'https://www.reddit.com/r/Kusama/',
			label: 'Reddit'
		},
		{
			id: ENetworkSocial.TELEGRAM,
			icon: SocialIcons.Telegram,
			href: 'https://t.me/kusamanetworkofficial',
			label: 'Telegram'
		},
		{
			id: ENetworkSocial.SUBSCAN,
			icon: SocialIcons.Subscan,
			href: 'https://kusama.subscan.io/',
			label: 'Subscan'
		}
	],
	[ENetwork.WESTEND]: [],
	[ENetwork.PASEO]: []
} as const;

export const NETWORKS_DETAILS: Record<ENetwork, INetworkDetails> = {
	[ENetwork.POLKADOT]: {
		key: ENetwork.POLKADOT,
		logo: PolkadotLogo,
		preimageBaseDeposit: new BN('400000000000'),
		submissionDeposit: new BN('10000000000'),
		name: 'Polkadot',
		govtype: EGovType.OPENGOV,
		assetHubParaId: '1000',
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
		trackDetails: NETWORK_TRACK_DETAILS[ENetwork.POLKADOT],
		socialLinks: networkSocialLinks[ENetwork.POLKADOT],
		assethubDetails: ASSETHUB_DETAILS[ENetwork.POLKADOT],
		convictionVotingPeriodInBlocks: new BN('100800'),
		openGraphImage: {
			large: 'https://firebasestorage.googleapis.com/v0/b/polkassembly-v2.firebasestorage.app/o/public%2Fpolkadot.png?alt=media&token=02231f8b-5206-4bff-ad78-9a64d81d6580',
			small:
				'https://firebasestorage.googleapis.com/v0/b/polkassembly-v2.firebasestorage.app/o/public%2Fpolkassembly-small.jpg?alt=media&token=63accae8-ea14-4705-817b-92c7bf80ccce'
		}
	},
	[ENetwork.KUSAMA]: {
		key: ENetwork.KUSAMA,
		logo: KusamaLogo,
		submissionDeposit: new BN('33333333333'),
		govtype: EGovType.OPENGOV,
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
		assethubDetails: ASSETHUB_DETAILS[ENetwork.KUSAMA],
		trackDetails: NETWORK_TRACK_DETAILS[ENetwork.KUSAMA],
		socialLinks: networkSocialLinks[ENetwork.KUSAMA],
		convictionVotingPeriodInBlocks: new BN('100800')
	},
	[ENetwork.WESTEND]: {
		key: ENetwork.WESTEND,
		logo: WestendLogo,
		submissionDeposit: new BN('30000000000'),
		name: 'Westend',
		govtype: EGovType.OPENGOV,
		blockTime: 6000,
		ss58Format: 42,
		subsquidUrl: 'https://polkassembly.squids.live/westend-polkassembly/graphql',
		tokenDecimals: NETWORK_TOKEN_DECIMALS[ENetwork.WESTEND],
		tokenSymbol: 'WND',
		rpcEndpoints: [
			{
				name: VIA_DWELLIR,
				url: 'wss://westend-rpc.dwellir.com'
			},
			{
				name: `${VIA_DWELLIR} Tunisia`,
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
		trackDetails: NETWORK_TRACK_DETAILS[ENetwork.WESTEND],
		convictionVotingPeriodInBlocks: new BN('100800')
	},
	[ENetwork.PASEO]: {
		key: ENetwork.PASEO,
		logo: PaseoLogo,
		submissionDeposit: new BN('10000000000'),
		name: 'Paseo',
		govtype: EGovType.OPENGOV,
		assetHubParaId: '1000',
		palletInstance: '50',
		blockTime: 6000,
		ss58Format: 0,
		subsquidUrl: 'https://polkassembly.squids.live/paseo-polkassembly@v1/api/graphql',
		tokenDecimals: NETWORK_TOKEN_DECIMALS[ENetwork.PASEO],
		tokenSymbol: 'PAS',
		rpcEndpoints: [
			{
				name: VIA_DWELLIR,
				url: 'wss://paseo-rpc.dwellir.com'
			},
			{
				name: 'via Amforc',
				url: 'wss://paseo.rpc.amforc.com'
			},
			{
				name: 'via IBP 1',
				url: 'wss://rpc.ibp.network/paseo'
			},
			{
				name: 'via IBP 2',
				url: 'wss://rpc.dotters.network/paseo'
			},
			{
				name: 'via Stakeworld',
				url: 'wss://pas-rpc.stakeworld.io'
			}
		],
		peopleChainDetails: PEOPLE_CHAIN_NETWORK_DETAILS[ENetwork.PASEO],
		trackDetails: NETWORK_TRACK_DETAILS[ENetwork.PASEO],
		socialLinks: networkSocialLinks[ENetwork.PASEO],
		convictionVotingPeriodInBlocks: new BN('100800'),
		openGraphImage: {
			large: 'https://firebasestorage.googleapis.com/v0/b/polkassembly-v2.firebasestorage.app/o/public%2Fpaseo.png?alt=media&token=02231f8b-5206-4bff-ad78-9a64d81d6580',
			small:
				'https://firebasestorage.googleapis.com/v0/b/polkassembly-v2.firebasestorage.app/o/public%2Fpolkassembly-small.jpg?alt=media&token=63accae8-ea14-4705-817b-92c7bf80ccce'
		},
		supportedAssets: {},
		foreignAssets: {}
	}
} as const;
