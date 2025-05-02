// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { z } from 'zod';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ENetwork, EProposalType } from '@/_shared/types';
import { TOOLS_PASSPHRASE } from '../../_api-constants/apiEnvVars';
import { APIError } from '../../_api-utils/apiError';
import { RedisService } from '../redis_service';

if (!TOOLS_PASSPHRASE) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'TOOLS_PASSPHRASE is not set');
}

// TODO: add hooks for user creation and settings update

enum EWebhookEvent {
	PROPOSAL_CREATED = 'proposal_created',
	PROPOSAL_ENDED = 'proposal_ended',
	VOTED = 'voted',
	BOUNTY_CLAIMED = 'bounty_claimed',
	DECISION_DEPOSIT_PLACED = 'decision_deposit_placed',
	REMOVED_VOTE = 'removed_vote',
	TIPPED = 'tipped',
	DELEGATED = 'delegated',
	UNDELEGATED = 'undelegated',
	PROPOSAL_STATUS_UPDATED = 'proposal_status_updated',
	CACHE_REFRESH = 'cache_refresh'
}

// TODO: add handling for on-chain reputation scores

export class WebhookService {
	private static readonly zodParamsSchema = z.object({
		webhookEvent: z.nativeEnum(EWebhookEvent)
	});

	private static readonly zodEventBodySchemas = {
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
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH)
		}),
		[EWebhookEvent.UNDELEGATED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH)
		}),
		[EWebhookEvent.PROPOSAL_STATUS_UPDATED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), ERROR_MESSAGES.INVALID_INDEX_OR_HASH),
			proposalType: z.nativeEnum(EProposalType)
		}),
		[EWebhookEvent.CACHE_REFRESH]: z.object({})
	} as const;

	static async handleIncomingEvent({ event, body, network }: { event: string; body: unknown; network: ENetwork }) {
		const { webhookEvent } = this.zodParamsSchema.parse({ webhookEvent: event });
		const params = this.zodEventBodySchemas[webhookEvent as EWebhookEvent].parse(body);

		switch (webhookEvent) {
			case EWebhookEvent.PROPOSAL_CREATED:
			case EWebhookEvent.PROPOSAL_ENDED:
			case EWebhookEvent.BOUNTY_CLAIMED:
			case EWebhookEvent.DECISION_DEPOSIT_PLACED:
			case EWebhookEvent.PROPOSAL_STATUS_UPDATED:
				return this.handleProposalStatusChanged({
					network,
					params: params as z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.PROPOSAL_STATUS_UPDATED]>
				});
			case EWebhookEvent.VOTED:
			case EWebhookEvent.REMOVED_VOTE:
			case EWebhookEvent.TIPPED:
			case EWebhookEvent.DELEGATED:
			case EWebhookEvent.UNDELEGATED:
				return this.handleOtherEvent({ network, params });
			case EWebhookEvent.CACHE_REFRESH:
				return this.handleCacheRefresh({ network });
			default:
				throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, `Unsupported event: ${event}`);
		}
	}

	private static async handleProposalStatusChanged({
		network,
		params
	}: {
		network: ENetwork;
		params: z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.PROPOSAL_STATUS_UPDATED]>;
	}) {
		const { indexOrHash, proposalType } = params;

		// Invalidate caches
		await Promise.all([
			RedisService.DeletePostData({ network, proposalType, indexOrHash }),
			RedisService.DeletePostsListing({ network, proposalType }),
			RedisService.DeleteActivityFeed({ network }),
			RedisService.DeleteAllSubscriptionFeedsForNetwork(network)
		]);
	}

	// refreshes caches for common endpoints and active proposals
	private static async handleCacheRefresh({ network }: { network: ENetwork }) {
		console.log('TODO: add handling for cache refresh', { network });
	}

	private static async handleOtherEvent({ network, params }: { network: ENetwork; params: unknown }) {
		console.log('TODO: add handling for event ', { network, params });
	}
}
