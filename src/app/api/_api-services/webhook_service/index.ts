// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { z } from 'zod';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { EAllowedCommentor, ENetwork, EOffChainPostTopic, EProposalType } from '@/_shared/types';
import { TOOLS_PASSPHRASE } from '../../_api-constants/apiEnvVars';
import { APIError } from '../../_api-utils/apiError';
import { updatePostServer } from '../../_api-utils/updatePostServer';
import { RedisService } from '../redis_service';
import { OffChainDbService } from '../offchain_db_service';
import { FirestoreService } from '../offchain_db_service/firestore_service';

if (!TOOLS_PASSPHRASE) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'TOOLS_PASSPHRASE is not set');
}

enum EWebhookEvent {
	OFF_CHAIN_POST_CREATED = 'off_chain_post_created',
	POST_EDITED = 'post_edited',
	POST_DELETED = 'post_deleted',
	PROPOSAL_CREATED = 'proposal_created',
	PROPOSAL_ENDED = 'proposal_ended',
	VOTED = 'voted',
	BOUNTY_CLAIMED = 'bounty_claimed',
	DECISION_DEPOSIT_PLACED = 'decision_deposit_placed',
	REMOVED_VOTE = 'removed_vote',
	TIPPED = 'tipped',
	DELEGATED = 'delegated',
	UNDELEGATED = 'undelegated'
}

// TODO: add handling for on-chain reputation scores

export class WebhookService {
	private static readonly zodParamsSchema = z.object({
		webhookEvent: z.nativeEnum(EWebhookEvent)
	});

	private static readonly zodEventBodySchemas = {
		[EWebhookEvent.OFF_CHAIN_POST_CREATED]: z.object({
			index: z.number().min(0, 'Index is required'),
			title: z.string().min(1, 'Title is required'),
			content: z.string().min(1, 'Content is required'),
			authorId: z.number().refine((authorId) => ValidatorService.isValidUserId(authorId), 'Not a valid author ID'),
			allowedCommentor: z.nativeEnum(EAllowedCommentor).optional().default(EAllowedCommentor.ALL),
			topic: z.nativeEnum(EOffChainPostTopic).optional().default(EOffChainPostTopic.GENERAL)
		}),
		[EWebhookEvent.POST_EDITED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType),
			title: z.string().min(1, 'Title is required'),
			content: z.string().min(1, 'Content is required'),
			authorId: z.number().refine((authorId) => ValidatorService.isValidUserId(authorId), 'Not a valid author ID'),
			allowedCommentor: z.nativeEnum(EAllowedCommentor).optional().default(EAllowedCommentor.ALL)
			// TODO: add support for tags and linked post
		}),
		[EWebhookEvent.POST_DELETED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.PROPOSAL_CREATED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.PROPOSAL_ENDED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.VOTED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.BOUNTY_CLAIMED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.DECISION_DEPOSIT_PLACED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.REMOVED_VOTE]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.TIPPED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.DELEGATED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.UNDELEGATED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		})
	} as const;

	static async handleIncomingEvent({ event, body, network }: { event: string; body: unknown; network: ENetwork }) {
		const { webhookEvent } = this.zodParamsSchema.parse({ webhookEvent: event });
		const params = this.zodEventBodySchemas[webhookEvent as EWebhookEvent].parse(body);

		switch (webhookEvent) {
			case EWebhookEvent.OFF_CHAIN_POST_CREATED:
				return this.handleOffChainPostCreated({ network, params: params as z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.OFF_CHAIN_POST_CREATED]> });
			case EWebhookEvent.POST_EDITED:
				return this.handlePostEdited({ network, params: params as z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.POST_EDITED]> });
			case EWebhookEvent.POST_DELETED:
				return this.handlePostDeleted({ network, params: params as z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.POST_DELETED]> });
			case EWebhookEvent.PROPOSAL_CREATED:
			case EWebhookEvent.PROPOSAL_ENDED:
				return this.handleProposalStatusChanged({
					network,
					params: params as z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.PROPOSAL_CREATED | EWebhookEvent.PROPOSAL_ENDED]>
				});
			case EWebhookEvent.VOTED:
			case EWebhookEvent.BOUNTY_CLAIMED:
			case EWebhookEvent.DECISION_DEPOSIT_PLACED:
			case EWebhookEvent.REMOVED_VOTE:
			case EWebhookEvent.TIPPED:
			case EWebhookEvent.DELEGATED:
			case EWebhookEvent.UNDELEGATED:
				return this.handleOtherEvent({ network, params });
			default:
				throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, `Unsupported event: ${event}`);
		}
	}

	private static async handleOffChainPostCreated({
		network,
		params
	}: {
		network: ENetwork;
		params: z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.OFF_CHAIN_POST_CREATED]>;
	}) {
		const { index, title, content, authorId, allowedCommentor, topic } = params;

		await FirestoreService.CreatePost({
			network,
			proposalType: EProposalType.DISCUSSION,
			userId: authorId,
			content,
			title,
			allowedCommentor,
			tags: [],
			topic,
			indexOrHash: index.toString()
		});
	}

	private static async handlePostEdited({ network, params }: { network: ENetwork; params: z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.POST_EDITED]> }) {
		const { indexOrHash, content, authorId, proposalType, title, allowedCommentor } = params;

		await updatePostServer({ network, proposalType, indexOrHash, content, title, allowedCommentor, userId: authorId });
	}

	private static async handlePostDeleted({ network, params }: { network: ENetwork; params: z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.POST_DELETED]> }) {
		const { indexOrHash, proposalType } = params;

		await OffChainDbService.DeleteOffChainPost({ network, proposalType, indexOrHash });

		// Invalidate caches
		await RedisService.DeletePostData({ network, proposalType, indexOrHash });
		await RedisService.DeletePostsListing({ network, proposalType });
		await RedisService.DeleteActivityFeed({ network });
		await RedisService.DeleteContentSummary({ network, indexOrHash, proposalType });
	}

	private static async handleProposalStatusChanged({
		network,
		params
	}: {
		network: ENetwork;
		params: z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.PROPOSAL_CREATED | EWebhookEvent.PROPOSAL_ENDED]>;
	}) {
		const { indexOrHash, proposalType } = params;

		// Invalidate caches
		await RedisService.DeletePostData({ network, proposalType, indexOrHash });
		await RedisService.DeletePostsListing({ network, proposalType });
		await RedisService.DeleteActivityFeed({ network });
		await RedisService.DeleteAllSubscriptionFeedsForNetwork(network);
		await RedisService.DeleteDelegationStats(network);
	}

	private static async handleOtherEvent({ network, params }: { network: ENetwork; params: unknown }) {
		console.log('TODO: add handling for event ', { network, params });
	}
}
