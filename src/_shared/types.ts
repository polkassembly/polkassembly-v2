// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OutputData } from '@editorjs/editorjs';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { RegistrationJudgement } from '@polkadot/types/interfaces';
import { StatusCodes } from 'http-status-codes';

export enum ENetwork {
	KUSAMA = 'kusama',
	POLKADOT = 'polkadot',
	WESTEND = 'westend'
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
	platform: ESocial;
	url: string;
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
	unlockedAt: Date;
}

export interface IProfileDetails {
	bio?: string;
	badges?: string[];
	title?: string;
	image?: string;
	publicSocialLinks?: IUserSocialDetails[];
	coverImage?: string;
	achievementBadges?: IUserBadgeDetails[];
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
	createdAt?: Date;
	username: string;
	profileScore: number;
	addresses: string[];
	rank: number;
	profileDetails: IProfileDetails;
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

export interface IUserClientData extends IAccessTokenPayload {
	publicUser?: IPublicUser;
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
	createdAt?: Date;
	updatedAt?: Date;
	wallet?: EWallet;
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
	ENGLISH = 'en',
	CHINESE = 'zh',
	GERMAN = 'de',
	JAPANESE = 'ja'
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
	rpcIndex?: number;
}

export enum ENotificationTrigger {
	VERIFY_EMAIL = 'verifyEmail',
	RESET_PASSWORD = 'resetPassword'
}

export enum EDataSource {
	POLKASSEMBLY = 'polkassembly',
	SUBSQUARE = 'subsquare'
}

export enum EReaction {
	like = 'like',
	dislike = 'dislike'
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
	commentId?: string;
}

export interface IPostOffChainMetrics {
	reactions: Record<EReaction, number>;
	comments: number;
}

export enum EAllowedCommentor {
	ALL = 'all',
	ONCHAIN_VERIFIED = 'onchain_verified',
	NONE = 'none'
}

export interface IPostLink {
	indexOrHash: string;
	proposalType: EProposalType;
}

export interface IContentSummary {
	id: string;
	network: ENetwork;
	proposalType: EProposalType;
	indexOrHash: string;
	postSummary?: string;
	commentsSummary?: string;
	isSpam?: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export enum EOffChainPostTopic {
	GENERAL = 'general',
	AUCTION_ADMIN = 'auctionAdmin',
	GENERAL_ADMIN = 'generalAdmin',
	GOVERNANCE = 'governance',
	ROOT = 'root',
	STAKING_ADMIN = 'stakingAdmin',
	TREASURY = 'treasury',
	FELLOWSHIP = 'fellowship'
}

export interface ITag {
	value: string;
	lastUsedAt: Date;
	network: ENetwork;
}

export interface IOffChainPost {
	id?: string;
	index?: number;
	hash?: string;
	userId?: number;
	title?: string;
	content?: OutputData;
	htmlContent: string;
	markdownContent: string;
	createdAt?: Date;
	updatedAt?: Date;
	tags?: ITag[];
	dataSource: EDataSource;
	proposalType: EProposalType;
	network: ENetwork;
	metrics?: IPostOffChainMetrics;
	allowedCommentor: EAllowedCommentor;
	lastCommentAt?: Date;
	isDeleted: boolean;
	createdOnPolkassembly?: boolean;
	linkedPost?: IPostLink;
	publicUser?: IPublicUser;
	topic?: EOffChainPostTopic;
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
	Opened = 'Opened',
	Created = 'Created'
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
	assetId: string | null;
}

export interface IStatusHistoryItem {
	status: EProposalStatus;
	timestamp: Date;
	block: number;
}

export interface IOnChainPostInfo {
	proposer: string;
	status: EProposalStatus;
	createdAt?: Date;
	index?: number;
	hash?: string;
	origin: EPostOrigin;
	description?: string;
	voteMetrics?: IVoteMetrics;
	beneficiaries?: IBeneficiary[];
	preparePeriodEndsAt?: Date;
	decisionPeriodEndsAt?: Date;
	confirmationPeriodEndsAt?: Date;
	timeline?: IStatusHistoryItem[];
	preimageArgs?: Record<string, unknown>;
}

export interface IPost extends IOffChainPost {
	onChainInfo?: IOnChainPostInfo;
	publicUser?: IPublicUser;
	userReaction?: IReaction;
	reactions?: IReaction[];
}

export interface IOnChainPostListing {
	createdAt: Date;
	description: string;
	index?: number;
	origin: EPostOrigin;
	proposer: string;
	status: EProposalStatus;
	type: EProposalType;
	hash?: string;
	voteMetrics?: IVoteMetrics;
	beneficiaries?: IBeneficiary[];
	decisionPeriodEndsAt?: Date;
	preparePeriodEndsAt?: Date;
}

export interface IPostListing extends IOffChainPost {
	onChainInfo?: IOnChainPostListing;
	publicUser?: IPublicUser;
	userReaction?: IReaction;
}

export interface IGenericListingResponse<T> {
	items: T[];
	totalCount: number;
}

export enum ESignupSteps {
	USERNAME = 'Create Username',
	PASSWORD = 'Set Password'
}

export interface IGenerateTFAResponse extends Omit<IUserTFADetails, 'url' | 'enabled' | 'verified'> {
	otpauthUrl: string;
}

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

export enum EWeb3LoginScreens {
	SELECT_WALLET,
	FETCH_CONFIRMATION,
	SELECT_ADDRESS
}

export enum EActivityFeedTab {
	EXPLORE = 'EXPLORE',
	FOLLOWING = 'FOLLOWING'
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
	content: OutputData;
	htmlContent: string;
	markdownContent: string;
	network: ENetwork;
	proposalType: EProposalType;
	indexOrHash: string;
	parentCommentId: string | null;
	isDeleted: boolean;
	address: string | null;
	dataSource: EDataSource;
	isSpam?: boolean;
}

export interface ICommentResponse extends IComment {
	user: Omit<IPublicUser, 'rank'>;
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

export enum EAssets {
	DED = 'DED',
	USDT = 'USDT',
	USDC = 'USDC'
}

export enum EPostDetailsTab {
	DESCRIPTION = 'description',
	TIMELINE = 'timeline',
	ONCHAIN_INFO = 'onchain info'
}

export enum EActivityName {
	// On-chain Activities
	VOTED_ON_PROPOSAL = 'voted_on_proposal',
	CREATED_PROPOSAL = 'created_proposal',
	CREATED_TIP = 'created_tip',
	GAVE_TIP = 'gave_tip',
	CREATED_BOUNTY = 'created_bounty',
	CREATED_CHILD_BOUNTY = 'created_child_bounty',
	CLAIMED_BOUNTY = 'claimed_bounty',
	SIGNED_UP_FOR_IDENTITY_VERIFICATION = 'signed_up_for_identity_verification',
	APPROVED_BOUNTY = 'approved_bounty',
	VERIFIED_IDENTITY = 'verified_identity',
	COMPLETED_IDENTITY_JUDGEMENT = 'completed_identity_judgement',
	DELEGATED_VOTE = 'delegated_vote',
	RECEIVED_DELEGATION = 'received_delegation',
	PLACED_DECISION_DEPOSIT = 'placed_decision_deposit',
	REMOVED_VOTE = 'removed_vote',
	REDUCED_CONVICTION = 'reduced_conviction',
	REDUCED_CONVICTION_AFTER_SIX_HOURS_OF_FIRST_VOTE = 'reduced_conviction_after_six_hours_of_first_vote',
	REMOVED_VOTE_AFTER_SIX_HOURS_OF_FIRST_VOTE = 'removed_vote_after_six_hours_of_first_vote',
	LOST_DUE_TO_SLASHING_TIP_OR_PROPOSAL = 'lost_due_to_slashing_tip_or_proposal',
	PROPOSAL_FAILED = 'proposal_failed',
	PROPOSAL_PASSED = 'proposal_passed',
	VOTE_PASSED = 'vote_passed',
	VOTE_FAILED = 'vote_failed',

