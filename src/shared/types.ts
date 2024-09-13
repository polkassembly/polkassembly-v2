// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export enum ESocial {
	EMAIL = 'email',
	RIOT = 'riot',
	TWITTER = 'twitter',
	TELEGRAM = 'telegram',
	DISCORD = 'discord'
}

export interface IUserSocialDetails {
	type: ESocial;
	link: string;
}

export enum EUserBadge {
	DECENTRALISED_VOICE = 'decentralised_voice',
	FELLOW = 'fellow',
	COUNCIL = 'council',
	ACTIVE_VOTER = 'active_voter',
	WHALE = 'whale'
	// STEADFAST_COMMENTOR = 'Steadfast Commentor',
	// GM_VOTER = 'GM Voter',
	// POPULAR_DELEGATE = 'Popular Delegate'
}

export interface IUserBadgeDetails {
	name: EUserBadge;
	check: boolean;
	unlockedAt: string;
}

export interface IProfileDetails {
	customUsername?: boolean;
	bio?: string;
	badges?: string[];
	title?: string;
	image?: string;
	socialLinks?: IUserSocialDetails[];
	coverImage?: string;
	achievementBadges: IUserBadgeDetails[];
}

export interface IUser2FADetails {
	url: string;
	base32Secret: string;
	enabled: boolean;
	verified: boolean;
}

export enum ENotificationChannel {
	EMAIL = 'email',
	TELEGRAM = 'telegram',
	DISCORD = 'discord',
	ELEMENT = 'element',
	SLACK = 'slack',
	IN_APP = 'in_app'
}

export interface IUserNotificationChannelPreferences {
	name: ENotificationChannel;
	enabled: boolean;
	handle: string;
	verified: boolean;
	verification_token?: string;
}

export interface IUserNotificationTriggerPreferences {
	name: string;
	enabled: boolean;
	[additionalProperties: string]: unknown; // trigger specific properties
}

export interface IUserNotificationSettings {
	channelPreferences: { [channel: string]: IUserNotificationChannelPreferences };
	triggerPreferences: {
		[network: string]: { [index: string]: IUserNotificationTriggerPreferences };
	};
}

export enum ERole {
	ANONYMOUS = 'anonymous',
	ADMIN = 'admin',
	PROPOSAL_BOT = 'proposal_bot',
	USER = 'user',
	EVENT_BOT = 'event_bot',
	MODERATOR = 'moderator'
}

export interface IUser {
	id: number;
	createdAt?: Date;
	updatedAt?: Date;
	isCustomUsername?: boolean;
	email: string;
	isEmailVerified: boolean;
	password: string;
	salt: string;
	profileDetails: IProfileDetails;
	username: string;
	isWeb3Signup: boolean;
	primaryNetwork?: string;
	notificationPreferences?: IUserNotificationSettings;
	twoFactorAuth?: IUser2FADetails;
	roles?: ERole[];
	profileScore: number;
}

export interface IAuthResponse {
	accessToken?: string;
	userId?: number;
	isTFAEnabled?: boolean;
	tfaToken?: string;
	refreshToken?: string;
}

export enum EWallet {
	TALISMAN = 'talisman',
	POLKADOT = 'polkadot-js',
	POLKAGATE = 'polkagate',
	SUBWALLET = 'subwallet-js',
	METAMASK = 'metamask',
	WALLETCONNECT = 'walletconnect',
	NOVAWALLET = 'polkadot-js',
	POLYWALLET = 'polywallet',
	POLKASAFE = 'polkasafe',
	OTHER = ''
}

export interface IRefreshTokenPayload {
	iat: number;
	id: number;
	exp?: number;
	loginAddress?: string;
	loginWallet?: EWallet;
}

export interface IAccessTokenPayload {
	defaultAddress: string;
	addresses: string[];
	sub: string;
	username: string;
	email: string;
	isEmailVerified: boolean;
	iat: number;
	id: number;
	roles: ERole[];
	web3signup: boolean;
	is2FAEnabled?: boolean;
	loginWallet?: EWallet;
	loginAddress?: string;
	exp?: number;
}

export interface IAddressProxyForEntry {
	address: string;
	network: string;
}

export interface IUserAddress {
	address: string;
	default: boolean;
	network: string;
	userId: number;
	createdAt: Date;
	updatedAt: Date;
	wallet?: string;
	isMultisig?: boolean;
	proxyFor?: IAddressProxyForEntry[];
}

export enum ENetwork {
	ROCOCO = 'rococo'
}

export interface IHashedPassword {
	password: string;
	salt: string;
}

export interface NotificationSettings {
	new_proposal: boolean;
	own_proposal: boolean;
	post_created: boolean;
	post_participated: boolean;
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

export enum EAuthCookieNames {
	ACCESS_TOKEN = 'access_token',
	REFRESH_TOKEN = 'refresh_token'
}

export enum ENotificationTrigger {
	VERIFY_EMAIL = 'verifyEmail'
}

export interface IOffChainPost {
	id?: string;
	index?: number;
	hash?: string;
	userId?: number;
	title?: string;
	content?: string;
	createdAt?: Date;
	updatedAt?: Date;
	tags?: string[];
	proposalType: EProposalType;
	network: ENetwork;
}

export enum EProposalStatus {
	Noted = 'Noted',
	Proposed = 'Proposed',
	Tabled = 'Tabled',
	Started = 'Started',
	Passed = 'Passed',
	NotPassed = 'NotPassed',
	Cancelled = 'Cancelled',
	CuratorProposed = 'CuratorProposed',
	CuratorAssigned = 'CuratorAssigned',
	CuratorUnassigned = 'CuratorUnassigned',
	Executed = 'Executed',
	ExecutionFailed = 'ExecutionFailed',
	Used = 'Used',
	Invalid = 'Invalid',
	Missing = 'Missing',
	Reaped = 'Reaped',
	Approved = 'Approved',
	Disapproved = 'Disapproved',
	Closed = 'Closed',
	Awarded = 'Awarded',
	Added = 'Added',
	Rejected = 'Rejected',
	Retracted = 'Retracted',
	Slashed = 'Slashed',
	Active = 'Active',
	Extended = 'Extended',
	Claimed = 'Claimed',
	Unrequested = 'Unrequested',
	Requested = 'Requested',
	Submitted = 'Submitted',
	Killed = 'Killed',
	Cleared = 'Cleared',
	Deciding = 'Deciding',
	ConfirmStarted = 'ConfirmStarted',
	ConfirmAborted = 'ConfirmAborted',
	Confirmed = 'Confirmed',
	DecisionDepositPlaced = 'DecisionDepositPlaced',
	TimedOut = 'TimedOut',
	Opened = 'Opened'
}

export interface IOnChainPostInfo {
	proposer: string;
	status: EProposalStatus;
	description: string;
	createdAt: Date;
}

export interface IPost extends IOffChainPost {
	onChainInfo?: IOnChainPostInfo;
}
