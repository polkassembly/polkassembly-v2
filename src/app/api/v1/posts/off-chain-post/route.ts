// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/app/api/_api-utils/withErrorHandling';
import { EAllowedCommentor, ECommentSentiment, ICommentResponse } from '@/_shared/types';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { headers } from 'next/headers';
import { OffChainDbService } from '@/app/api/_api-services/offchain_db_service';
import { fetchPostData } from '../../../_api-utils/fetchPostData';
import { EV1ProposalType, IOffChainPost } from '../../_v1_api-utils/types';
import { handleReactions, v1ToV2ProposalType } from '../../_v1_api-utils/utils';

export const GET = withErrorHandling(async (req: NextRequest) => {
	const zodQuerySchema = z.object({
		postId: z.string(),
		proposalType: z.nativeEnum(EV1ProposalType).transform(v1ToV2ProposalType).default(EV1ProposalType.DISCUSSIONS),
		noComments: z.coerce.boolean().optional().default(false)
	});

	const searchParamsObject = Object.fromEntries(Array.from(req.nextUrl.searchParams.entries()).map(([key, value]) => [key, value]));

	const { postId, proposalType, noComments } = zodQuerySchema.parse(searchParamsObject);

	const [network] = await Promise.all([getNetworkFromHeaders(), headers()]);

	let post = await fetchPostData({
		network,
		proposalType,
		indexOrHash: postId
	});

	const reactions = await OffChainDbService.GetPostReactions({ network, proposalType, indexOrHash: postId });
	post = { ...post, reactions };

	let comments: ICommentResponse[] = [];
	if (!noComments) {
		comments = await OffChainDbService.GetPostComments({ network, proposalType, indexOrHash: postId });
	}

	const updatedPost: IOffChainPost = {
		comments_count: post.metrics?.comments || 0,
		created_at: post.createdAt || new Date(),
		isSpam: false,
		isSpamDetected: false,
		isSpamReportInvalid: false,
		post_id: post.index || 0,
		post_reactions: handleReactions(post.reactions || []),
		proposer: post.publicUser?.addresses[0] || '',
		spam_users_count: 0,
		tags: post.tags?.map((tag) => tag.value) || [],
		title: post.title || '',
		topic: post.topic ? Number(post.topic) : 0,
		user_id: post.publicUser?.id || 0,
		username: post.publicUser?.username || '',
		content: post.content || '',
		history: [],
		allowedCommentors: post.allowedCommentor || EAllowedCommentor.ALL,
		comments:
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
			}) || [],
		post_link: null,
		post_type: proposalType,
		updated_at: post.updatedAt || new Date(),
		timeline: []
	};

	return NextResponse.json(updatedPost);
});
