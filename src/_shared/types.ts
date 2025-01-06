// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import { RegistrationJudgement } from '@polkadot/types/interfaces';
import { StatusCodes } from 'http-status-codes';

export enum ENetwork {
	KUSAMA = 'kusama',
	POLKADOT = 'polkadot'
}

export enum EGovType {
	GOV_1 = 'gov_1',
	OPENGOV = 'opengov'
}

export enum ESocial {
	EMAIL = 'email',
	RIOT = 'riot',
	TWITTER = 'twitter',
	TELEGRAM = 'telegram',
	DISCORD = 'discord'
}

export interface ITrackCounts {
	[trackName: string]: number;
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

export interface IUserTFADetails {
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
	primaryNetwork?: ENetwork;
	notificationPreferences?: IUserNotificationSettings;
	twoFactorAuth?: IUserTFADetails;
	roles?: ERole[];
	profileScore: number;
}

export interface IPublicUser {
	id: number;
	username: string;
	profileScore: number;
	addresses: string[];
}

export interface IAuthResponse {
	accessToken?: string;
	isTFAEnabled?: boolean;
	tfaToken?: string;
	refreshToken?: string;
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
	isTFAEnabled?: boolean;
	loginWallet?: EWallet;
	loginAddress?: string;
	exp?: number;
}

export interface IAddressProxyForEntry {
	address: string;
	network: ENetwork;
}

export interface IUserAddress {
	address: string;
	default: boolean;
	network: ENetwork;
	userId: number;
	createdAt: Date;
	updatedAt: Date;
	wallet?: string;
	isMultisig?: boolean;
	proxyFor?: IAddressProxyForEntry[];
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

export enum ETheme {
	LIGHT = 'light',
	DARK = 'dark'
}

export enum ELocales {
	SPANISH = 'es',
	ENGLISH = 'en'
}

export enum ECookieNames {
	ACCESS_TOKEN = 'access_token',
	REFRESH_TOKEN = 'refresh_token',
	THEME = 'theme',
	LOCALE = 'locale'
}

export interface IUserPreferences {
	theme: ETheme;
	locale: ELocales;
	wallet?: EWallet;
	address?: InjectedAccount;
}

export enum ENotificationTrigger {
	VERIFY_EMAIL = 'verifyEmail'
}

export enum EDataSource {
	POLKASSEMBLY = 'polkassembly',
	SUBSQUARE = 'subsquare'
}

export enum EReaction {
	like = 'like',
	dislike = 'dislike'
}

export interface IPostOffChainMetrics {
	reactions: Record<EReaction, number>;
	comments: number;
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
	dataSource: EDataSource;
	proposalType: EProposalType;
	network: ENetwork;
	metrics?: IPostOffChainMetrics;
}

export enum EProposalStatus {
	Unknown = 'Unknown',
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

export enum EVoteDecision {
	AYE = 'aye',
	NAY = 'nay',
	ABSTAIN = 'abstain',
	SPLIT = 'split',
	SPLIT_ABSTAIN = 'splitAbstain'
}

export interface IVoteMetrics {
	[EVoteDecision.AYE]: { count: number; value: string };
	[EVoteDecision.NAY]: { count: number; value: string };
	support: { value: string };
	bareAyes: { value: string };
}

export interface IBeneficiary {
	address: string;
	amount: string;
}

export interface IRequestedAssetData {
	assetId: string | null;
	amount: string;
	beneficiaries: IBeneficiary[];
}

export interface IOnChainPostInfo {
	proposer: string;
	status: EProposalStatus;
	createdAt?: Date;
	index?: number;
	hash?: string;
	origin?: EPostOrigin;
	description?: string;
	voteMetrics?: IVoteMetrics;
	requestedAssetData?: IRequestedAssetData;
}

export interface IPost extends IOffChainPost {
	onChainInfo?: IOnChainPostInfo;
}

export interface IOnChainPostListing {
	createdAt: Date;
	description: string;
	index: number;
	origin: string;
	proposer: string;
	status: EProposalStatus;
	type: EProposalType;
	hash: string;
	voteMetrics?: IVoteMetrics;
	requestedAssetData?: IRequestedAssetData;
}

export interface IPostListing extends IOffChainPost {
	onChainInfo?: IOnChainPostListing;
}

export interface IOnChainPostListingResponse {
	posts: IPostListing[];
	totalCount: number;
}

export enum ESignupSteps {
	USERNAME = 'Create Username',
	PASSWORD = 'Set Password'
}

export interface IGenerateTFAResponse extends Omit<IUserTFADetails, 'url' | 'enabled' | 'verified'> {
	otpauthUrl: string;
}

export type TRPCEndpoint = {
	key: string;
	label: string;
};

export interface ISidebarMenuItem {
	title: string;
	url: string;
	icon?: string;
	isNew?: boolean;
	count?: number;
	items?: ISidebarMenuItem[];
	key?: string;
	heading?: string;
}

export interface IErrorResponse {
	status: StatusCodes;
	message: string;
	name: string;
}

export enum EApiRoute {
	WEB2_LOGIN = 'WEB2_LOGIN',
	WEB2_SIGNUP = 'WEB2_SIGNUP',
	WEB3_LOGIN = 'WEB3_LOGIN',
	REFRESH_ACCESS_TOKEN = 'REFRESH_ACCESS_TOKEN',
	USER_EXISTS = 'USER_EXISTS',
	TFA_LOGIN = 'TFA_LOGIN',
	GEN_TFA_TOKEN = 'GEN_TFA_TOKEN',
	VERIFY_TFA_TOKEN = 'VERIFY_TFA_TOKEN',
	LOGOUT = 'LOGOUT',
	POSTS_LISTING = 'POSTS_LISTING',
	FETCH_PROPOSAL_DETAILS = 'FETCH_PROPOSAL_DETAILS',
	GET_COMMENTS = 'GET_COMMENTS',
	ADD_COMMENT = 'ADD_COMMENT'
}

export enum EWeb3LoginScreens {
	SELECT_WALLET,
	FETCH_CONFIRMATION,
	SELECT_ADDRESS
}

export enum EActivityFeedTab {
	EXPLORE = 'explore',
	FOLLOWING = 'following'
}

export enum EListingTab {
	ANALYTICS = 'ANALYTICS',
	EXTERNAL = 'EXTERNAL',
	REFERENDA = 'REFERENDA',
	POLKASSEMBLY = 'POLKASSEMBLY'
}

export interface IComment {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	userId: number;
	content: Record<string, unknown>;
	network: ENetwork;
	proposalType: EProposalType;
	indexOrHash: string;
	parentCommentId: string | null;
	isDeleted: boolean;
	address: string | null;
	dataSource: EDataSource;
}

export interface ICommentResponse extends IComment {
	user: IPublicUser;
	children?: ICommentResponse[];
}

export interface IOnChainIdentity {
	display: string;
	legal: string;
	email: string;
	twitter: string;
	web: string;
	github: string;
	discord: string;
	matrix: string;
	displayParent: string;
	nickname: string;
	isIdentitySet: boolean;
	isVerified: boolean;
	isGood: boolean;
	judgements: RegistrationJudgement[];
	verifiedByPolkassembly: boolean;
	parentProxyTitle: string | null;
	parentProxyAddress: string;
}

export interface IReaction {
	id: string;
	network: ENetwork;
	proposalType: EProposalType;
	indexOrHash: string;
	userId: number;
	reaction: EReaction;
	createdAt: Date;
	updatedAt: Date;
}

export interface IVoteData {
	balanceValue: string;
	decision: EVoteDecision;
	lockPeriod: number;
	createdAt: Date;
	voterAddress: string;
	selfVotingPower?: string;
	totalVotingPower?: string;
	delegatedVotingPower?: string;
}
