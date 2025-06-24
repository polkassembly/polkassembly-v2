// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export enum ENetwork {
	POLKADOT = 'polkadot',
	KUSAMA = 'kusama',
	PASEO = 'paseo'
}

export enum EWebhookEvent {
	CACHE_REFRESH = 'cache_refresh'
}

export enum EHttpHeaderKey {
	SKIP_CACHE = 'x-skip-cache',
	TOOLS_PASSPHRASE = 'x-tools-passphrase',
	NETWORK = 'x-network'
}

export interface IV1User {
	id: number;
	custom_username: boolean;
	email: string;
	password: string;
	salt: string;
	username: string;
	web3_signup: boolean;
}

export interface IV2User {
	id: number;
	createdAt?: Date;
	updatedAt?: Date;
	email: string;
	isEmailVerified: boolean;
	password: string;
	salt: string;
	username: string;
	isWeb3Signup: boolean;
	primaryNetwork?: ENetwork;
	// add other fields here
}

export enum EWallet {
	POLKADOT = 'polkadot-js',
	SUBWALLET = 'subwallet-js',
	TALISMAN = 'talisman',
	POLKAGATE = 'polkagate',
	NOVAWALLET = 'nova',
	OTHER = ''
	// METAMASK = 'metamask',
	// WALLETCONNECT = 'walletconnect',
	// POLYWALLET = 'polywallet',
	// POLKASAFE = 'polkasafe',
}

export interface IV2UserAddress {
	address: string;
	default: boolean;
	network: ENetwork;
	userId: number;
	createdAt?: Date;
	updatedAt?: Date;
	wallet?: EWallet;
	isMultisig?: boolean;
	profileScore?: number;
}

export interface IV1UserAddress {
	address: string;
	default: boolean;
	network: string;
	public_key: string;
	sign_message: string;
	user_id: number;
	verified: boolean;
	is_erc20?: boolean;
	wallet?: string;
	isMultisig?: boolean;
	proxy_for?: unknown[];
}

export enum ECacheRefreshType {
	OFF_CHAIN_POSTS = 'off_chain_posts',
	REFERENDA_V2 = 'referenda_v2',
	BOUNTY = 'bounty',
	LISTING = 'listing'
}

export enum EProposalType {
	ALLIANCE_MOTION = 'AllianceMotion',
	ANNOUNCEMENT = 'Announcement',
	DEMOCRACY_PROPOSAL = 'DemocracyProposal',
	TECH_COMMITTEE_PROPOSAL = 'TechCommitteeProposal',
	TREASURY_PROPOSAL = 'TreasuryProposal',
	REFERENDUM = 'Referendum',
	FELLOWSHIP_REFERENDUM = 'FellowshipReferendum',
	COUNCIL_MOTION = 'CouncilMotion',
	BOUNTY = 'Bounty',
	TIP = 'Tip',
	CHILD_BOUNTY = 'ChildBounty',
	REFERENDUM_V2 = 'ReferendumV2',
	TECHNICAL_COMMITTEE = 'TechnicalCommittee',
	COMMUNITY = 'Community',
	UPGRADE_COMMITTEE = 'UpgradeCommittee',
	ADVISORY_COMMITTEE = 'AdvisoryCommittee',
	DISCUSSION = 'Discussion',
	GRANT = 'Grant'
}

export enum EDataSource {
	POLKASSEMBLY = 'polkassembly',
	SUBSQUARE = 'subsquare'
}

export enum EOffChainPostTopic {
	GENERAL = 'general',
	AUCTION_ADMIN = 'auctionAdmin',
	GENERAL_ADMIN = 'generalAdmin',
	GOVERNANCE = 'governance',
	ROOT = 'root',
	STAKING_ADMIN = 'stakingAdmin',
	TREASURY = 'treasury',
	FELLOWSHIP = 'fellowship',
	COUNCIL = 'council',
	DEMOCRACY = 'democracy',
	TECHNICAL_COMMITTEE = 'technicalCommittee',
	WHITELIST = 'whitelist'
}

export enum EPostOrigin {
	AUCTION_ADMIN = 'AuctionAdmin',
	BIG_SPENDER = 'BigSpender',
	BIG_TIPPER = 'BigTipper',
	CANDIDATES = 'Candidates',
	EXPERTS = 'Experts',
	FELLOWS = 'Fellows',
	FELLOWSHIP_ADMIN = 'FellowshipAdmin',
	GENERAL_ADMIN = 'GeneralAdmin',
	GRAND_MASTERS = 'GrandMasters',
	LEASE_ADMIN = 'LeaseAdmin',
	MASTERS = 'Masters',
	MEDIUM_SPENDER = 'MediumSpender',
	MEMBERS = 'Members',
	PROFICIENTS = 'Proficients',
	REFERENDUM_CANCELLER = 'ReferendumCanceller',
	REFERENDUM_KILLER = 'ReferendumKiller',
	ROOT = 'Root',
	SENIOR_EXPERTS = 'SeniorExperts',
	SENIOR_FELLOWS = 'SeniorFellows',
	SENIOR_MASTERS = 'SeniorMasters',
	SMALL_SPENDER = 'SmallSpender',
	SMALL_TIPPER = 'SmallTipper',
	STAKING_ADMIN = 'StakingAdmin',
	TREASURER = 'Treasurer',
	WHITELISTED_CALLER = 'WhitelistedCaller',
	WISH_FOR_CHANGE = 'WishForChange',
	FAST_GENERAL_ADMIN = 'FastGeneralAdmin'
}

export interface IAlgoliaPost extends Record<string, unknown> {
	objectID: string;
	title: string;
	createdAtTimestamp?: number;
	updatedAtTimestamp?: number;
	tags: string[];
	dataSource: string;
	proposalType: string;
	network: string;
	topic: string;
	lastCommentAtTimestamp?: number;
	userId: number;
	hash: string;
	index: number;
	parsedContent: string;
	titleAndContentHash: string;
	proposer: string;
	origin: EPostOrigin;
}
