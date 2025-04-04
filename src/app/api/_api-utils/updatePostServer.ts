// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '@/_shared/_services/validator_service';
import { EAllowedCommentor, ENetwork, EProposalType } from '@/_shared/types';
import { AIService } from '../_api-services/ai_service';
import { OffChainDbService } from '../_api-services/offchain_db_service';
import { RedisService } from '../_api-services/redis_service';

export async function updatePostServer({
	network,
	proposalType,
	indexOrHash,
	content,
	title,
	allowedCommentor,
	userId
}: {
	network: ENetwork;
	proposalType: EProposalType;
	indexOrHash: string;
	content: string;
	title: string;
	allowedCommentor: EAllowedCommentor;
	userId: number;
}) {
	if (ValidatorService.isValidOffChainProposalType(proposalType)) {
		await OffChainDbService.UpdateOffChainPost({
			network,
			indexOrHash,
			proposalType,
			userId,
			content,
			title,
			allowedCommentor
		});
	} else {
		await OffChainDbService.UpdateOnChainPost({
			network,
			indexOrHash,
			proposalType,
			userId,
			content,
			title,
			allowedCommentor
		});
	}

	await AIService.UpdatePostSummary({ network, proposalType, indexOrHash });

	// Invalidate caches
	await RedisService.DeletePostData({ network, proposalType, indexOrHash });
	await RedisService.DeletePostsListing({ network, proposalType });
	await RedisService.DeleteContentSummary({ network, indexOrHash, proposalType });
}