	// Off-chain Activities
	QUIZ_ANSWERED_CORRECTLY = 'quiz_answered_correctly',
	REACTED_TO_POST = 'reacted_to_post',
	REACTED_TO_COMMENT = 'reacted_to_comment',
	COMMENTED_ON_POST = 'commented_on_post',
	DELETED_COMMENT = 'deleted_comment',
	REPLIED_TO_COMMENT = 'replied_to_comment',
	CREATED_OFFCHAIN_POST = 'created_offchain_post',
	LINKED_DISCUSSION = 'linked_discussion',
	TOOK_QUIZ = 'took_quiz',
	UPDATED_PROFILE = 'updated_profile',
	REPORTED_CONTENT = 'reported_content',
	RECEIVED_REPORT = 'received_report',
	RECEIVED_SPAM_REPORT = 'received_spam_report',
	REMOVED_CONTENT = 'removed_content',
	RECEIVED_LIKE_ON_DISCUSSION = 'received_like_on_discussion',
	RECEIVED_LIKE_ON_COMMENT = 'received_like_on_comment',
	DELETED_REACTION = 'deleted_reaction',
	ADDED_CONTEXT_TO_PROPOSAL = 'added_context_to_proposal',
	ADDED_PROFILE_PICTURE = 'added_profile_picture',
	ADDED_BIO = 'added_bio',
	ADDED_PROFILE_TITLE = 'added_profile_title',
	ADDED_PROFILE_TAGS = 'added_profile_tags',
	COMMENT_TAKEN_DOWN = 'comment_taken_down',
	POST_TAKEN_DOWN = 'post_taken_down',
	POST_MARKED_AS_SPAM = 'post_marked_as_spam',
	LINKED_ADDRESS = 'linked_address',
	LINKED_MULTIPLE_ADDRESSES = 'linked_multiple_addresses',
	UNLINKED_ADDRESS = 'unlinked_address',
	UNLINKED_MULTIPLE_ADDRESSES = 'unlinked_multiple_addresses',
	FOLLOWED_USER = 'followed_user',
	UNFOLLOWED_USER = 'unfollowed_user'
}

export enum EActivityCategory {
	ON_CHAIN = 'on_chain',
	OFF_CHAIN = 'off_chain'
}

export interface IActivityMetadata {
	// For votes
	decision?: EVoteDecision;
	conviction?: number;

