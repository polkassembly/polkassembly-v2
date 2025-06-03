// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DocumentData } from 'firebase-admin/firestore';
import dayjs from 'dayjs';
import * as logger from 'firebase-functions/logger';
import { initAlgoliaApi } from './initAlgoliaApi';
import { markdownToPlainText } from './markdownToText';
import { IAlgoliaPost } from '../types';
import { ALGOLIA_MAX_RECORD_SIZE } from '../constants';

// Interface for the API response containing post details
interface IPostApiResponse {
	onChainInfo?: {
		proposer: string;
		origin: string;
	};
}

// Function to calculate the size of an object in bytes
function getObjectSizeInBytes(obj: Record<string, unknown>): number {
	return new TextEncoder().encode(JSON.stringify(obj)).length;
}

// Function to truncate parsedContent to fit within Algolia size limits
function truncateContentToFitLimit(post: IAlgoliaPost): IAlgoliaPost {
	let currentSize = getObjectSizeInBytes(post);

	if (currentSize <= ALGOLIA_MAX_RECORD_SIZE) {
		return post;
	}

	logger.info(`Post ${post.objectID} size (${currentSize} bytes) exceeds Algolia limit. Truncating parsedContent...`);

	// Create a copy of the post to modify
	const truncatedPost = { ...post };

	// Start with the full parsedContent and gradually reduce it
	let content = truncatedPost.parsedContent;

	while (currentSize > ALGOLIA_MAX_RECORD_SIZE && content.length > 0) {
		// Reduce content by 10% each iteration, but at least by 100 characters
		const reductionAmount = Math.max(Math.floor(content.length * 0.1), 100);
		content = content.substring(0, content.length - reductionAmount);

		// Try to cut at word boundary if possible
		const lastSpaceIndex = content.lastIndexOf(' ');
		if (lastSpaceIndex > content.length * 0.8) {
			content = content.substring(0, lastSpaceIndex);
		}

		// Update the post with truncated content
		truncatedPost.parsedContent = content + (content.length < post.parsedContent.length ? '...' : '');
		currentSize = getObjectSizeInBytes(truncatedPost);
	}

	logger.info(`Post ${post.objectID} truncated from ${post.parsedContent.length} to ${truncatedPost.parsedContent.length} characters. New size: ${currentSize} bytes`);

	return truncatedPost;
}

export const updatePostAlgolia = async (post?: DocumentData): Promise<void> => {
	if (!post || post.isDeleted) {
		return;
	}

	const client = initAlgoliaApi();

	const parsedContent = markdownToPlainText(post.content);

	const tags = post.tags ? post.tags.map((tag: string | { value: string }) => (typeof tag === 'string' ? tag : tag.value)) : [];

	// Fetch post details from API to get proposer and origin
	let proposer = '';
	let origin = '';

	if (post.proposalType && post.index !== undefined && post.network) {
		try {
			const apiUrl = `https://${post.network}.polkassembly.io/api/v2/${post.proposalType}/${post.index}`;
			const response = await fetch(apiUrl);

			if (response.ok) {
				const postData: IPostApiResponse = await response.json();
				if (postData.onChainInfo) {
					proposer = postData.onChainInfo.proposer || '';
					origin = postData.onChainInfo.origin || '';
				}
			} else {
				logger.warn(`Failed to fetch post details from API for ${post.proposalType}/${post.index}: ${response.status}`);
			}
		} catch (error) {
			logger.error(`Error fetching post details from API for ${post.proposalType}/${post.index}:`, error);
		}
	}

	const algoliaPost: IAlgoliaPost = {
		objectID: post.id,
		title: post.title,
		...(post.createdAt && { createdAtTimestamp: dayjs(post.createdAt.toDate()).unix() }),
		...(post.updatedAt && { updatedAtTimestamp: dayjs(post.updatedAt.toDate()).unix() }),
		tags,
		dataSource: post.dataSource,
		proposalType: post.proposalType,
		network: post.network,
		topic: post.topic,
		...(post.lastCommentAt && { lastCommentAtTimestamp: dayjs(post.lastCommentAt.toDate()).unix() }),
		userId: post.userId,
		hash: post.hash,
		index: post.index,
		parsedContent,
		titleAndContentHash: '',
		...(proposer && { proposer }),
		...(origin && { origin })
	};

	// Truncate content if the object is too large for Algolia
	const truncatedPost = truncateContentToFitLimit(algoliaPost);

	await client.saveObject({
		indexName: 'polkassembly_v2_posts',
		body: truncatedPost
	});
};
