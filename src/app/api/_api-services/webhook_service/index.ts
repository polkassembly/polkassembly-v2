// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { z } from 'zod';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { EAllowedCommentor, ENetwork, EProposalType } from '@/_shared/types';
import { TOOLS_PASSPHRASE } from '../../_api-constants/apiEnvVars';
import { APIError } from '../../_api-utils/apiError';
import { updatePostServer } from '../../_api-utils/updatePostServer';
import { RedisService } from '../redis_service';

if (!TOOLS_PASSPHRASE) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'TOOLS_PASSPHRASE is not set');
}

enum EWebhookEvent {
	POST_EDITED = 'post_edited',
	PROPOSAL_STATUS_CHANGED = 'proposal_status_changed'
}

export class WebhookService {
	private static readonly zodParamsSchema = z.object({
		webhookEvent: z.nativeEnum(EWebhookEvent)
	});

	private static readonly zodEventBodySchemas = {
		[EWebhookEvent.POST_EDITED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), 'Not a valid index or hash'),
			proposalType: z.nativeEnum(EProposalType),
			title: z.string().min(1, 'Title is required'),
			content: z.string().min(1, 'Content is required'),
			authorId: z.number().refine((authorId) => ValidatorService.isValidUserId(authorId), 'Not a valid author ID'),
			allowedCommentor: z.nativeEnum(EAllowedCommentor).optional().default(EAllowedCommentor.ALL)
		}),
		[EWebhookEvent.PROPOSAL_STATUS_CHANGED]: z.object({
			indexOrHash: z.string().refine((indexOrHash) => ValidatorService.isValidIndexOrHash(indexOrHash), 'Not a valid index or hash'),
			proposalType: z.nativeEnum(EProposalType)
		})
	} as const;

	static async handleIncomingEvent({ event, body, network }: { event: string; body: unknown; network: ENetwork }) {
		const { webhookEvent } = this.zodParamsSchema.parse({ event });
		const params = this.zodEventBodySchemas[webhookEvent as EWebhookEvent].parse(body);

		// eslint-disable-next-line sonarjs/no-small-switch
		switch (webhookEvent) {
			case EWebhookEvent.POST_EDITED:
				return this.handlePostEdited({ network, params: params as z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.POST_EDITED]> });
			case EWebhookEvent.PROPOSAL_STATUS_CHANGED:
				return this.handleProposalStatusChanged({ network, params: params as z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.PROPOSAL_STATUS_CHANGED]> });
			default:
				throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, `Unsupported event: ${event}`);
		}
	}

	private static async handlePostEdited({ network, params }: { network: ENetwork; params: z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.POST_EDITED]> }) {
		const { indexOrHash, content, authorId, proposalType, title, allowedCommentor } = params;

		await updatePostServer({ network, proposalType, indexOrHash, content, title, allowedCommentor, userId: authorId });
	}

	private static async handleProposalStatusChanged({
		network,
		params
	}: {
		network: ENetwork;
		params: z.infer<(typeof WebhookService.zodEventBodySchemas)[EWebhookEvent.PROPOSAL_STATUS_CHANGED]>;
	}) {
		const { indexOrHash, proposalType } = params;

		// Invalidate caches
		await RedisService.DeletePostData({ network, proposalType, indexOrHash });
		await RedisService.DeletePostsListing({ network, proposalType });
		await RedisService.DeleteActivityFeed({ network });
		await RedisService.DeleteAllSubscriptionFeedsForNetwork(network);
		await RedisService.DeleteDelegationStats(network);
	}
}