	// For reactions
	reaction?: EReaction;

	// For comments
	commentId?: string;
	parentCommentId?: string;

	// For reports
	reportReason?: string;
	reportedByUserId?: number;

	// For profile updates
	field?: string;

	// For likes received
	likeCount?: number;

	// For delegations
	delegatedToAddress?: string;
	delegatedFromAddress?: string;

	// For quiz
	score?: number;

	// For bounties/tips
	amount?: string;
	beneficiaryAddress?: string;

	// for identity and link address
	address?: string;

	// for follow/unfollow
	userId?: number;
}

export interface IUserActivity {
	id: string;
	userId: number;
	name: EActivityName;
	subActivityName?: EActivityName;
	category: EActivityCategory;
	network?: ENetwork; // optional for profile activities
	proposalType?: EProposalType;
	indexOrHash?: string;
	metadata?: IActivityMetadata;
	createdAt: Date;
	updatedAt: Date;
	message?: string;
}

export interface IVoteCurve {
	id: string;
	index: number;
	block: number;
	timestamp: string;
	approvalPercent: number;
	supportPercent: number;
}

export enum EProfileTabs {
	OVERVIEW = 'overview',
	ACTIVITY = 'activity',
	ACCOUNTS = 'accounts',
	SETTINGS = 'settings'
}

export interface IPreimage {
	createdAt: string;
	createdAtBlock: number;
	deposit: string;
	hash: string;
	id: string;
	length: number;
	method: string;
	proposedCall: {
		args: Record<string, unknown>;
		description: string;
		method: string;
		section: string;
	};
	proposer: string;
	section: string;
	status: string;
	updatedAt: string;
	updatedAtBlock: number | null;
}

export interface IQRSessionPayload {
	sessionId: string;
	timestamp: number;
	expiresIn: number;
}

export enum EAppEnv {
	PRODUCTION = 'production',
	DEVELOPMENT = 'development'
}

export interface IFollowEntry {
	id: string;
	createdAt: Date;
	followerUserId: number;
	followedUserId: number;
	updatedAt: Date;
}

export enum ESidebarState {
	EXPANDED = 'expanded',
	COLLAPSED = 'collapsed'
}

export enum EConvictionAmount {
	ZERO = 0,
	ONE = 1,
	TWO = 2,
	THREE = 3,
	FOUR = 4,
	FIVE = 5,
	SIX = 6
}

export interface IVoteCartItem {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	userId: number;
	postIndexOrHash: string;
	proposalType: EProposalType;
	network: ENetwork;
	decision: EVoteDecision;
	amount: {
		abstain?: string;
		aye?: string;
		nay?: string;
	};
	conviction: EConvictionAmount;
	title?: string;
}

export interface IPostSubscription {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	network: ENetwork;
	indexOrHash: string;
	proposalType: EProposalType;
	userId: number;
}
