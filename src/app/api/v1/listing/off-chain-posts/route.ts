// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse, NextRequest } from 'next/server';

import { z } from 'zod';

import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { EProposalType, EReaction, IPostListing, IPublicUser } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { headers } from 'next/headers';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { IReactionType, IOffChainPostsListing } from '../../_v1_api-utils/types';

interface IGenericListingResponse<T> {
	posts: T[];
	count: number;
}

export const GET = withErrorHandling(async (req: NextRequest) => {
	const proposalType = EProposalType.DISCUSSION;

	const zodQuerySchema = z.object({
		page: z.coerce.number().optional().default(1),
		limit: z.coerce.number().max(MAX_LISTING_LIMIT).optional().default(DEFAULT_LISTING_LIMIT)
	});

	const searchParamsObject = Object.fromEntries(Array.from(req.nextUrl.searchParams.entries()).map(([key]) => [key, req.nextUrl.searchParams.getAll(key)]));

	const { page, limit } = zodQuerySchema.parse(searchParamsObject);

	const [network] = await Promise.all([getNetworkFromHeaders(), headers()]);

	let posts: IPostListing[] = [];
	let totalCount = 0;

	posts = await OffChainDbService.GetOffChainPostsListing({
		network,
		proposalType,
		limit,
		page
	});

	totalCount = await OffChainDbService.GetTotalOffChainPostsCount({ network, proposalType });

	const publicUserPromises = posts.map((post) => {
		if (ValidatorService.isValidUserId(Number(post.userId || -1))) {
			return OffChainDbService.GetPublicUserById(Number(post.userId));
		}
		if (post.onChainInfo?.proposer && ValidatorService.isValidWeb3Address(post.onChainInfo?.proposer || '')) {
			return OffChainDbService.GetPublicUserByAddress(post.onChainInfo.proposer);
		}
		return null;
	});

	const publicUsers = await Promise.all(publicUserPromises);

	posts = posts.map((post, index) => ({
		...post,
		...(publicUsers?.[Number(index)] ? { publicUser: publicUsers[Number(index)] as IPublicUser } : {})
	}));

	const updatedPosts: IOffChainPostsListing[] = posts.map((post) => {
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
		if (post.reactions && post.reactions.length > 0) {
			post.reactions.forEach((reaction) => {
				if (reaction.reaction === EReaction.like) {
					updatedReactions['👍'].count += 1;
				} else if (reaction.reaction === EReaction.dislike) {
					updatedReactions['👎'].count += 1;
				}
			});
		}

		return {
			comments_count: post.metrics?.comments || 0,
			created_at: post.createdAt || new Date(),
			gov_type: null,
			isSpam: false,
			isSpamDetected: false,
			isSpamReportInvalid: false,
			post_id: post.index || 0,
			post_reactions: updatedReactions,
			proposer: post.publicUser?.addresses[0] || '',
			spam_users_count: 0,
			tags: post.tags?.map((tag) => tag.value) || [],
			title: post.title || '',
			topic: null,
			user_id: post.publicUser?.id || 0,
			username: post.publicUser?.username || ''
		};
	});

	const response: IGenericListingResponse<IOffChainPostsListing> = {
		posts: updatedPosts || [],
		count: totalCount || 0
	};

	return NextResponse.json(response);
});
