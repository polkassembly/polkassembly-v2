// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECommentSentiment, EProposalType, EReaction, ICommentResponse, IPost, IReaction } from '@/_shared/types';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { EV1ProposalType, IReactionType } from './types';
import { APIError } from '../../_api-utils/apiError';

export function v1ToV2ProposalType(proposalType: EV1ProposalType): EProposalType {
	switch (proposalType) {
		case EV1ProposalType.DEMOCRACY_PROPOSALS:
			return EProposalType.DEMOCRACY_PROPOSAL;
		case EV1ProposalType.TECH_COMMITTEE_PROPOSALS:
			return EProposalType.TECH_COMMITTEE_PROPOSAL;
		case EV1ProposalType.TREASURY_PROPOSALS:
			return EProposalType.TREASURY_PROPOSAL;
		case EV1ProposalType.REFERENDUMS:
			return EProposalType.REFERENDUM;
		case EV1ProposalType.FELLOWSHIP_REFERENDUMS:
			return EProposalType.FELLOWSHIP_REFERENDUM;
		case EV1ProposalType.COUNCIL_MOTIONS:
			return EProposalType.COUNCIL_MOTION;
		case EV1ProposalType.BOUNTIES:
			return EProposalType.BOUNTY;
		case EV1ProposalType.TIPS:
			return EProposalType.TIP;
		case EV1ProposalType.CHILD_BOUNTIES:
			return EProposalType.CHILD_BOUNTY;
		case EV1ProposalType.OPEN_GOV:
		case EV1ProposalType.REFERENDUM_V2:
			return EProposalType.REFERENDUM_V2;
		case EV1ProposalType.DISCUSSIONS:
			return EProposalType.DISCUSSION;
		case EV1ProposalType.GRANTS:
			return EProposalType.GRANT;
		case EV1ProposalType.ANNOUNCEMENT:
			return EProposalType.ANNOUNCEMENT;
		case EV1ProposalType.ALLIANCE_MOTION:
			return EProposalType.ALLIANCE_MOTION;
		case EV1ProposalType.TECHNICAL_PIPS:
			return EProposalType.TECHNICAL_COMMITTEE;
		case EV1ProposalType.UPGRADE_PIPS:
			return EProposalType.UPGRADE_COMMITTEE;
		case EV1ProposalType.COMMUNITY_PIPS:
			return EProposalType.COMMUNITY;
		case EV1ProposalType.ADVISORY_COMMITTEE:
			return EProposalType.ADVISORY_COMMITTEE;
		case EV1ProposalType.USER_CREATED_BOUNTIES:
			return EProposalType.BOUNTY;
		default:
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid proposal type');
	}
}

export const handleReactions = (reactions: IReaction[]) => {
	const updatedReactions: IReactionType = {
		'👍': {
			count: 0,
			userIds: [],
			usernames: []
		},
		'👎': {
			count: 0,
			userIds: [],
			usernames: []
		}
	};
	reactions.forEach((reaction) => {
		if (reaction.reaction === EReaction.like) {
			updatedReactions['👍'].count += 1;
		} else if (reaction.reaction === EReaction.dislike) {
			updatedReactions['👎'].count += 1;
		}
	});
	return updatedReactions;
};

export const getUpdatedComments = (comments: ICommentResponse[], post: IPost, proposalType: EProposalType, includeSubsquareComments: boolean) => {
	let updatedComments =
		comments?.map((comment) => {
			return {
				comment_reactions: handleReactions(comment.reactions || []),
				comment_source: comment?.dataSource || 'polkassembly',
				content: comment.content,
				created_at: comment.createdAt || new Date(),
				history: [],
				id: comment.id,
				isExpertComment: false,
				is_custom_username: false,
				post_index: post.index || 0,
				post_type: proposalType,
				proposer: comment?.publicUser?.addresses[0] || '',
				user_id: comment?.publicUser?.id || 0,
				username: comment?.publicUser?.username || '',
				sentiment: comment.sentiment || ECommentSentiment.NEUTRAL,
				spam_users_count: 0,
				profile: {
					achievement_badges: [],
					badges: [],
					social_links: [],
					bio: '',
					cover_image: '',
					email: '',
					image: '',
					title: ''
				},
				replies:
					comment?.children?.map((child) => {
						return {
							comment_reactions: handleReactions(child.reactions || []),
							comment_source: child?.dataSource || 'polkassembly',
							content: child.content,
							created_at: child.createdAt || new Date(),
							history: [],
							id: child.id,
							isExpertComment: false,
							is_custom_username: false,
							post_index: post.index || 0,
							post_type: proposalType,
							proposer: child?.publicUser?.addresses[0] || '',
							sentiment: child.sentiment || ECommentSentiment.NEUTRAL,
							spam_users_count: 0,
							user_id: child?.publicUser?.id || 0,
							username: child?.publicUser?.username || '',
							profile: {
								achievement_badges: [],
								badges: [],
								social_links: [],
								bio: '',
								cover_image: '',
								email: '',
								image: '',
								title: ''
							}
						};
					}) || []
			};
		}) || [];
	if (!includeSubsquareComments) {
		updatedComments = updatedComments.filter((comment) => comment.comment_source !== 'subsquare');
	}
	return updatedComments;
};
