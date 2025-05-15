// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EAllowedCommentor, ECommentSentiment, EProposalType, IStatusHistoryItem } from '@/_shared/types';

export enum EV1ProposalType {
	DEMOCRACY_PROPOSALS = 'democracy_proposals',
	TECH_COMMITTEE_PROPOSALS = 'tech_committee_proposals',
	TREASURY_PROPOSALS = 'treasury_proposals',
	REFERENDUMS = 'referendums',
	FELLOWSHIP_REFERENDUMS = 'fellowship_referendums',
	COUNCIL_MOTIONS = 'council_motions',
	BOUNTIES = 'bounties',
	TIPS = 'tips',
	CHILD_BOUNTIES = 'child_bounties',
	OPEN_GOV = 'referendums_v2',
	REFERENDUM_V2 = 'referendums_v2',
	DISCUSSIONS = 'discussions',
	GRANTS = 'grants',
	ANNOUNCEMENT = 'announcement',
	ALLIANCE_MOTION = 'alliance_motion',
	TECHNICAL_PIPS = 'technical_pips',
	UPGRADE_PIPS = 'upgrade_pips',
	COMMUNITY_PIPS = 'community_pips',
	ADVISORY_COMMITTEE = 'advisory_committee',
	USER_CREATED_BOUNTIES = 'user_created_bounties'
}

export interface IReactionType {
	'👍': {
		count: number;
		userIds: number[];
		usernames: string[];
	};
	'👎': {
		count: number;
		userIds: number[];
		usernames: string[];
	};
}

export interface IOffChainPostsListing {
	comments_count: number;
	created_at: Date;
	gov_type: string | null;
	isSpam: boolean;
	isSpamDetected: boolean;
	isSpamReportInvalid: boolean;
	post_id: number;
	post_reactions: IReactionType;
	proposer: string;
	spam_users_count: number;
	tags: string[];
	title: string;
	topic: number | null;
	user_id: number;
	username: string;
}

export interface IComment {
	comment_reactions: IReactionType;
	comment_source: string;
	content: string;
	created_at: Date;
	history: {
		content: string;
		created_at: Date;
		title: string;
	}[];
	id: string;
	isExpertComment: boolean;
	is_custom_username: boolean;
	post_index: number;
	post_type: string;
	profile: {
		achievement_badges: string[];
		badges: string[];
		social_links: string[];
		bio: string;
		cover_image: string;
		email: string;
		image: string;
		title: string;
	};
	proposer: string;
	replies?: IComment[];
	sentiment: ECommentSentiment;
	spam_users_count: number;
	user_id: number;
	username: string;
}

export interface IOffChainPost {
	comments_count: number;
	created_at: Date;
	gov_type?: string | null;
	isSpam: boolean;
	isSpamDetected: boolean;
	isSpamReportInvalid: boolean;
	post_id: number;
	post_reactions: IReactionType;
	proposer: string;
	spam_users_count: number;
	tags: string[];
	title: string;
	topic: number | null;
	user_id: number;
	username: string;
	content: string;
	history: {
		content: string;
		created_at: Date;
		title: string;
	}[];
	allowedCommentors: EAllowedCommentor;
	comments: IComment[];
	post_link: string | null;
	post_type: EProposalType;
	updated_at: Date;
	timeline: {
		created_at: Date;
		index: number;
		statuses: {
			status: string;
			timestamp: Date;
		}[];
		type: string;
	}[];
}

export interface IBeneficiary {
	address: string;
	amount: string;
	genralIndex: string | null;
}

export interface IOnChainPost {
	comments_count: number;
	created_at: Date;
	post_id: number;
	post_reactions: IReactionType;
	proposer: string;
	beneficiaries: IBeneficiary[];
	statusHistory: IStatusHistoryItem[];
	proposal_arguments: unknown;
	tags: string[];
	title: string;
	topic?: number | null;
	user_id: number;
	username: string;
	content: string;
	history: {
		content: string;
		created_at: Date;
		title: string;
	}[];
	allowedCommentors: EAllowedCommentor;
	comments: IComment[];
	post_link: string | null;
	post_type: EProposalType;
	updated_at: Date;
	timeline: {
		created_at: Date;
		index: number;
		statuses: {
			status: string;
			timestamp: Date;
		}[];
		type: string;
	}[];
	assetId: string | null;
	bond: string | null;
	curator: string | null;
	curator_deposit: string | null;
	dataSource: string;
	deciding: {
		confirming: number | null;
		since: number;
	} | null;
	decision_deposit_amount: string;
	delay: number | null;
	deposit: string | null;
	description: string | null;
	enactment_after_block: number | null;
	enactment_at_block: number | null;
	end: string | null;
	ended_at: string | null;
	fee: string | null;
	hash: string;
	identity: unknown | null;
	last_edited_at: string | null;
	markdownContent: string;
	method: string;
	origin: string;
	payee: string | null;
	pips_voters: unknown[];
	preimageHash: string;
	proposalHashBlock: string | null;
	proposed_call: {
		method: string;
		args: unknown;
		description?: string;
		section?: string;
	};
	requested?: string;
	reward: string | null;
	status: string;
	submission_deposit_amount: string;
	submitted_amount: string;
	subscribers: number[];
	tally: {
		ayes: string;
		bareAyes: string | null;
		nays: string;
		support: string;
	};
	track_number: number;
	type: string;
	progress_report: unknown[];
}
